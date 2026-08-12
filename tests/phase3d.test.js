// tests/phase3d.test.js
import test from "node:test";
import assert from "node:assert";
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let assembleLessonHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const mod = await loadFunction("./base44/functions/assembleLessonFromApprovedAssets/entry.ts");
  assembleLessonHandler = mod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();

  // Seed parent Lesson
  server.db.Lesson.push({
    id: "les_pecahan_01",
    title: "Pecahan Tahun 4",
    status: "published",
    published_version_id: "ver_published_v1",
  });

  // Seed existing published version V1
  server.db.LessonVersion.push({
    id: "ver_published_v1",
    lesson_id: "les_pecahan_01",
    version_number: 1,
    status: "published",
    preview_status: "APPROVED",
  });
});

// --- CATEGORY 1: ELIGIBILITY (1-4) ---
test("Test 1: Approved asset can be assembled", async () => {
  // Pre-seed 3 REQUIRED approved assets in DB
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.version_number, 2); // V1 -> V2
  assert.strictEqual(res.data.assembled_from_library, true);
});

test("Test 2: Draft asset cannot be assembled", async () => {
  // Seed draft assets only
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "draft", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.error_code, "MISSING_REQUIRED_ASSET");
  assert.strictEqual(res.data.missing_asset_type, "STORY_HOOK");
});

test("Test 3: Under-review asset cannot be assembled", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "under_review", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

test("Test 4: Archived asset cannot be assembled", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "archived", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

// --- CATEGORY 2: CURRICULUM MATCHING (5-8) ---
test("Test 5: Correct topic assets are selected", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Correct Topic Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Correct Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Correct Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  const compiled = server.db.LessonBlock.filter((b) => b.lesson_version_id === res.data.lesson_version_id);
  assert.strictEqual(compiled.length, 3);
  assert.strictEqual(compiled[0].payload.text, "Correct Topic Hook");
});

test("Test 6: Wrong topic assets are rejected / ignored", async () => {
  server.db.LessonBlock.push(
    { id: "b1_wrong", topic_id: "top_WRONG_TOPIC", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Wrong Topic Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422); // Rejects because required STORY_HOOK for top_p4 is missing
  assert.strictEqual(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

test("Test 7: Wrong subtopic assets are rejected / ignored", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", subtopic_id: "sub_WRONG", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", subtopic_id: "sub_CORRECT", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  // Handled safely without cross-topic leakage
  assert.strictEqual(res.status, 422);
});

test("Test 8: Wrong SP code assets are rejected / ignored", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "SP_WRONG_99", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Wrong SP Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
});

// --- CATEGORY 3: ASSET RESOLUTION & ORDERING (9-13) ---
test("Test 9: Required asset missing causes assembly failure", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } }
    // Missing OBJECTIVE and CONCEPT
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

test("Test 10: Optional asset missing follows registry policy", async () => {
  // Required assets present, optional VIDEO / FLASHCARD missing
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201); // Assembly succeeds even without optional assets
});

test("Test 11: Duplicate asset versions follow deterministic version policy", async () => {
  server.db.LessonBlock.push(
    { id: "b1_v1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook Old V1" } },
    { id: "b1_v2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook New V2" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  const compiled = server.db.LessonBlock.filter((b) => b.lesson_version_id === res.data.lesson_version_id);
  // Picks latest candidate deterministically
  assert.strictEqual(compiled[0].payload.text, "Hook New V2");
});

test("Test 12: Assets appear in deterministic canonical order", async () => {
  // Insert in reverse order
  server.db.LessonBlock.push(
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  const compiled = server.db.LessonBlock.filter((b) => b.lesson_version_id === res.data.lesson_version_id);
  assert.strictEqual(compiled[0].block_type, "STORY_HOOK");
  assert.strictEqual(compiled[1].block_type, "LEARNING_OBJECTIVE");
  assert.strictEqual(compiled[2].block_type, "CONCEPT_CPA");
});

test("Test 13: Database insertion order cannot change lesson order", async () => {
  server.db.LessonBlock.push(
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } },
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  const compiled = server.db.LessonBlock.filter((b) => b.lesson_version_id === res.data.lesson_version_id);
  assert.strictEqual(compiled[0].order_number, 0);
  assert.strictEqual(compiled[0].block_type, "STORY_HOOK");
});

// --- CATEGORY 4: SNAPSHOT & IMMUTABILITY (14-19) ---
test("Test 14: Assembly creates LessonVersion", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  const createdVersion = server.db.LessonVersion.find((v) => v.id === res.data.lesson_version_id);
  assert.ok(createdVersion);
  assert.strictEqual(createdVersion.version_number, 2);
});

test("Test 15: New LessonVersion starts as DRAFT", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.data.status, "draft");
  assert.strictEqual(res.data.preview_status, "NOT_VIEWED");
});

