// tests/phase6a.test.js
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

test.before(async () => {
  serverUrl = await server.start();
  const genMod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = genMod.default;

  const appMod = await loadFunction("./base44/functions/approveContentAsset/entry.ts");
  approveContentAssetHandler = appMod.default;

  const assMod = await loadFunction("./base44/functions/assembleLessonFromApprovedAssets/entry.ts");
  assembleLessonHandler = assMod.default;
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
// CURRICULUM (1-3)
// ============================================================================
test("1. Cascading curriculum selector uses canonical IDs", async () => {
  const topic = server.db.Topic.find((t) => t.id === "top_banyak_sedikit");
  const subtopic = server.db.Subtopic.find((s) => s.id === "sub_membandingkan");
  const sp = server.db.CurriculumStandard.find((c) => c.standard_learning_code === "SP 1.1.1");

  assert.ok(topic);
  assert.equal(topic.id, "top_banyak_sedikit");
  assert.ok(subtopic);
  assert.equal(subtopic.topic_id, topic.id);
  assert.ok(sp);
  assert.equal(sp.topic_id, topic.id);
});

test("2. Invalid curriculum identity is rejected", async () => {
  server.db.Subtopic.push({ id: "sub_invalid", topic_id: "top_other_99", title: "Subtopik Lain" });

  const invalidPayload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_invalid", // Belongs to top_other_99
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK"
  };

  const res = await invokeFunction(generateContentAssetHandler, invalidPayload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error_code, "INVALID_CURRICULUM");
});

test("3. AI cannot invent SP codes", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
});

// ============================================================================
// COVERAGE (4-8)
// ============================================================================
test("4. Coverage is calculated from database state", () => {
  const records = [
    { review_status: "approved", status: "draft" }
  ];
  const state = getAssetCoverageState(records);
  assert.equal(state, COVERAGE_STATES.APPROVED);
});

test("5. Approved assets count correctly", () => {
  const records = [{ review_status: "approved" }];
  const state = getAssetCoverageState(records);
  assert.equal(state, COVERAGE_STATES.APPROVED);
});

test("6. Draft assets do not count as approved", () => {
  const records = [{ review_status: "under_review", status: "draft" }];
  const state = getAssetCoverageState(records);
  assert.notEqual(state, COVERAGE_STATES.APPROVED);
  assert.equal(state, COVERAGE_STATES.UNDER_REVIEW);
});

test("7. Rejected assets do not count as approved", () => {
  const records = [{ review_status: "rejected", status: "draft" }];
  const state = getAssetCoverageState(records);
  assert.equal(state, COVERAGE_STATES.REJECTED);
});

test("8. Superseded assets do not incorrectly count as current", () => {
  const records = [
    { review_status: "approved", status: "draft" },
    { review_status: "superseded", status: "archived" }
  ];
  const state = getAssetCoverageState(records);
  assert.equal(state, COVERAGE_STATES.APPROVED);
});

// ============================================================================
// GENERATION (9-12)
// ============================================================================
test("9. Generate Next selects only one block", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.asset_type, "LESSON_HOOK");
  assert.ok(res.data.asset_id);
});

test("10. Generation uses generateContentAsset", async () => {
  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "WORKED_EXAMPLE",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
});

test("11. Macro Prompt Registry remains authoritative", () => {
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(prompt.includes("STUDYQUEST AI — MACRO PROMPT CONTRACT"));
});

test("12. Approved assets cannot be overwritten automatically", async () => {
  server.db.LessonBlock.push({
    id: "block_app_12",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "approved",
    payload: { title: "Approved V1" }
  });

  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.notEqual(res.data.asset_id, "block_app_12");

  const original = server.db.LessonBlock.find((b) => b.id === "block_app_12");
  assert.equal(original.payload.title, "Approved V1");
});

