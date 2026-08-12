import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-load all functions via the test harness loader
const genModModule = await loadFunction('./base44/functions/generateModularLessonContent/entry.ts');
const generateModularLessonContent = genModModule.default;

const getLessonModule = await loadFunction('./base44/functions/getLessonContent/entry.ts');
const getLessonContent = getLessonModule.default;

const publishModule = await loadFunction('./base44/functions/publishLessonVersion/entry.ts');
const publishLessonVersion = publishModule.default;

const approveModule = await loadFunction('./base44/functions/approveLessonPreview/entry.ts');
const approveLessonPreview = approveModule.default;

let server;
let serverUrl;
let sharedDraftVersionId = null;
let sharedLessonId = null;
let sharedTopicId = null;

test.before(async () => {
  server = new Base44TestServer();
  serverUrl = await server.start();
});

test.after(async () => {
  if (server) await server.stop();
});

// TEST 1 — VALID GENERATION
test("TEST 1: Valid generation creates complete DB graph", async () => {
  server.resetDb();

  const { status, data } = await invokeFunction(generateModularLessonContent, {
    subject: "Sains",
    year_level: "3",
    topic: "Tumbuhan",
    sp_code: "1.1.1"
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.strictEqual(status, 200, "Generation HTTP status should be 200");
  assert.strictEqual(data.success, true, "Generation should return success: true");
  assert.ok(data.version_id, "Should return version_id");

  sharedDraftVersionId = data.version_id;

  // Verify DB entities created
  assert.strictEqual(server.db.Lesson.length, 1, "Should create 1 Lesson entity");
  assert.strictEqual(server.db.LessonVersion.length, 1, "Should create 1 LessonVersion entity");
  assert.strictEqual(server.db.LessonVersion[0].status, "draft", "LessonVersion status must be draft");
  assert.strictEqual(server.db.LessonBlock.length, 15, "Should create 15 LessonBlock entities");
  assert.strictEqual(server.db.Assessment.length, 1, "Should create 1 Assessment entity");
  assert.strictEqual(server.db.QuestionBank.length, 1, "Should create 1 QuestionBank entity");
  assert.strictEqual(server.db.QuestionOption.length, 4, "Should create 4 QuestionOption entities");

  sharedLessonId = server.db.Lesson[0].id;
  sharedTopicId = server.db.Lesson[0].topic_id;
});

// TEST 2 — INVALID CURRICULUM
test("TEST 2: Invalid curriculum rejected", async () => {
  const previousVersionCount = server.db.LessonVersion.length;

  const { status, data } = await invokeFunction(generateModularLessonContent, {
    subject: "RocketScience",
    year_level: "3"
    // Missing topic_id, lesson_version_id, and topic
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.strictEqual(status, 400, "Invalid curriculum input must return 400");
  assert.strictEqual(data.success, false, "Should return success: false");
  assert.ok(data.error, "Should return an error message");
  assert.strictEqual(server.db.LessonVersion.length, previousVersionCount, "No new LessonVersion created");
});

// TEST 3 — MALFORMED AI OUTPUT
test("TEST 3: Malformed AI output rejected with clean rollback", async () => {
  server.simulatedLLMFailure = 'MALFORMED_BLOCK_PAYLOAD';
  const initialVersionCount = server.db.LessonVersion.length;
  const initialBlockCount = server.db.LessonBlock.length;

  const { status, data } = await invokeFunction(generateModularLessonContent, {
    subject: "Sains",
    year_level: "3",
    topic: "Tumbuhan Malformed",
    sp_code: "1.1.2"
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.ok(status >= 400, "Malformed output must return error status");
  assert.strictEqual(data.success, false, "Should indicate failure");
  assert.match(data.error, /kandungan kosong|tidak lengkap/, "Error message must indicate missing/incomplete block payload");

  // Verify rollback: no orphaned blocks or draft versions left behind
  assert.strictEqual(server.db.LessonBlock.length, initialBlockCount, "All blocks rolled back");
  assert.strictEqual(server.db.LessonVersion.length, initialVersionCount, "Draft version rolled back");

  server.simulatedLLMFailure = null;
});

// TEST 4 — DRAFT ISOLATION
test("TEST 4: Draft cannot reach student", async () => {
  assert.ok(sharedTopicId, "Depends on TEST 1");

  const { status, data } = await invokeFunction(getLessonContent, {
    topic_id: sharedTopicId
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.strictEqual(status, 200);
  assert.strictEqual(data.questions_json, "[]", "No draft questions returned to student when unpublished");
});

// TEST 5 — GENERATION CANNOT PUBLISH
test("TEST 5: Generation cannot publish", async () => {
  assert.ok(sharedLessonId, "Depends on TEST 1");

  const lesson = server.db.Lesson.find(l => l.id === sharedLessonId);
  assert.ok(lesson, "Lesson record must exist");
  assert.strictEqual(lesson.published_version_id || null, null, "published_version_id must NOT be set on generation");
});

// TEST 6 — CLIENT CANNOT FAKE QUALITY
test("TEST 6: Client cannot fake quality/approval", async () => {
  assert.ok(sharedDraftVersionId, "Depends on TEST 1");

  // Seed completeness records for sharedDraftVersionId so readiness check passes and preview_status shield is tested
  for (let i = 0; i < 5; i++) {
    server.db.Flashcard.push({ id: `fc_${i}`, lesson_version_id: sharedDraftVersionId, front: `F${i}`, back: `B${i}` });
  }
  for (let i = 0; i < 10; i++) {
    server.db.QuestionBank.push({ id: `qb_${i}`, lesson_version_id: sharedDraftVersionId, question: `Q${i}`, status: "draft" });
  }
  server.db.TeacherGuide.push({ id: `tg_1`, lesson_version_id: sharedDraftVersionId, title: "Guide" });
  server.db.LessonContent.push({ id: `lc_1`, lesson_version_id: sharedDraftVersionId, content_type: "notes", content_markdown: "Notes" });
  if (!server.db.LearningActivity) server.db.LearningActivity = [];
  server.db.LearningActivity.push({ id: `act_1`, lesson_version_id: sharedDraftVersionId, title: "Activity" });

  // Attempt publication from admin without preview approval (preview_status is NOT_VIEWED)
  const { status, data } = await invokeFunction(publishLessonVersion, {
    lesson_version_id: sharedDraftVersionId
  }, { serverUrl, userToken: "admin-token", serviceToken: "test-service-token" });

  assert.strictEqual(status, 400, "Publishing without preview approval must be rejected");
  assert.strictEqual(data.success, false);
  assert.match(data.error, /kelulusan pratonton admin/, "Error must mention preview approval requirement");
});

// TEST 7 — AUTHORIZED ADMIN PREVIEW
test("TEST 7: Authorized admin can preview draft", async () => {
  assert.ok(sharedDraftVersionId, "Depends on TEST 1");

  const { status, data } = await invokeFunction(approveLessonPreview, {
    lesson_version_id: sharedDraftVersionId,
    preview_status: "APPROVED",
    preview_checklist_completed: true
  }, { serverUrl, userToken: "admin-token", serviceToken: "test-service-token" });

  assert.strictEqual(status, 200, "Authorized admin can update preview status");
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.preview_status, "APPROVED");
});

// TEST 8 — UNAUTHORIZED DRAFT ACCESS
test("TEST 8: Unauthorized user cannot publish/preview draft", async () => {
  assert.ok(sharedDraftVersionId, "Depends on TEST 1");

  const { status, data } = await invokeFunction(publishLessonVersion, {
    lesson_version_id: sharedDraftVersionId
  }, { serverUrl, userToken: "student-token", serviceToken: "test-service-token" });

  assert.strictEqual(status, 403, "Student must be forbidden from publishing");
  assert.strictEqual(data.success, false);
  assert.match(data.error, /Hanya pentadbir\/guru dibenarkan/);
});

// TEST 9 — CANONICAL GENERATION PATH
test("TEST 9: AdminContentStudio has exactly one active generation path", async () => {
  const adminStudioPath = path.join(__dirname, "../src/components/AdminContentStudio.jsx");
  const content = fs.readFileSync(adminStudioPath, "utf-8");

  const illegalImports = [
    "generateLesson",
    "generateKSSRMissionPackage",
    "generateKSSRContent",
    "aiContentEngine",
    "aiContentFiller",
    "saveGeneratedLesson"
  ];

  for (const illegal of illegalImports) {
    assert.strictEqual(content.includes(illegal), false, `AdminContentStudio must NOT import/use ${illegal}`);
  }

  assert.ok(content.includes("generateModularLessonContent"), "Must use generateModularLessonContent");
});

// TEST 10 — PUBLISHED VERSION SAFETY
test("TEST 10: Generating V2 failure does not modify published V1", async () => {
  // 1. Mark existing V1 as published
  const v1 = server.db.LessonVersion.find(v => v.id === sharedDraftVersionId);
  assert.ok(v1, "V1 version must exist");
  v1.status = "published";
  v1.quality_score = 90;
  v1.preview_status = "APPROVED";

  const lesson = server.db.Lesson.find(l => l.id === sharedLessonId);
  lesson.published_version_id = v1.id;

  // 2. Simulate V2 generation with LLM failure
  server.simulatedLLMFailure = 'MALFORMED_BLOCK_COUNT';

  const { status, data } = await invokeFunction(generateModularLessonContent, {
    lesson_version_id: v1.id,
    subject: "Sains",
    year_level: "3",
    topic: "Tumbuhan V2",
    sp_code: "1.1.1"
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.strictEqual(data.success, false, "V2 generation failed");

  // 3. Verify V1 status and published_version_id remain unchanged
  assert.strictEqual(v1.status, "published", "V1 status must remain published");
  assert.strictEqual(lesson.published_version_id, v1.id, "published_version_id must remain V1");

  server.simulatedLLMFailure = null;
});
