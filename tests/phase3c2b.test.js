// tests/phase3c2b.test.js
import test from "node:test";
import assert from "node:assert";
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let approveContentAssetHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const mod = await loadFunction("./base44/functions/approveContentAsset/entry.ts");
  approveContentAssetHandler = mod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
});

test("Test 1: Authorized admin can approve valid draft asset", async () => {
  // Pre-seed a draft LessonBlock in DB
  const draftBlock = {
    id: "blk_draft_001",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    block_type: "STORY_HOOK",
    payload: { markdown: "Valid Hook Content" },
    status: "draft",
    review_status: "under_review",
    quality_score: 90,
  };
  server.db.LessonBlock.push(draftBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_001" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.review_status, "approved");
  assert.strictEqual(res.data.approved_by, "usr_admin");
  assert.ok(res.data.approved_at);

  // DB Record check
  const updatedInDb = server.db.LessonBlock.find((b) => b.id === "blk_draft_001");
  assert.strictEqual(updatedInDb.review_status, "approved");
  assert.strictEqual(updatedInDb.approved_by, "usr_admin");
});

test("Test 2: Unauthenticated request is rejected", async () => {
  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_001" },
    { serverUrl, userToken: null } // No auth token
  );

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "UNAUTHENTICATED");
});

test("Test 3: Unauthorized user is rejected", async () => {
  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_001" },
    { serverUrl, userToken: "student-token" } // Student role
  );

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "FORBIDDEN");
});

test("Test 4: Client cannot fake approved_by", async () => {
  const draftBlock = {
    id: "blk_draft_004",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Content" },
    status: "draft",
    review_status: "under_review",
  };
  server.db.LessonBlock.push(draftBlock);

  // Malicious client payload trying to set approved_by = "usr_superman"
  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_draft_004", approved_by: "usr_superman" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.approved_by, "usr_admin"); // Server enforced actual admin ID

  const updatedInDb = server.db.LessonBlock.find((b) => b.id === "blk_draft_004");
  assert.strictEqual(updatedInDb.approved_by, "usr_admin");
});

test("Test 5: Client cannot fake quality_score", async () => {
  const lowQualityBlock = {
    id: "blk_low_quality",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Short" },
    status: "draft",
    review_status: "under_review",
    quality_score: 50, // Real score in DB is 50 (< 75)
  };
  server.db.LessonBlock.push(lowQualityBlock);

  // Client attempts to pass quality_score = 100
  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_low_quality", quality_score: 100 },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "QUALITY_GATE_FAILED");
});

test("Test 6: Quality score below threshold prevents approval", async () => {
  const lowQualityBlock = {
    id: "blk_low_6",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Incomplete" },
    status: "draft",
    quality_score: 60,
  };
  server.db.LessonBlock.push(lowQualityBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_low_6" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "QUALITY_GATE_FAILED");
  assert.strictEqual(res.data.quality_score, 60);
});

test("Test 7: Malformed asset cannot be approved", async () => {
  // LessonBlock without payload
  const malformedBlock = {
    id: "blk_malformed",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: null,
    status: "draft",
  };
  server.db.LessonBlock.push(malformedBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_malformed" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "INVALID_ASSET");
});

test("Test 8: Invalid curriculum metadata cannot be approved", async () => {
  // Asset missing sp_code, topic_id, and subtopic_id
  const uncurriculumboundAsset = {
    id: "blk_no_curriculum",
    block_type: "STORY_HOOK",
    payload: { text: "No curriculum tags" },
    status: "draft",
  };
  server.db.LessonBlock.push(uncurriculumboundAsset);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_no_curriculum" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "INVALID_ASSET");
});

test("Test 9: Already approved asset is handled idempotently", async () => {
  const approvedBlock = {
    id: "blk_approved_already",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Content" },
    status: "draft",
    review_status: "approved",
    approved_by: "usr_admin_prev",
    approved_at: "2026-08-10T10:00:00.000Z",
  };
  server.db.LessonBlock.push(approvedBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_approved_already" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.review_status, "approved");
  assert.strictEqual(res.data.message, "ALREADY_APPROVED");
});

test("Test 10: Published asset cannot be mutated", async () => {
  const publishedBlock = {
    id: "blk_published_immutable",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Published V1" },
    status: "published",
    review_status: "published",
  };
  server.db.LessonBlock.push(publishedBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_published_immutable" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 422);
  assert.strictEqual(res.data.success, false);
  assert.strictEqual(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});

test("Test 11: Approval does not modify asset content payload", async () => {
  const originalPayload = {
    markdown: "# Konsep Pecahan\nPenambahan pecahan sama penyebut.",
    voice_script: "Mari belajar penambahan pecahan.",
    cpa: { concrete: "Jubin", pictorial: "Rajah", abstract: "1/4 + 2/4" },
  };

  const draftBlock = {
    id: "blk_payload_check",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    block_type: "CONCEPT_CPA",
    payload: JSON.parse(JSON.stringify(originalPayload)),
    status: "draft",
    review_status: "under_review",
    quality_score: 95,
  };
  server.db.LessonBlock.push(draftBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_payload_check" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);

  const savedInDb = server.db.LessonBlock.find((b) => b.id === "blk_payload_check");
  assert.deepStrictEqual(savedInDb.payload, originalPayload); // Payload is 100% identical
});

test("Test 12: Approval records server-authoritative approval metadata", async () => {
  const draftBlock = {
    id: "blk_meta_check",
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
    payload: { markdown: "Test Meta" },
    status: "draft",
    review_status: "under_review",
    approved_by: null,
    approved_at: null,
  };
  server.db.LessonBlock.push(draftBlock);

  const res = await invokeFunction(
    approveContentAssetHandler,
    { asset_id: "blk_meta_check" },
    { serverUrl, userToken: "admin-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.approved_by, "usr_admin");
  assert.ok(res.data.approved_at);

  const record = server.db.LessonBlock.find((b) => b.id === "blk_meta_check");
  assert.strictEqual(record.review_status, "approved");
  assert.strictEqual(record.approved_by, "usr_admin");
  assert.ok(record.approved_at);
});