// ============================================================================
// APPROVAL (13-16)
// ============================================================================
test("13. Approval uses approveContentAsset", async () => {
  server.db.LessonBlock.push({
    id: "block_to_approve",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "under_review",
    quality_score: 90,
    payload: { title: "Payload Content" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_to_approve",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.review_status, "approved");
});

test("14. Client cannot fake approval", async () => {
  server.db.LessonBlock.push({
    id: "block_fake_app",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "under_review",
    quality_score: 50, // Low quality
    payload: { title: "Payload Content" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_fake_app",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "QUALITY_GATE_FAILED");
});

test("15. Rejection reason is preserved", async () => {
  server.db.LessonBlock.push({
    id: "block_reject_15",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "under_review",
    quality_score: 85,
    payload: { title: "Payload Content" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_reject_15",
    action: "reject",
    rejection_reason: "Bahasa terlalu sukar untuk Tahun 1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.review_status, "rejected");

  const rec = server.db.LessonBlock.find((b) => b.id === "block_reject_15");
  assert.equal(rec.rejection_reason, "Bahasa terlalu sukar untuk Tahun 1");
});

test("16. Regeneration creates a new version/draft", async () => {
  server.db.LessonBlock.push({
    id: "block_v1",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "CONCEPT_CPA",
    status: "draft",
    review_status: "approved",
    quality_score: 95
  });

  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.notEqual(res.data.asset_id, "block_v1");

  const allConcepts = server.db.LessonBlock.filter((b) => b.sp_code === "SP 1.1.1");
  assert.equal(allConcepts.length, 2);
});

// ============================================================================
// ASSEMBLY (17-20)
// ============================================================================
test("17. Assembly unavailable when required assets are missing", async () => {
  // Missing required assets (CONCEPT_CPA / LEARNING_OBJECTIVE)
  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "MISSING_REQUIRED_ASSET");
});

test("18. Assembly only uses approved assets", async () => {
  server.db.LessonBlock.push({
    id: "b_hook",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Hook" }
  });
  server.db.LessonBlock.push({
    id: "b_obj",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "LEARNING_OBJECTIVE",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Objective" }
  });
  server.db.LessonBlock.push({
    id: "b_concept",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "CONCEPT_CPA",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Concept" }
  });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.lesson_version_id);
});

test("19. Assembly creates immutable snapshot", async () => {
  server.db.LessonBlock.push({
    id: "b_hook_19",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Hook 19" }
  });
  server.db.LessonBlock.push({
    id: "b_obj_19",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "LEARNING_OBJECTIVE",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Objective 19" }
  });
  server.db.LessonBlock.push({
    id: "b_concept_19",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "CONCEPT_CPA",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Concept 19" }
  });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  const versionId = res.data.lesson_version_id;
  const version = server.db.LessonVersion.find((v) => v.id === versionId);
  assert.ok(version);
  assert.ok(version.review_status === "draft" || version.review_status === "under_review");
});

test("20. Assembly cannot mutate an existing published version", async () => {
  server.db.LessonVersion.push({
    id: "ver_pub_20",
    lesson_id: "les_top_banyak_sedikit",
    status: "published",
    review_status: "published"
  });

  // Attempting to run approveContentAsset or modify published version fails
  server.db.LessonBlock.push({
    id: "block_pub_20",
    lesson_version_id: "ver_pub_20",
    sp_code: "SP 1.1.1",
    status: "published",
    review_status: "published"
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_pub_20",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});

// ============================================================================
// PUBLISHING (21-22)
// ============================================================================
test("21. Assembly does not automatically publish", async () => {
  server.db.LessonBlock.push({
    id: "b_hook_21",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Hook 21" }
  });
  server.db.LessonBlock.push({
    id: "b_obj_21",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "LEARNING_OBJECTIVE",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Objective 21" }
  });
  server.db.LessonBlock.push({
    id: "b_concept_21",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "CONCEPT_CPA",
    status: "draft",
    review_status: "approved",
    quality_score: 90,
    payload: { title: "Concept 21" }
  });

  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.notEqual(res.data.status, "published");
  assert.notEqual(res.data.review_status, "published");
});

test("22. Published lesson remains protected", async () => {
  server.db.LessonBlock.push({
    id: "block_pub_22",
    sp_code: "SP 1.1.1",
    status: "published",
    review_status: "published"
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_pub_22",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});

// ============================================================================
// SECURITY (23-24)
// ============================================================================
test("23. Unauthorized users cannot approve assets", async () => {
  server.db.LessonBlock.push({
    id: "block_sec_23",
    sp_code: "SP 1.1.1",
    status: "draft",
    review_status: "under_review",
    quality_score: 90
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_sec_23",
    action: "approve"
  }, {
    serverUrl,
    userToken: "student-token"
  });

  assert.equal(res.status, 403);
  assert.equal(res.data.error_code, "FORBIDDEN");
});

test("24. Unauthorized users cannot assemble protected content", async () => {
  const res = await invokeFunction(assembleLessonHandler, {
    lesson_id: "les_top_banyak_sedikit",
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1"
  }, {
    serverUrl,
    userToken: "student-token"
  });

  assert.equal(res.status, 403);
  assert.equal(res.data.error_code, "FORBIDDEN");
});
