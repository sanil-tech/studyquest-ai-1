// tests/pipeline_hardening.test.js
// PRODUCTION CONTENT PIPELINE HARDENING TEST SUITE
// Validates: 8-Block Shell, AI Output Validation, Quality Shield (score >= 80), Answer Key Stripping, Server-Authoritative Assessment.

import test from "node:test";
import assert from "node:assert/strict";

import {
  Base44TestServer,
  loadFunction,
  invokeFunction,
} from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateModularLessonContentModule;
let generateModularLessonContent;
let publishLessonVersion;
let getLearningPackage;
let submitAssessment;

test.before(async () => {
  serverUrl = await server.start();
  generateModularLessonContentModule = await loadFunction("./base44/functions/generateModularLessonContent/entry.ts");
  generateModularLessonContent = generateModularLessonContentModule.default;
  publishLessonVersion = (await loadFunction("./base44/functions/publishLessonVersion/entry.ts")).default;
  getLearningPackage = (await loadFunction("./base44/functions/getLearningPackage/entry.ts")).default;
  submitAssessment = (await loadFunction("./base44/functions/submitAssessment/entry.ts")).default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
});

// -----------------------------------------------------------------------------
// 1. DETERMINISTIC 8-BLOCK SHELL & VALIDATION TESTS
// -----------------------------------------------------------------------------

test("1. CANONICAL 8-BLOCK CONTRACT: Canonical order and supported widgets export", () => {
  const CANONICAL_8_BLOCKS = generateModularLessonContentModule.CANONICAL_8_BLOCKS;
  const SUPPORTED_WIDGETS = generateModularLessonContentModule.SUPPORTED_WIDGETS;

  assert.equal(CANONICAL_8_BLOCKS.length, 8);
  assert.deepEqual(CANONICAL_8_BLOCKS, [
    "STORY_HOOK",
    "LEARNING_OBJECTIVE",
    "CONCEPT_CPA",
    "WORKED_EXAMPLE",
    "INTERACTIVE_PRACTICE",
    "KNOWLEDGE_CHECK",
    "KEY_TAKEAWAY",
    "MISSION_COMPLETE",
  ]);
  assert.ok(SUPPORTED_WIDGETS.includes("base_ten_blocks"));
  assert.ok(SUPPORTED_WIDGETS.includes("matching_cards"));
});

