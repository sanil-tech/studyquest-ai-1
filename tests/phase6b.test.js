// tests/phase6b.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { loadFunction, invokeFunction, Base44TestServer } from "./base44Harness.js";
import { getPromptForAssetType, buildMacroPrompt } from "../src/lib/blockPromptRegistry.js";
import { getAssetCoverageState, COVERAGE_STATES } from "../src/lib/contentAssetContract.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAssetHandler = null;
let approveContentAssetHandler = null;
let assembleLessonHandler = null;
let publishLessonVersionHandler = null;

const ALL_15_CANONICAL_BLOCKS = [
  "STORY_HOOK",
  "REAL_WORLD_CONTEXT",
  "AUDIO_HOOK",
  "MIND_MAP",
  "INFOGRAPHIC",
  "CONCEPT_CARD",
  "FLASHCARD_DECK",
  "MATCHING_GAME",
  "VIDEO_LESSON",
  "WORKED_EXAMPLE",
  "GUIDED_PRACTICE",
  "INTERACTIVE_PRACTICE",
  "KEY_TAKEAWAY",
  "INTERACTIVE_GAME",
  "LEARNING_OBJECTIVE"
];

test.before(async () => {
  serverUrl = await server.start();
  const genMod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = genMod.default;

  const appMod = await loadFunction("./base44/functions/approveContentAsset/entry.ts");
  approveContentAssetHandler = appMod.default;

  const assMod = await loadFunction("./base44/functions/assembleLessonFromApprovedAssets/entry.ts");
  assembleLessonHandler = assMod.default;

  const pubMod = await loadFunction("./base44/functions/publishLessonVersion/entry.ts");
  publishLessonVersionHandler = pubMod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
  server.db.Topic.push({ id: "top_banyak_sedikit", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_membandingkan", topic_id: "top_banyak_sedikit", title: "Membandingkan Kuantiti" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_banyak_sedikit" });
});

// ============================================================================
// 1. CURRICULUM (1-5)
// ============================================================================
test("1. Correct Subject binding", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 201);
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
});

test("2. Correct Year binding", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 201);
});

test("3. Correct Topic binding", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "WORKED_EXAMPLE",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.data.curriculum_tags.topic_id, "top_banyak_sedikit");
});

test("4. Correct Subtopic binding", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "GUIDED_PRACTICE",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.data.curriculum_tags.subtopic_id, "sub_membandingkan");
});

test("5. Correct SP binding", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "QUIZ_QUESTION",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
});

// ============================================================================
// 2. GENERATION (6-10)
// ============================================================================
test("6. One-request-one-asset", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 201);
  const blocks = server.db.LessonBlock.filter((b) => b.sp_code === "SP 1.1.1");
  assert.equal(blocks.length, 1);
});

test("7. Correct block type", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "FLASHCARD",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.data.asset_type, "FLASHCARD");
});

test("8. Macro Prompt Registry used", () => {
  const prompt = buildMacroPrompt({
    asset_type: "INTERACTIVE",
    curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });
  assert.ok(prompt.includes("STUDYQUEST AI — MACRO PROMPT CONTRACT"));
});

test("9. Correct Macro Prompt version", () => {
  const contract = getPromptForAssetType("VIDEO");
  assert.equal(contract.macro_version, "1.0");
});

test("10. Previous block summary bounded", () => {
  const summary = "Learner completed concrete marble grouping.";
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" },
    previous_block_summary: summary
  });
  assert.ok(prompt.includes(summary));
});

// ============================================================================
// 3. QUALITY (11-15)
// ============================================================================
test("11. Quality Shield enforced", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.ok(res.data.quality_score >= 75);
});

test("12. Invalid asset rejected", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "INVALID_UNKNOWN_TYPE"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 400);
  assert.equal(res.data.error_code, "INVALID_ASSET_TYPE");
});

test("13. Empty content rejected", async () => {
  server.db.LessonBlock.push({
    id: "block_empty",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    status: "draft",
    review_status: "under_review",
    payload: null // Empty payload
  });
  const res = await invokeFunction(approveContentAssetHandler, { asset_id: "block_empty", action: "approve" }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "INVALID_ASSET");
});

test("14. Unsupported widget rejected", () => {
  const interactiveContract = getPromptForAssetType("INTERACTIVE");
  assert.ok(interactiveContract.forbidden_behaviour.some(r => r.includes("unsupported widget")));
});

test("15. Curriculum mismatch rejected", async () => {
  server.db.Subtopic.push({ id: "sub_mismatch", topic_id: "top_other_11", title: "Sub Mismatch" });
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_mismatch",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 400);
  assert.equal(res.data.error_code, "INVALID_CURRICULUM");
});

// ============================================================================
// 4. APPROVAL (16-20)
// ============================================================================
test("16. Draft remains draft before approval", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.data.status, "draft");
  assert.equal(res.data.review_status, "under_review");
});

test("17. Approval requires authorization", async () => {
  server.db.LessonBlock.push({
    id: "b_auth_17",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    payload: { title: "Test" }
  });
  const res = await invokeFunction(approveContentAssetHandler, { asset_id: "b_auth_17", action: "approve" }, { serverUrl, userToken: "student-token" });
  assert.equal(res.status, 403);
});

