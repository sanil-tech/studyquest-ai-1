import { Base44TestServer, loadFunction } from '../tests/base44Harness.js';

const server = new Base44TestServer();
const serverUrl = await server.start();
console.log("Test server listening on", serverUrl);

const genModModule = await loadFunction('./base44/functions/generateModularLessonContent/entry.ts');
const generateModularLessonContent = genModModule.default;

const req = new Request(`${serverUrl}/api/generateModularLessonContent`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Base44-App-Id': 'test-app',
    'Base44-Service-Authorization': 'Bearer test-service-token',
    'Base44-Api-Url': serverUrl
  },
  body: JSON.stringify({
    subject: 'Sains',
    year_level: '3',
    topic: 'Tumbuhan',
    sp_code: '1.1.1'
  })
});

const res = await generateModularLessonContent(req);
const data = await res.json();
console.log("FUNCTION RESPONSE:", res.status, data);

console.log("DB STATE - LessonVersions:", server.db.LessonVersion.length);
console.log("DB STATE - LessonBlocks:", server.db.LessonBlock.length);
console.log("DB STATE - Assessments:", server.db.Assessment.length);
console.log("DB STATE - QuestionBanks:", server.db.QuestionBank.length);
console.log("DB STATE - QuestionOptions:", server.db.QuestionOption.length);

await server.stop();