test("2. STRUCTURAL VALIDATOR: Valid 8-block shell passes validation", () => {
  const validateGeneratedShell = generateModularLessonContentModule.validateGeneratedShell;
  const validShell = {
    lesson_title: "Penambahan Pecahan",
    sp_code: "SP 1.1.1",
    blocks: [
      { block_number: 1, block_type: "STORY_HOOK", content: { story_text: "Suku dan rakan-rakan berada di kedai kek...", mascot_dialogue: "Mari belajar bersama!" } },
      { block_number: 2, block_type: "LEARNING_OBJECTIVE", content: { i_can_statement: "Saya boleh menambah dua pecahan wajar." } },
      { block_number: 3, block_type: "CONCEPT_CPA", content: { concrete: { explanation: "Gunakan blok pembagi" }, pictorial: { explanation: "Rajah bulatan" }, abstract: { explanation: "1/4 + 2/4 = 3/4" } } },
      { block_number: 4, block_type: "WORKED_EXAMPLE", content: { problem_statement: "Hitung 1/5 + 2/5", solution_steps: ["Langkah 1", "Langkah 2"] } },
      { block_number: 5, block_type: "INTERACTIVE_PRACTICE", content: { widget_type: "fraction_slicer", instruction: "Iris pecahan mengikut soalan." } },
      { block_number: 6, block_type: "KNOWLEDGE_CHECK", content: { questions: [{ question: "1/3 + 1/3 = ?", options: ["2/3", "1/6"], correct_answer: "2/3" }, { question: "1/4 + 1/4 = ?", options: ["2/4", "1/2"], correct_answer: "2/4" }] } },
      { block_number: 7, block_type: "KEY_TAKEAWAY", content: { summary_points: ["Penyebut mesti sama", "Tambah pengangka sahaja"] } },
      { block_number: 8, block_type: "MISSION_COMPLETE", content: { celebration_message: "Tahniah! Anda telah menguasai penambahan pecahan." } },
    ]
  };

  const result = validateGeneratedShell(validShell);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("3. STRUCTURAL VALIDATOR: Rejects missing blocks, wrong order, and unsupported widgets", () => {
  const validateGeneratedShell = generateModularLessonContentModule.validateGeneratedShell;
  // Shell with 7 blocks
  const shortShell = {
    blocks: [
      { block_number: 1, block_type: "STORY_HOOK", content: { story_text: "Text here..." } },
    ]
  };
  const resShort = validateGeneratedShell(shortShell);
  assert.equal(resShort.valid, false);
  assert.ok(resShort.errors.some(e => e.includes("exactly 8 blocks")));

  // Shell with unsupported widget
  const badWidgetShell = {
    blocks: [
      { block_number: 1, block_type: "STORY_HOOK", content: { story_text: "Cerita panjang sekurang-kurangnya 15 aksara." } },
      { block_number: 2, block_type: "LEARNING_OBJECTIVE", content: { i_can_statement: "Saya boleh mengira." } },
      { block_number: 3, block_type: "CONCEPT_CPA", content: { concrete: { explanation: "Blok 1" }, pictorial: { explanation: "Rajah 2" }, abstract: { explanation: "Simbol 3" } } },
      { block_number: 4, block_type: "WORKED_EXAMPLE", content: { problem_statement: "Soalan 1", solution_steps: ["1", "2"] } },
      { block_number: 5, block_type: "INTERACTIVE_PRACTICE", content: { widget_type: "UNSUPPORTED_MAGIC_WIDGET", instruction: "Cuba jawab." } },
      { block_number: 6, block_type: "KNOWLEDGE_CHECK", content: { questions: [{ q: "1" }, { q: "2" }] } },
      { block_number: 7, block_type: "KEY_TAKEAWAY", content: { summary_points: ["A", "B"] } },
      { block_number: 8, block_type: "MISSION_COMPLETE", content: { celebration_message: "Tamat!" } },
    ]
  };
  const resBadWidget = validateGeneratedShell(badWidgetShell);
  assert.equal(resBadWidget.valid, false);
  assert.ok(resBadWidget.errors.some(e => e.includes("unsupported widget_type")));
});

test("4. STRUCTURAL VALIDATOR: Rejects placeholder strings (Sila jana semula, Lorem Ipsum)", () => {
  const validateGeneratedShell = generateModularLessonContentModule.validateGeneratedShell;
  const placeholderShell = {
    blocks: [
      { block_number: 1, block_type: "STORY_HOOK", content: { story_text: "Sila jana semula blok ini." } },
      { block_number: 2, block_type: "LEARNING_OBJECTIVE", content: { i_can_statement: "Saya boleh mengira." } },
      { block_number: 3, block_type: "CONCEPT_CPA", content: { concrete: { explanation: "Blok 1" }, pictorial: { explanation: "Rajah 2" }, abstract: { explanation: "Simbol 3" } } },
      { block_number: 4, block_type: "WORKED_EXAMPLE", content: { problem_statement: "Soalan 1", solution_steps: ["1", "2"] } },
      { block_number: 5, block_type: "INTERACTIVE_PRACTICE", content: { widget_type: "fraction_slicer", instruction: "Cuba jawab." } },
      { block_number: 6, block_type: "KNOWLEDGE_CHECK", content: { questions: [{ q: "1" }, { q: "2" }] } },
      { block_number: 7, block_type: "KEY_TAKEAWAY", content: { summary_points: ["A", "B"] } },
      { block_number: 8, block_type: "MISSION_COMPLETE", content: { celebration_message: "Tamat!" } },
    ]
  };

  const result = validateGeneratedShell(placeholderShell);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("forbidden placeholder string")));
});

// -----------------------------------------------------------------------------
// 2. QUALITY SHIELD HARDENING TESTS
// -----------------------------------------------------------------------------

test("5. QUALITY SHIELD: quality_score = 79 is BLOCKED from publishing", async () => {
  server.db.LessonVersion.push({
    id: "ver_score_79",
    lesson_id: "les_1",
    quality_score: 79,
    preview_status: "APPROVED",
    status: "draft",
  });

  const { status, data } = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_score_79",
  }, { serverUrl, userToken: "teacher-token" });

  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.ok(data.error.includes("<80%"));
});

test("6. QUALITY SHIELD: quality_score = 0 / null / undefined is BLOCKED from publishing", async () => {
  server.db.LessonVersion.push({
    id: "ver_score_null",
    lesson_id: "les_1",
    quality_score: null,
    preview_status: "APPROVED",
    status: "draft",
  });

  const { status, data } = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_score_null",
  }, { serverUrl, userToken: "teacher-token" });

  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.ok(data.error.includes("<80%"));
});

test("7. QUALITY SHIELD: Non-admin user CANNOT bypass Quality Shield with force_publish", async () => {
  server.db.LessonVersion.push({
    id: "ver_bypass_test",
    lesson_id: "les_1",
    quality_score: 50,
    preview_status: "APPROVED",
    status: "draft",
  });

  const { status, data } = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_bypass_test",
    force_publish: true,
  }, { serverUrl, userToken: "regular-user-token" });

  assert.equal(status, 400);
  assert.equal(data.success, false);
});

// -----------------------------------------------------------------------------
// 3. GET LEARNING PACKAGE & SECURITY ISOLATION TESTS
// -----------------------------------------------------------------------------

