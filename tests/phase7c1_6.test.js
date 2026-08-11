// tests/phase7c1_6.test.js
// PHASE 7C-1.6 — MULTI-SP CONTENT QUALITY & CROSS-CONTAMINATION AUDIT TEST SUITE

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
  buildMacroPrompt,
  getPromptForAssetType
} from "../src/lib/blockPromptRegistry.js";

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
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_2", standard_learning_code: "SP 1.1.2", topic_id: "top_nombor_100" });
  server.db.CurriculumStandard.push({ id: "cs_3", standard_learning_code: "SP 2.1.1", topic_id: "top_tambah" });
});

// 1. SAME-SK SP ISOLATION
test("1. Same-SK SP Isolation (SP 1.1.1 vs SP 1.1.2)", async () => {
  const sp1 = getSPDetail("1.1.1");
  const sp2 = getSPDetail("1.1.2");

  assert.ok(sp1 && sp2);
  assert.equal(sp1.sk_code, sp2.sk_code);
  assert.notEqual(sp1.sp_code, sp2.sp_code);

  const prompt1 = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_nombor_100", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  const prompt2 = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_nombor_100", sp_code: "SP 1.1.2" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(prompt1.includes("SP 1.1.1"));
  assert.ok(prompt2.includes("SP 1.1.2"));
  assert.notEqual(prompt1, prompt2);
});

// 2. SAME-TOPIC SP ISOLATION
test("2. Same-Topic SP Isolation (SP 1.1.1 vs SP 1.2.1)", async () => {
  const sp1 = getSPDetail("1.1.1");
  const sp2 = getSPDetail("1.2.1");

  assert.ok(sp1 && sp2);
  assert.equal(sp1.topic_name, sp2.topic_name);
  assert.notEqual(sp1.sk_code, sp2.sk_code);
});

// 3. DIFFERENT-TOPIC ISOLATION
test("3. Different-Topic Isolation (SP 1.1.1 vs SP 2.1.1 vs SP 3.1.1)", async () => {
  const spNombor = getSPDetail("1.1.1");
  const spTambah = getSPDetail("2.1.1");
  const spPecahan = getSPDetail("3.1.1");

  assert.ok(spNombor && spTambah && spPecahan);
  assert.notEqual(spNombor.topic_name, spTambah.topic_name);
  assert.notEqual(spTambah.topic_name, spPecahan.topic_name);
});

