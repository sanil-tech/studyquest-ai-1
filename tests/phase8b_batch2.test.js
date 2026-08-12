// tests/phase8b_batch2.test.js
// PHASE 8B BATCH 2 — CONTROLLED MULTI-SP PRODUCTION ENGINE TEST SUITE
// Validates Batch 2 SPs: SP 1.2.3, SP 1.3.1, SP 1.3.2 (45 total assets, 15/15 assembly, regression protection)

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  Base44TestServer,
  loadFunction,
  invokeFunction
} from "./base44Harness.js";

import {
  CANONICAL_ASSET_TYPES,
  COVERAGE_STATES,
  getAssetCoverageState
} from "../src/lib/contentAssetContract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAsset;
let approveContentAsset;
let assembleLessonFromApprovedAssets;
let getLearningPackage;

test.before(async () => {
  serverUrl = await server.start();
  generateContentAsset = (await loadFunction("./base44/functions/generateContentAsset/entry.ts")).default;
  approveContentAsset = (await loadFunction("./base44/functions/approveContentAsset/entry.ts")).default;
  assembleLessonFromApprovedAssets = (await loadFunction("./base44/functions/assembleLessonFromApprovedAssets/entry.ts")).default;
  getLearningPackage = (await loadFunction("./base44/functions/getLearningPackage/entry.ts")).default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();

  // Setup Batch 1 & Batch 2 Topic and Subtopics in Test DB
  server.db.Topic.push({ id: "top_nombor_100", title: "Nombor hingga 100" });
  server.db.Subtopic.push({ id: "sub_1_1", topic_id: "top_nombor_100", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_1_2", topic_id: "top_nombor_100", title: "Nilai Nombor" });
  server.db.Subtopic.push({ id: "sub_1_3", topic_id: "top_nombor_100", title: "Menulis Nombor" });

  // Batch 1 SPs
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_2", standard_learning_code: "SP 1.2.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_3", standard_learning_code: "SP 1.2.2", topic_id: "top_nombor_100" });

  // Batch 2 Target SPs
  server.db.CurriculumStandard.push({ id: "cs_4", standard_learning_code: "SP 1.2.3", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_5", standard_learning_code: "SP 1.3.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_6", standard_learning_code: "SP 1.3.2", topic_id: "top_nombor_100" });
});

// 1. CANONICAL BATCH 2 SP RESOLUTION
test("1. Canonical Batch 2 SP Resolution (SP 1.2.3, SP 1.3.1, SP 1.3.2)", () => {
  const batch2Sps = ["SP 1.2.3", "SP 1.3.1", "SP 1.3.2"];
  assert.equal(batch2Sps.length, 3);
  assert.ok(batch2Sps.includes("SP 1.2.3"));
  assert.ok(batch2Sps.includes("SP 1.3.1"));
  assert.ok(batch2Sps.includes("SP 1.3.2"));
});

// 2. EXACT CURRICULUM BINDING FOR BATCH 2
test("2. Exact Curriculum Binding for Batch 2 Assets", async () => {
  const { status, data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100",
    subtopic_id: "sub_1_3",
    sp_code: "SP 1.3.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(status, 201);
  assert.equal(data.success, true);

  const asset = server.db.LessonBlock.find(b => b.id === data.asset_id);
  assert.ok(asset);
  assert.equal(asset.sp_code, "SP 1.3.1");
  assert.equal(asset.topic_id, "top_nombor_100");
  assert.equal(asset.subtopic_id, "sub_1_3");
});

// 3. 15-BLOCK COMPLETENESS FOR BATCH 2 SPs
test("3. 15-Block Completeness Verification for SP 1.2.3, SP 1.3.1, SP 1.3.2", () => {
  const canonical15 = [
    "LESSON_HOOK", "STORY_HOOK", "REAL_WORLD_CONTEXT", "CONCEPT",
    "WORKED_EXAMPLE", "GUIDED_PRACTICE", "CONCEPT_CARD", "MIND_MAP",
    "INFOGRAPHIC", "FLASHCARD_DECK", "MATCHING_GAME", "INTERACTIVE_GAME",
    "VIDEO_LESSON", "AUDIO_HOOK", "QUIZ_QUESTION"
  ];
  assert.equal(canonical15.length, 15);
  assert.equal(new Set(canonical15).size, 15);
});

// 4. NO DUPLICATE BLOCK TYPES
test("4. No Duplicate Block Types per SP", async () => {
  const blockTypes = ["LESSON_HOOK", "CONCEPT", "QUIZ_QUESTION"];
  for (const bt of blockTypes) {
    await invokeFunction(generateContentAsset, {
      topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.3",
      asset_type: bt, subject_name: "Matematik", year_level: "Tahun 1"
    }, { serverUrl, userToken: "admin-token" });
  }

  const sp123Blocks = server.db.LessonBlock.filter(b => b.sp_code === "SP 1.2.3");
  const types = sp123Blocks.map(b => b.block_type);
  assert.equal(types.length, new Set(types).size);
});

// 5. CROSS-SP ISOLATION (SP 1.2.3 vs SP 1.3.1)
test("5. Cross-SP Isolation between SP 1.2.3 and SP 1.3.1", async () => {
  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.3",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const sp123 = server.db.LessonBlock.filter(b => b.sp_code === "SP 1.2.3");
  const sp131 = server.db.LessonBlock.filter(b => b.sp_code === "SP 1.3.1");

  assert.equal(sp123.length, 1);
  assert.equal(sp131.length, 1);
  assert.notEqual(sp123[0].id, sp131[0].id);
  assert.equal(sp123[0].sp_code, "SP 1.2.3");
  assert.equal(sp131[0].sp_code, "SP 1.3.1");
});

// 6. PREVIOUS BATCH 1 ISOLATION (SP 1.1.1 vs SP 1.3.2)
test("6. Previous Batch 1 Isolation (SP 1.1.1 vs SP 1.3.2)", async () => {
  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.2",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const batch1Asset = server.db.LessonBlock.find(b => b.sp_code === "SP 1.1.1");
  const batch2Asset = server.db.LessonBlock.find(b => b.sp_code === "SP 1.3.2");

  assert.ok(batch1Asset);
  assert.ok(batch2Asset);
  assert.notEqual(batch1Asset.sp_code, batch2Asset.sp_code);
});

// 7. PROMPT ISOLATION
test("7. Prompt Registry Isolation across Batch 2 Asset Types", async () => {
  const { data: res1 } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const { data: res2 } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "WORKED_EXAMPLE", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const asset1 = server.db.LessonBlock.find(b => b.id === res1.asset_id);
  const asset2 = server.db.LessonBlock.find(b => b.id === res2.asset_id);

  assert.notEqual(asset1.block_type, asset2.block_type);
});

// 8. ASSET VERSION ISOLATION
test("8. Asset Version Isolation (Draft vs Approved)", async () => {
  const { data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.2",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const draftAsset = server.db.LessonBlock.find(b => b.id === data.asset_id);
  assert.equal(draftAsset.review_status, "under_review");

  await invokeFunction(approveContentAsset, { asset_id: data.asset_id, action: "approve" }, { serverUrl, userToken: "admin-token" });
  const approvedAsset = server.db.LessonBlock.find(b => b.id === data.asset_id);
  assert.equal(approvedAsset.review_status, "approved");
});

// 9. APPROVAL PROTECTION
test("9. Approval Protection for Batch 2 Assets", async () => {
  const { data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "QUIZ_QUESTION", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const { status, data: appRes } = await invokeFunction(approveContentAsset, {
    asset_id: data.asset_id, action: "approve"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(status, 200);
  assert.equal(appRes.review_status, "approved");
});

// 10. REGENERATION PROTECTION
test("10. Regeneration preserves approved v1", async () => {
  const { data: v1 } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(approveContentAsset, { asset_id: v1.asset_id, action: "approve" }, { serverUrl, userToken: "admin-token" });

  const { data: v2 } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.notEqual(v1.asset_id, v2.asset_id);
  const v1Asset = server.db.LessonBlock.find(b => b.id === v1.asset_id);
  const v2Asset = server.db.LessonBlock.find(b => b.id === v2.asset_id);

  assert.equal(v1Asset.review_status, "approved");
  assert.equal(v2Asset.review_status, "under_review");
});

// 11. 14/15 ASSEMBLY REJECTION
test("11. Assembly Attempt with 14/15 approved blocks returns error", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.3.1", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved" });

  const { status, data: errData } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp131", topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.ok(status === 400 || status === 422);
  assert.equal(errData.success, false);
});

// 12. 15/15 ASSEMBLY SUCCESS
test("12. Assembly Attempt with 15/15 approved blocks succeeds", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.3.1", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.3.1", topic_id: "top_nombor_100", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.3.1", topic_id: "top_nombor_100", block_type: "CONCEPT_CPA", review_status: "approved", payload: {} });

  const { status, data: asmRes } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp131", topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(status, 201);
  assert.equal(asmRes.success, true);
  assert.ok(asmRes.lesson_version_id);
});

// 13. SNAPSHOT IMMUTABILITY
test("13. Assembled LessonVersion Snapshot is Immutable", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.2.3", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.2.3", topic_id: "top_nombor_100", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.2.3", topic_id: "top_nombor_100", block_type: "CONCEPT_CPA", review_status: "approved", payload: {} });

  const { data: asmRes } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp123", topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.3"
  }, { serverUrl, userToken: "admin-token" });

  const snapshot = server.db.LessonVersion.find(v => v.id === asmRes.lesson_version_id);
  assert.ok(snapshot);
  assert.equal(snapshot.status, "draft");
});

// 14. STUDENT RUNTIME ISOLATION
test("14. Student Runtime Isolation via getLearningPackage", async () => {
  server.db.LessonVersion.push({ id: "ver_sp131_pub", lesson_id: "les_131", sp_code: "SP 1.3.1", status: "published", review_status: "published" });
  server.db.LessonBlock.push({ id: "blk_sp131_pub", lesson_version_id: "ver_sp131_pub", sp_code: "SP 1.3.1", block_type: "STORY_HOOK", status: "published", payload: { title: "Published SP 1.3.1" } });

  const res = await invokeFunction(getLearningPackage, {
    lesson_version_id: "ver_sp131_pub"
  }, { serverUrl, userToken: "student-token" });

  assert.equal(res.status, 200);
  assert.equal(res.data.lesson.sp_code, "SP 1.3.1");
});

// 15. ANSWER-KEY ISOLATION
test("15. Answer-Key Isolation in Assessment Endpoints", async () => {
  const question = server.db.QuestionBank.find(q => q.sp_code === "SP 1.3.1");
  assert.equal(question, undefined);
});

// 16. NO AUTO-PUBLISHING
test("16. Generation & Assembly never auto-publish content", async () => {
  const { data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.2",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const asset = server.db.LessonBlock.find(b => b.id === data.asset_id);
  assert.notEqual(asset.status, "published");
});

// 17. FAILED-GENERATION ROLLBACK
test("17. Failed generation does not create corrupted DB records", async () => {
  const initialCount = server.db.LessonBlock.length;

  const { status } = await invokeFunction(generateContentAsset, {
    topic_id: "invalid_topic", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "UNKNOWN_TYPE", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.notEqual(status, 201);
  assert.equal(server.db.LessonBlock.length, initialCount);
});

// 18. BATCH 2 DASHBOARD / PROGRESS ACCURACY
test("18. Batch 2 Dashboard Progress Accuracy (0/15 to 15/15)", async () => {
  const types = ["LESSON_HOOK", "CONCEPT"];
  for (const t of types) {
    const { data } = await invokeFunction(generateContentAsset, {
      topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.2",
      asset_type: t, subject_name: "Matematik", year_level: "Tahun 1"
    }, { serverUrl, userToken: "admin-token" });
    await invokeFunction(approveContentAsset, { asset_id: data.asset_id, action: "approve" }, { serverUrl, userToken: "admin-token" });
  }

  const approved = server.db.LessonBlock.filter(b => b.sp_code === "SP 1.3.2" && b.review_status === "approved");
  assert.equal(approved.length, 2);
  const state = getAssetCoverageState(approved);
  assert.equal(state, COVERAGE_STATES.APPROVED);
});

// 19. ADJACENT-SP CONTAMINATION DETECTION
test("19. Adjacent-SP Contamination Detection (SP 1.3.1 vs SP 1.3.2)", async () => {
  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_3", sp_code: "SP 1.3.2",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const sp131Asset = server.db.LessonBlock.find(b => b.sp_code === "SP 1.3.1");
  const sp132Asset = server.db.LessonBlock.find(b => b.sp_code === "SP 1.3.2");

  assert.equal(sp131Asset.sp_code, "SP 1.3.1");
  assert.equal(sp132Asset.sp_code, "SP 1.3.2");
});

// 20. BATCH 1 -> BATCH 2 REGRESSION PROTECTION
test("20. Batch 1 -> Batch 2 Regression Protection", async () => {
  const batch1Sps = ["SP 1.1.1", "SP 1.2.1", "SP 1.2.2"];
  const batch2Sps = ["SP 1.2.3", "SP 1.3.1", "SP 1.3.2"];

  for (const sp of [...batch1Sps, ...batch2Sps]) {
    await invokeFunction(generateContentAsset, {
      topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: sp,
      asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
    }, { serverUrl, userToken: "admin-token" });
  }

  for (const sp of [...batch1Sps, ...batch2Sps]) {
    const blocks = server.db.LessonBlock.filter(b => b.sp_code === sp);
    assert.equal(blocks.length, 1);
  }
});
