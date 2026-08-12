import http from 'http';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { transformSync } from 'esbuild';

const sdkPath = pathToFileURL(path.resolve('./node_modules/@base44/sdk/dist/index.js')).href;
const zodPath = pathToFileURL(path.resolve('./node_modules/zod/index.js')).href;

function loadHelperDataUrl(relPath) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return '';
  let code = fs.readFileSync(fullPath, 'utf-8');
  code = code.replace(/npm:@base44\/sdk@[^\s'"]+/g, sdkPath);
  code = code.replace(/npm:zod/g, zodPath);
  code = code.replace(/["']zod["']/g, `'${zodPath}'`);
  const transformed = transformSync(code, {
    loader: 'ts',
    format: 'esm',
    target: 'esnext'
  });
  return `data:text/javascript;base64,${Buffer.from(transformed.code).toString('base64')}`;
}

const mapperPath = loadHelperDataUrl('./base44/shared/lessonMapper.ts');
const evaluatorPath = loadHelperDataUrl('./base44/shared/lessonCompletenessEvaluator.ts');
const masteryEnginePath = loadHelperDataUrl('./base44/shared/masteryEngine.ts');
const blockPromptRegistryPath = loadHelperDataUrl('./base44/shared/blockPromptRegistry.ts');

export function loadFunction(funcPath) {
  const fullPath = path.resolve(funcPath);
  let code = fs.readFileSync(fullPath, 'utf-8');

  code = code.replace(/npm:@base44\/sdk@[^\s'"]+/g, sdkPath);
  code = code.replace(/npm:zod/g, zodPath);
  code = code.replace(/["']zod["']/g, `'${zodPath}'`);
  code = code.replace(/["']\.\.\/\.\.\/shared\/lessonMapper\.ts["']/g, `'${mapperPath}'`);
  code = code.replace(/["']\.\.\/\.\.\/shared\/lessonCompletenessEvaluator\.ts["']/g, `'${evaluatorPath}'`);
  code = code.replace(/["']\.\.\/\.\.\/shared\/masteryEngine\.ts["']/g, `'${masteryEnginePath}'`);
  code = code.replace(/["']\.\.\/\.\.\/shared\/blockPromptRegistry\.ts["']/g, `'${blockPromptRegistryPath}'`);
  if (code.includes('Deno.serve(')) {
    code = code.replace(/Deno\.serve\s*\(/, 'export default (');
  }

  const transformed = transformSync(code, {
    loader: 'ts',
    format: 'esm',
    target: 'esnext'
  });

  const dataUrl = `data:text/javascript;base64,${Buffer.from(transformed.code).toString('base64')}`;
  return import(dataUrl);
}

export class Base44TestServer {
  constructor() {
    this.db = {};
    this.server = null;
    this.port = 0;
    this.simulatedLLMFailure = null;
  }

  resetDb() {
    this.db = {
      User: [],
      Lesson: [],
      LessonVersion: [],
      LessonBlock: [],
      Assessment: [],
      QuestionBank: [],
      QuestionOption: [],
      Topic: [],
      Subject: [],
      LessonContent: [],
      LessonNotes: [],
      MindMap: [],
      FeedbackMessage: [],
      CommonMistake: [],
      AIExplanation: [],
      Quiz: [],
      Flashcard: [],
      LearningActivity: [],
      TeacherGuide: [],
      AIContentRequest: [],
      CurriculumStandard: [],
      QuizAttempt: [],
      Wallet: [],
      Progress: [],
      ActivityLog: [],
      RewardRule: []
    };
    this.simulatedLLMFailure = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.resetDb();
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(0, '127.0.0.1', () => {
        this.port = this.server.address().port;
        resolve(`http://127.0.0.1:${this.port}`);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  handleRequest(req, res) {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const pathname = urlObj.pathname;
        const method = req.method;

        // 1. Auth Me endpoint
        if (pathname.endsWith('/entities/User/me')) {
          const auth = req.headers['authorization'] || '';
          if (auth.startsWith('Bearer admin')) {
            return this.sendJson(res, 200, { id: 'usr_admin', role: 'admin', is_admin: true, email: 'admin@test.com' });
          } else if (auth.startsWith('Bearer ') && auth.length > 7) {
            const userId = auth.replace('Bearer ', '');
            return this.sendJson(res, 200, { id: userId, role: 'student', is_admin: false, email: `${userId}@test.com` });
          } else {
            return this.sendJson(res, 401, { error: 'Unauthorized' });
          }
        }

        // 2. Integration LLM endpoint
        if (pathname.includes('/integration-endpoints/')) {
          if (this.simulatedLLMFailure === 'MALFORMED_BLOCK_COUNT') {
            return this.sendJson(res, 200, {
              lesson_title: "Malformed Lesson",
              sp_code: "1.1.1",
              blocks: [
                { id: "b1", order_index: 1, phase: "ENGAGEMENT", type: "TEXT_MARKDOWN", title: "Only 1 block", content: { markdown: "Malformed" } }
              ],
              assessment: [],
              gamification: { xp_reward: 50, coin_reward: 10, mission_completion_message: "OK", suku_encouragement: "OK" }
            });
          }
          if (this.simulatedLLMFailure === 'MALFORMED_BLOCK_PAYLOAD') {
            const malformedBlocks = [
              { id: "b1", order_index: 1, phase: "ENGAGEMENT", type: "TEXT_MARKDOWN", title: "Block 1", content: { markdown: "Valid markdown" } },
              { id: "b2", order_index: 2, phase: "ENGAGEMENT", type: "VISUAL_CARD", title: "Block 2", content: { image_prompt: "Valid prompt" } },
              { id: "b3", order_index: 3, phase: "ENGAGEMENT", type: "AUDIO_HOOK", title: "Block 3", content: { audio_script: "Valid script" } },
              { id: "b4", order_index: 4, phase: "CONCEPT", type: "MIND_MAP", title: "Block 4", content: { nodes: [{ id: "n1", label: "Node 1", children: [] }] } },
              // Block 5 has EMPTY content object which triggers payload validation failure in generateModularLessonContent
              { id: "b5", order_index: 5, phase: "CONCEPT", type: "INFOGRAPHIC", title: "Block 5 Malformed", content: {} },
              { id: "b6", order_index: 6, phase: "CONCEPT", type: "CONCEPT_CARD", title: "Block 6", content: { markdown: "Valid", cards: [] } },
              { id: "b7", order_index: 7, phase: "PRACTICE", type: "FLASHCARD_DECK", title: "Block 7", content: { cards: [{ front: "F", back: "B" }] } },
              { id: "b8", order_index: 8, phase: "PRACTICE", type: "FLASHCARD_DECK", title: "Block 8", content: { cards: [{ front: "F", back: "B" }] } },
              { id: "b9", order_index: 9, phase: "PRACTICE", type: "MATCHING_GAME", title: "Block 9", content: { pairs: [{ left: "L", right: "R" }] } },
              { id: "b10", order_index: 10, phase: "APPLICATION", type: "VIDEO_LESSON", title: "Block 10", content: { video_url: "v", video_title: "vt", description: "d", key_points: [] } },
              { id: "b11", order_index: 11, phase: "APPLICATION", type: "WORKED_EXAMPLE", title: "Block 11", content: { steps: ["s1"] } },
              { id: "b12", order_index: 12, phase: "APPLICATION", type: "GUIDED_PRACTICE", title: "Block 12", content: { hints: ["h1"] } },
              { id: "b13", order_index: 13, phase: "PBD_ASSESSMENT", type: "INTERACTIVE_GAME", title: "Block 13", content: { questions: [{ question: "q", options: ["a"], correct_answer: "a", explanation: "e" }] } },
              { id: "b14", order_index: 14, phase: "PBD_ASSESSMENT", type: "INTERACTIVE_GAME", title: "Block 14", content: { questions: [{ question: "q", options: ["a"], correct_answer: "a", explanation: "e" }] } },
              { id: "b15", order_index: 15, phase: "PBD_ASSESSMENT", type: "INTERACTIVE_GAME", title: "Block 15", content: { questions: [{ question: "q", options: ["a"], correct_answer: "a", explanation: "e" }] } }
            ];
            return this.sendJson(res, 200, {
              lesson_title: "Malformed Payload Lesson",
              sp_code: "1.1.1",
              blocks: malformedBlocks,
              assessment: [],
              gamification: { xp_reward: 50, coin_reward: 10, mission_completion_message: "OK", suku_encouragement: "OK" }
            });
          }
          if (this.simulatedLLMFailure === 'MALFORMED_SCHEMA') {
            return this.sendJson(res, 200, "INVALID_NON_JSON_STRING");
          }

          // Default valid 15-block response
          const reqBody = bodyStr ? JSON.parse(bodyStr) : {};
          const promptStr = reqBody.prompt || '';
          if (promptStr.includes('MACRO PROMPT CONTRACT') || promptStr.includes('generateContentAsset') || promptStr.includes('SATU aset')) {
            return this.sendJson(res, 200, {
              asset_type: "LESSON_HOOK",
              title: "Naratif Pengenalan",
              markdown: "Mari kita mulakan dengan pengenalan pecahan yang menyeronokkan!",
              content: {
                markdown: "Mari kita mulakan dengan pengenalan pecahan yang menyeronokkan!",
                voice_script: "Skrip suara pengenalan pecahan."
              }
            });
          }
          // Default 8-block response for generateModularLessonContent
          const valid8Blocks = [
            { block_number: 1, block_type: "STORY_HOOK", title: "Blok 1: STORY_HOOK", content: { story_text: "Suku dan rakan-rakan berada di kedai kek...", mascot_dialogue: "Mari belajar bersama!" } },
            { block_number: 2, block_type: "LEARNING_OBJECTIVE", title: "Blok 2: LEARNING_OBJECTIVE", content: { i_can_statement: "Saya boleh menamai nombor hingga 10 mengikut kumpulan objek." } },
            { block_number: 3, block_type: "CONCEPT_CPA", title: "Blok 3: CONCEPT_CPA", content: { concrete: { explanation: "Gunakan blok pembagi 1 hingga 10" }, pictorial: { explanation: "Rajah kumpulan objek 1 hingga 10" }, abstract: { explanation: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10" } } },
            { block_number: 4, block_type: "WORKED_EXAMPLE", title: "Blok 4: WORKED_EXAMPLE", content: { problem_statement: "Kira bilangan epal dalam kumpulan: 5 epal", solution_steps: ["Langkah 1: Bilang satu per satu", "Langkah 2: Tulis nombor 5"] } },
            { block_number: 5, block_type: "INTERACTIVE_PRACTICE", title: "Blok 5: INTERACTIVE_PRACTICE", content: { widget_type: "number_scale", instruction: "Susun nombor 1 hingga 10 mengikut urutan." } },
            { block_number: 6, block_type: "KNOWLEDGE_CHECK", title: "Blok 6: KNOWLEDGE_CHECK", content: { questions: [{ question: "Berapakah bilangan bintang di dalam gambar?", options: ["5", "3", "8"], correct_answer: "5", explanation: "Ada 5 bintang." }, { question: "Manakah nombor yang mewakili tiga objek?", options: ["3", "1", "9"], correct_answer: "3", explanation: "Nombor 3." }] } },
            { block_number: 7, block_type: "KEY_TAKEAWAY", title: "Blok 7: KEY_TAKEAWAY", content: { summary_points: ["Nombor 1 hingga 10 mewakili kuantiti objek", "Tulis nombor mengikut urutan yang betul", "Fahami konsep sifar sebagai tiada objek"] } },
            { block_number: 8, block_type: "MISSION_COMPLETE", title: "Blok 8: MISSION_COMPLETE", content: { celebration_message: "Tahniah! Anda telah menguasai SP 1.2.1 Kenali 1 hingga 10." } },
          ];

          return this.sendJson(res, 200, {
            lesson_title: "Kenali 1 hingga 10",
            sp_code: "SP 1.2.1",
            blocks: valid8Blocks,
            assessment: [
              {
                question: "Manakah kumpulan yang mempunyai 5 objek?",
                options: ["5 epal", "3 epal", "8 epal"],
                correct_answer: "5 epal",
                explanation: "Kumpulan pertama mengandungi 5 epal.",
                cognitive_level: "remember",
                difficulty: "easy"
              }
            ],
            gamification: {
              xp_reward: 50,
              coin_reward: 10,
              mission_completion_message: "Tahniah! Misi Selesai!",
              suku_encouragement: "Teruskan usaha hebat anda!"
            }
          });
        }

        // 3. Entity endpoints (/apps/:appId/entities/:entityName...)
        const entityMatch = pathname.match(/\/entities\/([^/]+)(?:\/([^/]+))?/);
        if (entityMatch) {
          const entityName = entityMatch[1];
          const subPath = entityMatch[2]; // id or 'bulk' or 'query' or undefined

          if (!this.db[entityName]) {
            this.db[entityName] = [];
          }
          const table = this.db[entityName];

          // POST /entities/:entityName/query (filter query)
          if (method === 'POST' && subPath === 'query') {
            const bodyObj = bodyStr ? JSON.parse(bodyStr) : {};
            let queryObj = bodyObj.query || bodyObj.where || bodyObj;
            if (queryObj.query) queryObj = queryObj.query;
            if (queryObj.where) queryObj = queryObj.where;
            const filtered = table.filter(item => {
              for (const key of Object.keys(queryObj)) {
                if (key === 'query' || key === 'sort' || key === 'limit' || key === 'where' || key === 'skip') continue;
                const filterVal = queryObj[key];
                if (filterVal && typeof filterVal === 'object' && Array.isArray(filterVal.$in)) {
                  if (!filterVal.$in.includes(item[key])) return false;
                } else if (item[key] !== filterVal) {
                  return false;
                }
              }
              return true;
            });
            return this.sendJson(res, 200, filtered);
          }

          // GET /entities/:entityName (list / filter)
          if (method === 'GET' && !subPath) {
            const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('where') || urlObj.searchParams.get('filter');
            if (qParam) {
              try {
                let queryObj = JSON.parse(qParam);
                if (queryObj.query) queryObj = queryObj.query;
                if (queryObj.where) queryObj = queryObj.where;
                const filtered = table.filter(item => {
                  for (const key of Object.keys(queryObj)) {
                    if (key === 'query' || key === 'sort' || key === 'limit' || key === 'where' || key === 'skip') continue;
                    const filterVal = queryObj[key];
                    if (filterVal && typeof filterVal === 'object' && Array.isArray(filterVal.$in)) {
                      if (!filterVal.$in.includes(item[key])) return false;
                    } else if (item[key] !== filterVal) {
                      return false;
                    }
                  }
                  return true;
                });
                return this.sendJson(res, 200, filtered);
              } catch { /* ignore parse error */ }
            }
            return this.sendJson(res, 200, table);
          }

          // GET /entities/:entityName/:id
          if (method === 'GET' && subPath) {
            const item = table.find(x => x.id === subPath);
            if (item) return this.sendJson(res, 200, item);
            if (entityName === 'User') {
              const fallbackUser = { id: subPath, role: subPath.includes('admin') ? 'admin' : 'student', is_admin: subPath.includes('admin'), email: `${subPath}@test.com` };
              table.push(fallbackUser);
              return this.sendJson(res, 200, fallbackUser);
            }
            return this.sendJson(res, 404, { error: `${entityName} not found` });
          }

          // POST /entities/:entityName (create single)
          if (method === 'POST' && !subPath) {
            const data = bodyStr ? JSON.parse(bodyStr) : {};
            const newObj = {
              id: data.id || `${entityName.toLowerCase()}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
              ...data,
              created_at: new Date().toISOString()
            };
            table.push(newObj);
            return this.sendJson(res, 201, newObj);
          }

          // POST /entities/:entityName/bulk (bulk create)
          if (method === 'POST' && subPath === 'bulk') {
            const items = bodyStr ? JSON.parse(bodyStr) : [];
            const created = items.map((data, i) => {
              const newObj = {
                id: data.id || `${entityName.toLowerCase()}_${Date.now()}_${i}_${Math.floor(Math.random()*1000)}`,
                ...data,
                created_at: new Date().toISOString()
              };
              table.push(newObj);
              return newObj;
            });
            return this.sendJson(res, 201, created);
          }

          // PUT /entities/:entityName/bulk (bulk update)
          if (method === 'PUT' && subPath === 'bulk') {
            const items = bodyStr ? JSON.parse(bodyStr) : [];
            const updated = items.map(item => {
              const idx = table.findIndex(x => x.id === item.id);
              if (idx !== -1) {
                table[idx] = { ...table[idx], ...item, updated_at: new Date().toISOString() };
                return table[idx];
              }
              return item;
            });
            return this.sendJson(res, 200, updated);
          }

          // PUT /entities/:entityName/:id (update single)
          if (method === 'PUT' && subPath && subPath !== 'bulk') {
            const data = bodyStr ? JSON.parse(bodyStr) : {};
            const idx = table.findIndex(x => x.id === subPath);
            if (idx !== -1) {
              table[idx] = { ...table[idx], ...data, updated_at: new Date().toISOString() };
              return this.sendJson(res, 200, table[idx]);
            }
            return this.sendJson(res, 404, { error: `${entityName} not found` });
          }

          // DELETE /entities/:entityName/:id (delete single)
          if (method === 'DELETE' && subPath) {
            const idx = table.findIndex(x => x.id === subPath);
            if (idx !== -1) {
              const removed = table.splice(idx, 1);
              return this.sendJson(res, 200, removed[0]);
            }
            return this.sendJson(res, 404, { error: `${entityName} not found` });
          }
        }

        return this.sendJson(res, 404, { error: "Route not found" });
      } catch (err) {
        console.error("Test server error:", err);
        return this.sendJson(res, 500, { error: err.message });
      }
    });
  }

  sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

export async function invokeFunction(handler, payload, options = {}) {
  const { serverUrl, userToken, serviceToken = 'test-service-token' } = options;
  const headers = {
    'Content-Type': 'application/json',
    'Base44-App-Id': 'test-app',
    'Base44-Api-Url': serverUrl
  };
  if (serviceToken) {
    headers['Base44-Service-Authorization'] = `Bearer ${serviceToken}`;
  }
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  const req = new Request(`${serverUrl}/api/function`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const res = await handler(req);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