// 4. PREVIOUS-BLOCK CONTEXT ISOLATION
test("4. Previous-Block Context Isolation", async () => {
  const summaryA = "Learner compared set of 5 apples to set of 3 apples.";
  const summaryB = "Learner wrote number word 'lapan' in exercise book.";

  const promptA = buildMacroPrompt({
    asset_type: "WORKED_EXAMPLE",
    curriculum_context: { topic_id: "top_nombor_100", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" },
    previous_block_summary: summaryA
  });

  const promptB = buildMacroPrompt({
    asset_type: "WORKED_EXAMPLE",
    curriculum_context: { topic_id: "top_nombor_100", sp_code: "SP 1.1.3" },
    learner_profile: { year_level: "Tahun 1" },
    previous_block_summary: summaryB
  });

  assert.ok(promptA.includes(summaryA));
  assert.ok(promptB.includes(summaryB));
  assert.equal(promptA.includes(summaryB), false);
  assert.equal(promptB.includes(summaryA), false);
});

// 5. CURRICULUM IDENTITY ISOLATION
test("5. Curriculum Identity Isolation in Database", async () => {
  const genA = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.1",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const genB = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.2",
    asset_type: "LESSON_HOOK", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const blockA = server.db.LessonBlock.find(b => b.id === genA.data.asset_id);
  const blockB = server.db.LessonBlock.find(b => b.id === genB.data.asset_id);

  assert.equal(blockA.sp_code, "SP 1.1.1");
  assert.equal(blockB.sp_code, "SP 1.1.2");
});

// 6. ASSET VERSION ISOLATION
test("6. Asset Version Isolation Across SPs", async () => {
  const genA = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.1",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  await invokeFunction(approveContentAsset, { asset_id: genA.data.asset_id, action: "approve" }, { serverUrl, userToken: "admin-token" });

  const genB = await invokeFunction(generateContentAsset, {
    topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.2",
    asset_type: "CONCEPT", subject_name: "Matematik", year_level: "Tahun 1"
  }, { serverUrl, userToken: "admin-token" });

  const blockA = server.db.LessonBlock.find(b => b.id === genA.data.asset_id);
  const blockB = server.db.LessonBlock.find(b => b.id === genB.data.asset_id);

  assert.equal(blockA.review_status, "approved");
  assert.equal(blockB.review_status, "under_review");
});

// 7. ASSEMBLY ISOLATION
test("7. Assembly Isolation Across SPs", async () => {
  // Seed approved assets for SP 1.1.1
  server.db.LessonBlock.push({ id: "b1_sp111", sp_code: "SP 1.1.1", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "SP 1.1.1 Hook" } });
  server.db.LessonBlock.push({ id: "b2_sp111", sp_code: "SP 1.1.1", topic_id: "top_nombor_100", block_type: "LEARNING_OBJECTIVE", review_status: "approved", payload: { title: "SP 1.1.1 Obj" } });
  server.db.LessonBlock.push({ id: "b3_sp111", sp_code: "SP 1.1.1", topic_id: "top_nombor_100", block_type: "CONCEPT_CPA", review_status: "approved", payload: { title: "SP 1.1.1 Concept" } });

  // Seed approved assets for SP 1.1.2
  server.db.LessonBlock.push({ id: "b1_sp112", sp_code: "SP 1.1.2", topic_id: "top_nombor_100", block_type: "STORY_HOOK", review_status: "approved", payload: { title: "SP 1.1.2 Hook" } });

  const res111 = await invokeFunction(assembleLessonFromApprovedAssets, {
    lesson_id: "les_sp111", topic_id: "top_nombor_100", subtopic_id: "sub_1_1", sp_code: "SP 1.1.1"
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(res111.status, 201);
  const compiled111 = server.db.LessonBlock.filter(b => b.lesson_version_id === res111.data.lesson_version_id);
  assert.equal(compiled111.length, 3);
  assert.ok(compiled111.every(b => b.sp_code === "SP 1.1.1"));
});

// 8. STUDENT RUNTIME ISOLATION
test("8. Student Runtime Isolation via getLearningPackage", async () => {
  server.db.LessonVersion.push({ id: "ver_sp111_pub", lesson_id: "les_111", sp_code: "SP 1.1.1", status: "published", review_status: "published" });
  server.db.LessonBlock.push({ id: "blk_sp111_pub", lesson_version_id: "ver_sp111_pub", sp_code: "SP 1.1.1", block_type: "STORY_HOOK", status: "published", payload: { title: "Published SP 1.1.1" } });

  const res = await invokeFunction(getLearningPackage, {
    lesson_version_id: "ver_sp111_pub"
  }, { serverUrl, userToken: "student-token" });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.package.lesson.sp_code, "SP 1.1.1");
});

// 9. BLOCK-PURPOSE ISOLATION
test("9. Block-Purpose Isolation across 15 Canonical Blocks", () => {
  const hookContract = getPromptForAssetType("LESSON_HOOK");
  const conceptContract = getPromptForAssetType("CONCEPT");
  const quizContract = getPromptForAssetType("QUIZ_QUESTION");

  assert.equal(hookContract.asset_type, "LESSON_HOOK");
  assert.equal(conceptContract.asset_type, "CONCEPT");
  assert.equal(quizContract.asset_type, "QUIZ_QUESTION");

  assert.notEqual(hookContract.pedagogical_purpose, conceptContract.pedagogical_purpose);
  assert.notEqual(conceptContract.pedagogical_purpose, quizContract.pedagogical_purpose);
});

// 10. PROMPT PILOT LEAKAGE DETECTION
test("10. Prompt Pilot Leakage Detection (Macro Prompt v1.0 Generalization)", () => {
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_wang", sp_code: "SP 4.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(prompt.includes("SP 4.1.1"));
  assert.equal(prompt.includes("SP 1.1.1"), false, "Prompt MUST NOT leak Golden Pilot SP 1.1.1");
  assert.equal(prompt.includes("Banyak dan Sedikit"), false, "Prompt MUST NOT leak Golden Pilot topic name");
});
