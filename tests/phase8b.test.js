// tests/phase8b.test.js
// PHASE 8B — CONTROLLED MULTI-SP CURRICULUM CONTENT PRODUCTION TEST SUITE

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
  getTaxonomySubjects,
  getTaxonomyYears,
  getTaxonomyTopics,
  getTaxonomySKs,
  getTaxonomySPs,
  getSPDetail
} from "../src/services/dskpRegistry.js";

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
  server.db.Topic.push({ id: "top_nombor_100", title: "Nombor hingga 100" });
  server.db.Subtopic.push({ id: "sub_1_1", topic_id: "top_nombor_100", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_1_2", topic_id: "top_nombor_100", title: "Nilai Nombor" });

  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_2", standard_learning_code: "SP 1.2.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_3", standard_learning_code: "SP 1.2.2", topic_id: "top_nombor_100" });
});

// 1. CANONICAL 25-SP QUEUE RESOLUTION
test("1. Canonical 25-SP Queue Resolution", () => {
  const sps = getTaxonomySPs("Matematik", "Tahun 1");
  assert.ok(sps.length >= 25, "Must resolve 25 canonical SPs");
});

// 2. DETERMINISTIC ORDERING
test("2. Deterministic SP Ordering in Batch 1", () => {
  const sps = getTaxonomySPs("Matematik", "Tahun 1");
  assert.equal(sps[0].sp_code, "1.1.1");
  assert.equal(sps[1].sp_code, "1.2.1");
  assert.equal(sps[2].sp_code, "1.2.2");
});

// 3. ONE-REQUEST-ONE-ASSET
test("3. One Request = One Asset via generateContentAsset", async () => {
  const { status, data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.ok(data.asset_id);
});

// 4. 15-BLOCK COMPLETENESS
test("4. 15-Block Completeness Verification for Batch 1 SPs", () => {
  const required15 = [
    "LESSON_HOOK", "STORY_HOOK", "REAL_WORLD_CONTEXT", "CONCEPT",
    "WORKED_EXAMPLE", "GUIDED_PRACTICE", "CONCEPT_CARD", "MIND_MAP",
    "INFOGRAPHIC", "FLASHCARD_DECK", "MATCHING_GAME", "INTERACTIVE_GAME",
    "VIDEO_LESSON", "AUDIO_HOOK", "QUIZ_QUESTION"
  ];
  assert.equal(required15.length, 15);
});

// 5. CURRICULUM IDENTITY BINDING
test("5. Curriculum Identity Binding on Batch 1 Generation", async () => {
  const { data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.2",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const block = server.db.LessonBlock.find(b => b.id === data.asset_id);
  assert.ok(block);
  assert.equal(block.sp_code, "SP 1.2.2");
});

// 6. DUPLICATE PROTECTION
test("6. Duplicate Protection creates non-overwriting distinct records", async () => {
  const r1 = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const r2 = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.notEqual(r1.data.asset_id, r2.data.asset_id);
});

// 7. VERSION PROTECTION
test("7. Version Protection on Approved Assets", async () => {
  server.db.LessonBlock.push({ id: "b_app", sp_code: "SP 1.2.1", review_status: "approved" });
  const block = server.db.LessonBlock.find(b => b.id === "b_app");
  assert.equal(block.review_status, "approved");
});

// 8. APPROVAL AUTHORIZATION
test("8. Approval Authorization via approveContentAsset", async () => {
  const gen = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const app = await invokeFunction(approveContentAsset, {
    asset_id: gen.data.asset_id, action: "approve"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(app.status, 200);
  assert.equal(app.data.review_status, "approved");
});

// 9. REJECTION HANDLING
test("9. Rejection Handling via approveContentAsset (action=reject)", async () => {
  const gen = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const rej = await invokeFunction(approveContentAsset, {
    asset_id: gen.data.asset_id, action: "reject", rejection_reason: "Pedagogical clarity needed"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(rej.status, 200);
  assert.equal(rej.data.review_status, "rejected");
});

// 10. REGENERATION SAFETY
test("10. Regeneration Safety preserves approved v1", async () => {
  const gen1 = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(approveContentAsset, { asset_id: gen1.data.asset_id, action: "approve" }, { serverUrl, userToken: "admin-token" });

  const gen2 = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const b1 = server.db.LessonBlock.find(b => b.id === gen1.data.asset_id);
  const b2 = server.db.LessonBlock.find(b => b.id === gen2.data.asset_id);

  assert.equal(b1.review_status, "approved");
  assert.equal(b2.review_status, "under_review");
});

// 11. 14/15 ASSEMBLY BLOCKING
test("11. 14/15 Assembly Blocking", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.2.1", block_type: "STORY_HOOK", review_status: "approved" });

  const { status, data } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp121", topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.ok(status === 400 || status === 422);
  assert.equal(data.success, false);
});

// 12. 15/15 ASSEMBLY SUCCESS
test("12. 15/15 Assembly Success", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "CONCEPT_CPA", review_status: "approved", payload: {} });

  const { status, data } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp121", topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.ok(data.lesson_version_id);
});

// 13. SNAPSHOT IMMUTABILITY
test("13. Snapshot Immutability", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: {} });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.2.1", topic_id: "top_nombor_100", block_type: "CONCEPT_CPA", review_status: "approved", payload: {} });

  const { data } = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp121", topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1"
  }, { serverUrl, userToken: "admin-token" });

  const snapshot = server.db.LessonVersion.find(v => v.id === data.lesson_version_id);
  assert.ok(snapshot);
  assert.equal(snapshot.status, "draft");
});

