// tests/phase5b.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { loadFunction, invokeFunction, Base44TestServer } from "./base44Harness.js";
import { buildMacroPrompt } from "../src/lib/blockPromptRegistry.js";

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
  // Seed valid curriculum taxonomy
  server.db.Topic.push({ id: "top_banyak_sedikit", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_membandingkan", topic_id: "top_banyak_sedikit", title: "Membandingkan Kuantiti" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_banyak_sedikit" });
});

test("Test 1: One request generates exactly one asset", async () => {
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
  assert.equal(res.data.success, true);
  assert.equal(res.data.asset_type, "LESSON_HOOK");
  assert.ok(res.data.asset_id);
  assert.equal(res.data.status, "draft");
  assert.equal(res.data.review_status, "under_review");

  // Verify only 1 record created in database
  const createdBlocks = server.db.LessonBlock.filter((b) => b.sp_code === "SP 1.1.1");
  assert.equal(createdBlocks.length, 1);
});

test("Test 2: Correct curriculum identity is attached", async () => {
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
  const block = server.db.LessonBlock.find((b) => b.id === res.data.asset_id);
  assert.ok(block);
  assert.equal(block.topic_id, "top_banyak_sedikit");
  assert.equal(block.subtopic_id, "sub_membandingkan");
  assert.equal(block.sp_code, "SP 1.1.1");
});

test("Test 3: Block-specific Macro Prompt is selected", () => {
  const hookPrompt = buildMacroPrompt({
    asset_type: "LESSON_HOOK",
    curriculum_context: { topic: "Banyak dan Sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  const conceptPrompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic: "Banyak dan Sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(hookPrompt.includes("LESSON_HOOK"));
  assert.ok(conceptPrompt.includes("CONCEPT"));
  assert.notEqual(hookPrompt, conceptPrompt);
});

test("Test 4: Engagement does not use Concept prompt", () => {
  const hookPrompt = buildMacroPrompt({
    asset_type: "LESSON_HOOK",
    curriculum_context: { topic: "Banyak dan Sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(hookPrompt.includes("story hook writer"));
  assert.equal(hookPrompt.includes("Concrete-Pictorial-Abstract (CPA) master teacher"), false);
});

test("Test 5: AI cannot modify curriculum identity", async () => {
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
  assert.equal(res.data.curriculum_tags.sp_code, "SP 1.1.1");
  assert.equal(res.data.curriculum_tags.topic_id, "top_banyak_sedikit");
});

test("Test 6: Rejected asset does not become approved", async () => {
  // First create a draft block
  server.db.LessonBlock.push({
    id: "block_reject_test",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    title: "Draft Story Hook",
    status: "draft",
    review_status: "under_review",
    quality_score: 85,
    payload: { markdown: "Narrative hook text" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_reject_test",
    action: "reject",
    rejection_reason: "Aktiviti terlalu kompleks untuk murid Tahun 1."
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.review_status, "rejected");

  const updated = server.db.LessonBlock.find((b) => b.id === "block_reject_test");
  assert.equal(updated.review_status, "rejected");
  assert.equal(updated.rejection_reason, "Aktiviti terlalu kompleks untuk murid Tahun 1.");
});

test("Test 7: Approved asset becomes reusable library content", async () => {
  server.db.LessonBlock.push({
    id: "block_approve_test",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    title: "Approved Story Hook",
    status: "draft",
    review_status: "under_review",
    quality_score: 90,
    payload: { markdown: "Approved narrative hook text" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_approve_test",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.review_status, "approved");

  const approvedInDb = server.db.LessonBlock.filter((b) => b.review_status === "approved");
  assert.equal(approvedInDb.length, 1);
  assert.equal(approvedInDb[0].id, "block_approve_test");
});

test("Test 8: Regeneration does not overwrite approved content", async () => {
  // Existing approved block
  server.db.LessonBlock.push({
    id: "block_existing_approved",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "STORY_HOOK",
    title: "Approved Story Hook V1",
    status: "draft",
    review_status: "approved",
    quality_score: 92,
    payload: { markdown: "Version 1 text" }
  });

  // Generate fresh asset
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
  assert.notEqual(res.data.asset_id, "block_existing_approved");

  // Verify approved V1 block is still intact and approved in DB
  const originalApproved = server.db.LessonBlock.find((b) => b.id === "block_existing_approved");
  assert.equal(originalApproved.review_status, "approved");
  assert.equal(originalApproved.payload.markdown, "Version 1 text");
});

test("Test 9: Previous approved block context is isolated and controlled", () => {
  const summary = "Learner compared two groups of objects and predicted which contains more.";
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic: "Banyak dan Sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" },
    previous_block_summary: summary
  });

  assert.ok(prompt.includes("[PEDAGOGICAL CONTINUITY — PREVIOUS BLOCK SUMMARY]"));
  assert.ok(prompt.includes(summary));
});

test("Test 10: Published snapshot remains immutable", async () => {
  server.db.LessonVersion.push({
    id: "ver_pub_101",
    lesson_id: "les_101",
    version_number: 1,
    status: "published",
    review_status: "published"
  });

  server.db.LessonBlock.push({
    id: "block_pub_101",
    lesson_version_id: "ver_pub_101",
    sp_code: "SP 1.1.1",
    status: "published",
    review_status: "published",
    quality_score: 95
  });

  // Attempting to run approveContentAsset on a published record must fail with 422
  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_pub_101",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});