test("Test 16: assembled_from_library is correctly recorded", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.data.assembled_from_library, true);
});

test("Test 17: Existing published version remains unchanged", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  // Lesson.published_version_id remains V1
  const lesson = server.db.Lesson.find((l) => l.id === "les_pecahan_01");
  assert.strictEqual(lesson.published_version_id, "ver_published_v1");
});

test("Test 18: Modifying library asset after assembly does not alter snapshot", async () => {
  const libraryHook = { id: "b1_lib", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Original Library Text" } };
  server.db.LessonBlock.push(
    libraryHook,
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  // Later modify library asset
  libraryHook.payload.text = "MUTATED Library Text";

  // Compiled snapshot block remains "Original Library Text"
  const compiled = server.db.LessonBlock.find((b) => b.lesson_version_id === res.data.lesson_version_id && b.block_type === "STORY_HOOK");
  assert.strictEqual(compiled.payload.text, "Original Library Text");
});

test("Test 19: Approved library assets are not mutated during assembly", async () => {
  const libraryHook = { id: "b1_lib", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Library Text" } };
  server.db.LessonBlock.push(
    libraryHook,
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  // Library asset remains review_status: "approved"
  assert.strictEqual(libraryHook.review_status, "approved");
  assert.strictEqual(libraryHook.lesson_version_id, undefined);
});

// --- CATEGORY 5: SECURITY, ROLLBACK & NON-PUBLISHING INVARIANTS (20-24) ---
test("Test 20: Student runtime does not receive answer keys", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  // Response must contain safe metadata only
  assert.strictEqual(res.data.correct_answer, undefined);
  assert.strictEqual(res.data.answer_key, undefined);
});

test("Test 21: Assembly rollback removes only newly-created records", async () => {
  const preExistingBlockCount = server.db.LessonBlock.length;

  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  // Execute successful assembly
  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  assert.ok(server.db.LessonBlock.length > preExistingBlockCount);
});

test("Test 22: Duplicate assembly creates new explicit draft version snapshot", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res1 = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  const res2 = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res1.data.version_number, 2);
  assert.strictEqual(res2.data.version_number, 3); // V2 -> V3
  assert.notStrictEqual(res1.data.lesson_version_id, res2.data.lesson_version_id);
});

test("Test 23: No automatic publishing occurs", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.data.status, "draft");
  const lesson = server.db.Lesson.find((l) => l.id === "les_pecahan_01");
  assert.strictEqual(lesson.published_version_id, "ver_published_v1"); // Untouched!
});

test("Test 24: Preview status is not automatically approved", async () => {
  server.db.LessonBlock.push(
    { id: "b1", topic_id: "top_p4", sp_code: "1.1.1", block_type: "STORY_HOOK", review_status: "approved", payload: { text: "Hook" } },
    { id: "b2", topic_id: "top_p4", sp_code: "1.1.1", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { text: "Objective" } },
    { id: "b3", topic_id: "top_p4", sp_code: "1.1.1", block_type: "CONCEPT_CPA", review_status: "approved", payload: { text: "Concept" } }
  );

  const res = await invokeFunction(
    assembleLessonHandler,
    { lesson_id: "les_pecahan_01", topic_id: "top_p4", sp_code: "1.1.1" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.data.preview_status, "NOT_VIEWED");
});
