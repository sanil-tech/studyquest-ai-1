// tests/phase3c1.test.js
import test from "node:test";
import assert from "node:assert";
import {
  CANONICAL_ASSET_TYPES,
  ASSET_ENTITY_MAP,
  COVERAGE_STATES,
  validateAsset,
  sanitizeAiGeneratedAsset,
  getAssetCoverageState,
  verifyPublishedSnapshotInvariant,
} from "../src/lib/contentAssetContract.js";

test("Test 1: Valid curriculum-tagged LessonBlock passes validation", () => {
  const validAsset = {
    asset_type: CANONICAL_ASSET_TYPES.CONCEPT,
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    review_status: "approved",
    approved_by: "usr_admin_01",
  };

  const result = validateAsset(validAsset);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test("Test 2: Missing topic_id is rejected where topic is mandatory", () => {
  const invalidAsset = {
    asset_type: CANONICAL_ASSET_TYPES.CONCEPT,
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
  };

  const result = validateAsset(invalidAsset, { requireCurriculum: true });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("topic_id")));
});

test("Test 3: Missing subtopic_id is rejected where subtopic is mandatory", () => {
  const invalidAsset = {
    asset_type: CANONICAL_ASSET_TYPES.CONCEPT,
    topic_id: "top_pecahan_y4",
    sp_code: "SP 1.1.1",
  };

  const result = validateAsset(invalidAsset, { requireCurriculum: true });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("subtopic_id")));
});

test("Test 4: Missing sp_code is rejected where SP is mandatory", () => {
  const invalidAsset = {
    asset_type: CANONICAL_ASSET_TYPES.CONCEPT,
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
  };

  const result = validateAsset(invalidAsset, { requireCurriculum: true });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("sp_code")));
});

test("Test 5: Unknown asset type is rejected", () => {
  const invalidAsset = {
    asset_type: "INVALID_UNKNOWN_TYPE",
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
  };

  const result = validateAsset(invalidAsset);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Jenis aset tidak sah")));
});

test("Test 6: AI-generated asset starts as DRAFT or UNDER_REVIEW", () => {
  const rawAiOutput = {
    asset_type: CANONICAL_ASSET_TYPES.LESSON_HOOK,
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    status: "published",
    review_status: "approved",
  };

  const sanitized = sanitizeAiGeneratedAsset(rawAiOutput);
  assert.strictEqual(sanitized.created_source, "ai_generated");
  assert.strictEqual(sanitized.review_status, "under_review");
  assert.strictEqual(sanitized.status, "draft");
  assert.strictEqual(sanitized.approved_by, null);
});

test("Test 7: Generation cannot automatically create APPROVED content", () => {
  const autoApprovedAiAsset = {
    asset_type: CANONICAL_ASSET_TYPES.WORKED_EXAMPLE,
    topic_id: "top_pecahan_y4",
    subtopic_id: "sub_penambahan_pecahan",
    sp_code: "SP 1.1.1",
    created_source: "ai_generated",
    review_status: "approved",
    approved_by: null, // No human admin approval
  };

  const result = validateAsset(autoApprovedAiAsset);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Aturan Keselamatan AI")));
});

test("Test 8: Published LessonVersion remains independent from later library asset changes", () => {
  const publishedVersion = {
    id: "ver_pub_001",
    status: "published",
    version_number: 1,
  };

  const snapshotBlocks = [
    { id: "blk_1", lesson_version_id: "ver_pub_001", payload: { text: "Original V1 text" } },
    { id: "blk_2", lesson_version_id: "ver_pub_001", payload: { text: "Original V1 concept" } },
  ];

  const updatedContentLibraryAssets = [
    { id: "lib_asset_1", sp_code: "SP 1.1.1", review_status: "approved", payload: { text: "NEW Updated V2 text" } },
  ];

  const check = verifyPublishedSnapshotInvariant(publishedVersion, snapshotBlocks, updatedContentLibraryAssets);
  assert.strictEqual(check.invariantHeld, true);
  assert.strictEqual(snapshotBlocks[0].payload.text, "Original V1 text"); // Verified unmodified
});

test("Test 9: Missing asset produces MISSING state, not placeholder content", () => {
  const emptyAssets = [];
  const state = getAssetCoverageState(emptyAssets);

  assert.strictEqual(state, COVERAGE_STATES.MISSING);
  assert.notStrictEqual(state, "Kandungan tidak tersedia..."); // No fabricated text
});

test("Test 10: Existing legacy LessonBlock records remain valid", () => {
  const legacyBlock = {
    id: "blk_legacy_99",
    lesson_version_id: "ver_legacy_001",
    asset_type: CANONICAL_ASSET_TYPES.CONCEPT,
    block_type: "CONCEPT_CPA",
    order_number: 0,
    payload: { markdown: "Legacy content" },
    status: "published",
  };

  // Legacy blocks carry lesson_version_id and may omit topic_id/subtopic_id/sp_code on the block row
  const result = validateAsset(legacyBlock, { requireCurriculum: false });
  assert.strictEqual(result.valid, true);
});