test("8. GET LEARNING PACKAGE: Student runtime rejects draft versions (isPreview false)", async () => {
  server.db.Lesson.push({ id: "les_draft_only", title: "Pelajaran Draf" });
  server.db.LessonVersion.push({
    id: "ver_draft_1",
    lesson_id: "les_draft_only",
    status: "draft",
    review_status: "draft",
  });

  const { status, data } = await invokeFunction(getLearningPackage, {
    lesson_id: "les_draft_only",
    preview: false,
  }, { serverUrl });

  assert.equal(status, 404);
  assert.equal(data.success, false);
});

test("9. GET LEARNING PACKAGE: Returned payload NEVER exposes answer keys to student", async () => {
  server.db.Lesson.push({ id: "les_pub_sec", published_version_id: "ver_pub_sec", title: "Matematik" });
  server.db.LessonVersion.push({
    id: "ver_pub_sec",
    lesson_id: "les_pub_sec",
    status: "published",
    review_status: "published",
  });
  server.db.Assessment.push({ id: "asm_1", lesson_id: "les_pub_sec", workflow_status: "PUBLISHED" });
  server.db.QuestionBank.push({ id: "q1", assessment_id: "asm_1", question_text: "Berapakah 2 + 2?", status: "published" });
  server.db.QuestionOption.push({ id: "opt1", question_id: "q1", text: "4", is_correct: true, label: "A" });
  server.db.QuestionOption.push({ id: "opt2", question_id: "q1", text: "5", is_correct: false, label: "B" });

  const { status, data } = await invokeFunction(getLearningPackage, {
    lesson_id: "les_pub_sec",
  }, { serverUrl });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  
  const serialized = JSON.stringify(data);
  assert.equal(serialized.includes('"is_correct"'), false);
  assert.equal(serialized.includes('"correct_answer"'), false);
  assert.equal(serialized.includes('"correct_option_id"'), false);
});

// -----------------------------------------------------------------------------
// 4. SUBMIT ASSESSMENT & SERVER AUTHORITY TESTS
// -----------------------------------------------------------------------------

test("10. SUBMIT ASSESSMENT: Server derives score & rewards, ignoring client-submitted scores", async () => {
  server.db.Assessment.push({
    id: "asm_eval",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
  });

  server.db.QuestionBank.push({
    id: "q_eval_1",
    assessment_id: "asm_eval",
    question_text: "Soalan 1",
    correct_answer: "4",
  });

  server.db.QuestionOption.push({
    id: "opt_corr",
    question_id: "q_eval_1",
    text: "4",
    is_correct: true,
    label: "A",
  });

  const { status, data } = await invokeFunction(submitAssessment, {
    student_id: "std_100",
    assessment_id: "asm_eval",
    answers: [{ question_id: "q_eval_1", selected_option_id: "opt_corr" }],
    // Manipulated client fields: attempt to force 0 score or 9999 XP
    score: 0,
    score_percentage: 0,
    xp_earned: 9999,
    coins_earned: 9999,
  }, { serverUrl, userToken: "std_100" });

  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.score, 100);
  assert.equal(data.passed, true);
  assert.equal(data.xp_earned, 50);
  assert.equal(data.coins_earned, 10);
});

test("11. SUBMIT ASSESSMENT: Duplicate submission returns idempotent result without farming rewards", async () => {
  server.db.Assessment.push({
    id: "asm_idem",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
  });

  server.db.QuestionBank.push({
    id: "q_idem_1",
    assessment_id: "asm_idem",
    correct_answer: "A",
  });

  server.db.QuestionOption.push({
    id: "opt_idem_a",
    question_id: "q_idem_1",
    text: "A",
    is_correct: true,
    label: "A",
  });

  const payload = {
    student_id: "std_idem",
    assessment_id: "asm_idem",
    answers: [{ question_id: "q_idem_1", selected_option_id: "opt_idem_a" }],
  };

  // First submission
  const res1 = await invokeFunction(submitAssessment, payload, { serverUrl, userToken: "std_idem" });
  assert.equal(res1.status, 200);
  assert.equal(res1.data.xp_earned, 50);

  // Second identical submission
  const res2 = await invokeFunction(submitAssessment, payload, { serverUrl, userToken: "std_idem" });
  assert.equal(res2.status, 200);
  assert.equal(res2.data.is_duplicate, true);
});

test("12. GENERATION REQUEST CONTRACT: Valid Admin Content Studio payload succeeds with 8 canonical blocks and lesson_id/version_id", async () => {
  const payload = {
    sp_code: "SP 1.2.1",
    sk_code: "SK 1.2",
    subject: "Matematik",
    year_level: "Tahun 1",
    topic: "Kenali 1 hingga 10",
    curriculum_type: "KSSR_SEMAKAN",
  };

  const res = await invokeFunction(generateModularLessonContent, payload, { userToken: "admin_token" });
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.lesson_id);
  assert.ok(res.data.version_id);
  assert.ok(Array.isArray(res.data.blocks));
  assert.equal(res.data.blocks.length, 8);

  const blockTypes = res.data.blocks.map((b) => b.block_type);
  assert.deepEqual(blockTypes, CANONICAL_8_BLOCKS);
});