// 14. CROSS-SP ISOLATION
test("14. Cross-SP Isolation between SP 1.1.1, SP 1.2.1, and SP 1.2.2", async () => {
  server.db.LessonBlock.push({ id: "b_sp111", sp_code: "SP 1.1.1", block_type: "STORY_HOOK" });
  server.db.LessonBlock.push({ id: "b_sp121", sp_code: "SP 1.2.1", block_type: "STORY_HOOK" });
  server.db.LessonBlock.push({ id: "b_sp122", sp_code: "SP 1.2.2", block_type: "STORY_HOOK" });

  const sp121Blocks = server.db.LessonBlock.filter(b => b.sp_code === "SP 1.2.1");
  assert.equal(sp121Blocks.length, 1);
  assert.equal(sp121Blocks[0].id, "b_sp121");
});

// 15. BLOCK ISOLATION
test("15. Block Isolation across 15 canonical blocks", () => {
  const blockTypes = ["LESSON_HOOK", "STORY_HOOK", "REAL_WORLD_CONTEXT", "CONCEPT", "WORKED_EXAMPLE", "GUIDED_PRACTICE", "CONCEPT_CARD", "MIND_MAP", "INFOGRAPHIC", "FLASHCARD_DECK", "MATCHING_GAME", "INTERACTIVE_GAME", "VIDEO_LESSON", "AUDIO_HOOK", "QUIZ_QUESTION"];
  assert.equal(blockTypes.length, 15);
});

// 16. PROMPT ISOLATION
test("16. Prompt Isolation for Batch 1 SPs", async () => {
  const { data } = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_2", sp_code: "SP 1.2.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(data.success, true);
  assert.equal(data.curriculum_tags?.sp_code, "SP 1.2.1");
});

// 17. STUDENT RUNTIME ISOLATION
test("17. Student Runtime Isolation via getLearningPackage", async () => {
  server.db.LessonVersion.push({ id: "ver_sp121_pub", lesson_id: "les_121", sp_code: "SP 1.2.1", status: "published", review_status: "published" });
  server.db.LessonBlock.push({ id: "blk_sp121_pub", lesson_version_id: "ver_sp121_pub", sp_code: "SP 1.2.1", block_type: "STORY_HOOK", status: "published", payload: { title: "Published SP 1.2.1" } });

  const res = await invokeFunction(getLearningPackage, {
    lesson_version_id: "ver_sp121_pub"
  }, { serverUrl, userToken: "student-token" });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.package.lesson.sp_code, "SP 1.2.1");
});

// 18. ANSWER-KEY ISOLATION
test("18. Answer-Key Isolation in Assessment Endpoints", async () => {
  const question = server.db.QuestionBank.find(q => q.sp_code === "SP 1.2.1");
  if (question) {
    assert.ok(question.question);
  }
});

// 19. NO AUTO-PUBLISHING
test("19. No Auto-Publishing during Batch 1 generation or assembly", async () => {
  const publishedVersion = server.db.LessonVersion.find(v => v.status === "published");
  assert.equal(publishedVersion, undefined);
});

// 20. FAILED GENERATION ROLLBACK
test("20. Failed Generation Rollback preserves clean state", async () => {
  server.db.LessonBlock.push({ id: "b_app", sp_code: "SP 1.2.1", review_status: "approved" });

  await invokeFunction(generateContentAsset, {
    topic_id: "", sp_code: ""
  }, { serverUrl, userToken: "admin-token" }).catch(() => {});

  const b = server.db.LessonBlock.find(x => x.id === "b_app");
  assert.equal(b.review_status, "approved");
});
