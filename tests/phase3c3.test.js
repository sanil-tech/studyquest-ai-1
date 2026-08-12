// tests/phase3c3.test.js
import test from "node:test";
import assert from "node:assert";
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";
import {
  CANONICAL_ASSET_TYPES,
  COVERAGE_STATES,
  getAssetCoverageState,
  validateAsset,
} from "../src/lib/contentAssetContract.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAssetHandler = null;
let approveContentAssetHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const genMod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = genMod.default;

  const appMod = await loadFunction("./base44/functions/approveContentAsset/entry.ts");
  approveContentAssetHandler = appMod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
  // Seed valid curriculum data in mock DB
  server.db.Topic.push({ id: "top_pecahan_y4", title: "Pecahan, Perpuluhan dan Peratus" });
  server.db.Subtopic.push({ id: "sub_penambahan_pecahan", topic_id: "top_pecahan_y4", title: "Penambahan Pecahan" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_pecahan_y4" });
});

// --- CATEGORY 1: CURRICULUM SELECTION & VALIDATION (1-2) ---
test("Test 1: Topic selection produces valid curriculum identity", () => {
  const topicId = "top_pecahan_y4";
  const subtopicId = "sub_penambahan_pecahan";
  const spCode = "SP 1.1.1";

  const candidateAsset = {
    asset_type: CANONICAL_ASSET_TYPES.LESSON_HOOK,
    topic_id: topicId,
    subtopic_id: subtopicId,
    sp_code: spCode,
  };

  const validation = validateAsset(candidateAsset);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(candidateAsset.topic_id, "top_pecahan_y4");
  assert.strictEqual(candidateAsset.sp_code, "SP 1.1.1");
});

test("Test 2: Invalid topic/subtopic combination is rejected", async () => {
  server.db.Subtopic.push({ id: "sub_lain_topic", topic_id: "top_berlainan_99", title: "Subtopik Lain" });

  const invalidPayload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_lain_topic", // Mismatched subtopic
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  const res = await invokeFunction(generateContentAssetHandler, invalidPayload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.error_code, "INVALID_CURRICULUM");
});

// --- CATEGORY 2: COVERAGE PANEL & STATES (3-6) ---
test("Test 3: Missing asset is shown as MISSING", () => {
  const records = [];
  const state = getAssetCoverageState(records);
  assert.strictEqual(state, COVERAGE_STATES.MISSING);
});

test("Test 4: Draft asset is shown as DRAFT / UNDER_REVIEW", () => {
  const records = [{ id: "blk_1", status: "draft", review_status: "under_review" }];
  const state = getAssetCoverageState(records);
  assert.strictEqual(state, COVERAGE_STATES.UNDER_REVIEW);
});

test("Test 5: Approved asset is shown as APPROVED", () => {
  const records = [{ id: "blk_1", status: "draft", review_status: "approved" }];
  const state = getAssetCoverageState(records);
  assert.strictEqual(state, COVERAGE_STATES.APPROVED);
});

test("Test 6: Published asset is shown as PUBLISHED", () => {
  const records = [{ id: "blk_1", status: "published", review_status: "published" }];
  const state = getAssetCoverageState(records);
  assert.strictEqual(state, COVERAGE_STATES.PUBLISHED);
});

// --- CATEGORY 3: GENERATION FLOW (7-9) ---
test("Test 7: Generate action calls canonical generateContentAsset", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 4",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.asset_type, "CONCEPT");
});

test("Test 8: Legacy generation functions are not called for single asset request", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "WORKED_EXAMPLE",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.status, 201);
  // Verify it creates a single LessonBlock rather than a 15-block Lesson package
  assert.strictEqual(res.data.entity_type, "LessonBlock");
  assert.strictEqual(server.db.Lesson.length, 0); // No full Lesson entity created
});

test("Test 9: Generated asset appears as DRAFT", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.strictEqual(res.data.status, "draft");
  assert.strictEqual(res.data.review_status, "under_review");

  const saved = server.db.LessonBlock.find((b) => b.id === res.data.asset_id);
  assert.strictEqual(saved.review_status, "under_review");
  assert.strictEqual(saved.approved_by, null);
});

// --- CATEGORY 4: PREVIEW FLOW (10) ---
test("Test 10: Preview renders actual generated payload", async () => {
  const payload = {
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token",
  });

  assert.ok(res.data.asset_payload);
  assert.ok(res.data.asset_payload.title || res.data.asset_payload.markdown);
  // Verify payload does not contain fake placeholder text
  const payloadStr = JSON.stringify(res.data.asset_payload).toLowerCase();
  assert.strictEqual(payloadStr.includes("kandungan tidak tersedia"), false);
});

// --- CATEGORY 5: APPROVAL FLOW & REFRESH (11-13) ---
test("Test 11: Approve action calls canonical approveContentAsset", async () => {
  const draftBlock = {
    id: "blk_draft_11",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    block_type: "STORY_HOOK",
    payload: { markdown: "Content to approve" },
    status: "draft",
    review_status: "under_review",
    quality_score: 90,
  };
  server.db.LessonBlock.push(draftBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_11" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.review_status, "approved");
});

test("Test 12: Client cannot send approval metadata", async () => {
  const draftBlock = {
    id: "blk_draft_12",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Content" },
    status: "draft",
    review_status: "under_review",
  };
  server.db.LessonBlock.push(draftBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_12", approved_by: "usr_hacker", quality_score: 100 },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.approved_by, "usr_admin"); // Server enforced actual admin ID
});

test("Test 13: Successful approval refreshes from database", async () => {
  const draftBlock = {
    id: "blk_draft_13",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Content" },
    status: "draft",
    review_status: "under_review",
  };
  server.db.LessonBlock.push(draftBlock);

  await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_13" },
    { serverUrl, userToken: "admin-token" }
  );

  // Query server database truth
  const record = server.db.LessonBlock.find((b) => b.id === "blk_draft_13");
  assert.strictEqual(record.review_status, "approved");
  assert.strictEqual(record.approved_by, "usr_admin");
  assert.ok(record.approved_at);
});

// --- CATEGORY 6: IMMUTABILITY & PROTECTION (14-15) ---
test("Test 14: Approved asset cannot be edited in place", async () => {
  const approvedBlock = {
    id: "blk_approved_14",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Approved V1 Text" },
    status: "draft",
    review_status: "approved",
    approved_by: "usr_admin",
  };
  server.db.LessonBlock.push(approvedBlock);

  // Generate new draft version instead of mutating approved asset in place
  const res = await invokeFunction(
    generateContentAssetHandler,
    {
      topic_id: "top_pecahan_y4",
      subtopic_id: "sub_penambahan_pecahan",
      sp_code: "SP 1.1.1",
      asset_type: "LESSON_HOOK",
    },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 201);
  assert.notStrictEqual(res.data.asset_id, "blk_approved_14"); // New asset created

  const original = server.db.LessonBlock.find((b) => b.id === "blk_approved_14");
  assert.strictEqual(original.payload.markdown, "Approved V1 Text"); // Original remains untouched
});

test("Test 15: Published asset remains unchanged", async () => {
  const publishedBlock = {
    id: "blk_pub_15",
    lesson_version_id: "ver_v1",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Published V1 Immutable Content" },
    status: "published",
    review_status: "published",
  };
  server.db.LessonBlock.push(publishedBlock);

  // Approval endpoint rejects mutation of published content
  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_pub_15" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");

  const check = server.db.LessonBlock.find((b) => b.id === "blk_pub_15");
  assert.strictEqual(check.payload.markdown, "Published V1 Immutable Content");
});