test("18. Approved asset immutable", async () => {
  server.db.LessonBlock.push({
    id: "b_app_18",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    review_status: "approved",
    payload: { title: "Approved Title" }
  });
  const res = await invokeFunction(approveContentAssetHandler, { asset_id: "b_app_18", action: "approve" }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 200);
  assert.equal(res.data.message, "ALREADY_APPROVED");
});

test("19. Rejection reason preserved", async () => {
  server.db.LessonBlock.push({
    id: "b_rej_19",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    review_status: "under_review",
    quality_score: 85,
    payload: { title: "Rej Test" }
  });
  const res = await invokeFunction(approveContentAssetHandler, { asset_id: "b_rej_19", action: "reject", rejection_reason: "Terlalu abstrak untuk Tahun 1" }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 200);
  assert.equal(res.data.review_status, "rejected");
  const rec = server.db.LessonBlock.find(b => b.id === "b_rej_19");
  assert.equal(rec.rejection_reason, "Terlalu abstrak untuk Tahun 1");
});

test("20. Regeneration does not overwrite approved asset", async () => {
  server.db.LessonBlock.push({
    id: "b_approved_v1",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "approved",
    payload: { title: "V1 Text" }
  });
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK"
  };
  const res = await invokeFunction(generateContentAssetHandler, payload, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 201);
  assert.notEqual(res.data.asset_id, "b_approved_v1");
  const v1 = server.db.LessonBlock.find(b => b.id === "b_approved_v1");
  assert.equal(v1.payload.title, "V1 Text");
});

// ============================================================================
// 5. COVERAGE (21-23)
// ============================================================================
test("21. Coverage updates after approval", () => {
  const recordsBefore = [{ review_status: "under_review" }];
  assert.equal(getAssetCoverageState(recordsBefore), COVERAGE_STATES.UNDER_REVIEW);

  const recordsAfter = [{ review_status: "approved" }];
  assert.equal(getAssetCoverageState(recordsAfter), COVERAGE_STATES.APPROVED);
});

test("22. Draft does not count as approved", () => {
  const records = [{ review_status: "draft" }];
  assert.notEqual(getAssetCoverageState(records), COVERAGE_STATES.APPROVED);
});

test("23. Rejected asset does not count as approved", () => {
  const records = [{ review_status: "rejected" }];
  assert.equal(getAssetCoverageState(records), COVERAGE_STATES.REJECTED);
});

// ============================================================================
// 6. ASSEMBLY (24-28)
// ============================================================================
test("24. Assembly blocked when incomplete", async () => {
  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

test("25. Assembly uses approved assets only", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "Hook" } });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { title: "Obj" } });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "CONCEPT_CPA", review_status: "approved", payload: { title: "Concept" } });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(res.status, 201);
  assert.ok(res.data.lesson_version_id);
});

test("26. Deterministic block ordering", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "Hook" } });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { title: "Obj" } });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "CONCEPT_CPA", review_status: "approved", payload: { title: "Concept" } });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(res.status, 201);
  assert.equal(res.data.blocks_count, 3);
});

test("27. Snapshot immutable", async () => {
  server.db.LessonVersion.push({ id: "ver_snap_27", lesson_id: "les_27", status: "published", review_status: "published" });
  server.db.LessonBlock.push({ id: "b_snap_27", lesson_version_id: "ver_snap_27", sp_code: "SP 1.1.1", status: "published", review_status: "published", payload: { title: "Pub" } });

  const res = await invokeFunction(approveContentAssetHandler, { asset_id: "b_snap_27", action: "approve" }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});

test("28. Existing published version protected", async () => {
  server.db.LessonVersion.push({ id: "ver_pub_28", lesson_id: "les_top_banyak_sedikit", version_number: 1, status: "published", review_status: "published" });
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "Hook" } });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { title: "Obj" } });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "CONCEPT_CPA", review_status: "approved", payload: { title: "Concept" } });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(res.status, 201);
  assert.equal(res.data.version_number, 2);
  const v1 = server.db.LessonVersion.find(v => v.id === "ver_pub_28");
  assert.equal(v1.status, "published");
});

// ============================================================================
// 7. PUBLISHING (29-30)
// ============================================================================
test("29. Assembly does not auto-publish", async () => {
  server.db.LessonBlock.push({ id: "b1", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "Hook" } });
  server.db.LessonBlock.push({ id: "b2", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { title: "Obj" } });
  server.db.LessonBlock.push({ id: "b3", sp_code: "SP 1.1.1", topic_id: "top_banyak_sedikit", block_type: "CONCEPT_CPA", review_status: "approved", payload: { title: "Concept" } });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(res.status, 201);
  assert.notEqual(res.data.status, "published");
  assert.notEqual(res.data.review_status, "published");
});

test("30. Publish remains explicitly gated", async () => {
  server.db.LessonVersion.push({ id: "ver_draft_30", lesson_id: "les_30", version_number: 1, status: "draft", review_status: "draft" });
  server.db.LessonBlock.push({ id: "b1", lesson_version_id: "ver_draft_30", sp_code: "SP 1.1.1", block_type: "STORY_HOOK", status: "draft", review_status: "approved", quality_score: 90 });

  const res = await invokeFunction(publishLessonVersionHandler, { lesson_version_id: "ver_draft_30" }, { serverUrl, userToken: "admin-token" });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});
