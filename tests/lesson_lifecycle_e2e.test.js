// tests/lesson_lifecycle_e2e.test.js
// PHASE 7 — REAL LESSON LIFECYCLE END-TO-END CERTIFICATION TEST SUITE
// Verifies real production contracts using official KSSR Matematik Tahun 1 (SP 1.2.1: Kenali 1 hingga 10).

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

// Official KSSR Semakan Matematik Tahun 1 Curriculum Target
const REAL_KSSR_TARGET = {
  curriculum: "KSSR Semakan",
  subject: "Matematik",
  level: "Tahun 1",
  domain: "Nombor dan Operasi",
  topic: "Nombor hingga 100",
  subtopic: "Kenali 1 hingga 10",
  sk_code: "SK 1.2",
  sk_title: "Nilai Nombor",
  sp_code: "SP 1.2.1",
  sp_title: "Menamai nombor hingga 10 mengikut kumpulan objek",
};

// -----------------------------------------------------------------------------
// 1. KSSR TOPIC → LESSON RESOLUTION & LESSONVERSION DRAFT CREATION
// -----------------------------------------------------------------------------

test("1. KSSR TOPIC → LESSON RESOLUTION: Resolves topic to parent Lesson entity without duplicates", async () => {
  // First resolution: Auto-creates Lesson & LessonVersion
  const res1 = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res1.status, 200);
  assert.equal(res1.data.success, true);
  assert.ok(res1.data.version_id, "Returned version_id");

  const createdLessonId = res1.data.lesson_id;
  assert.ok(createdLessonId, "Returned lesson_id");

  // Verify entity in DB
  const lesson = server.db.Lesson.find(l => l.id === createdLessonId);
  assert.ok(lesson, "Lesson entity exists in DB");
  assert.equal(lesson.subject_name, REAL_KSSR_TARGET.subject);

  // Second resolution: Uses existing Lesson and does not duplicate Lesson entity
  const res2 = await invokeFunction(generateModularLessonContent, {
    lesson_version_id: res1.data.version_id,
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res2.status, 200);
  assert.equal(server.db.Lesson.length, 1, "Lesson entity was not duplicated");
});

test("2. LESSONVERSION DRAFT CREATION: Version is created in draft status and tied to parent Lesson", async () => {
  const res = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res.status, 200);
  const versionId = res.data.version_id;
  const version = server.db.LessonVersion.find(v => v.id === versionId);

  assert.ok(version, "LessonVersion entity exists");
  assert.equal(version.status, "draft");
  assert.equal(version.review_status, "draft");
  assert.equal(version.lesson_id, res.data.lesson_id);
});

// -----------------------------------------------------------------------------
// 2. VALID 8-BLOCK GENERATION & STRUCTURAL VALIDATION
// -----------------------------------------------------------------------------

test("3. VALID 8-BLOCK GENERATION: Generates exact canonical 8-block sequence", async () => {
  const res = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.blocks.length, 8);

  const blockTypes = res.data.blocks.map(b => b.block_type);
  assert.deepEqual(blockTypes, generateModularLessonContentModule.CANONICAL_8_BLOCKS);
});

test("4. STRUCTURAL VALIDATION: Structural validator approves generated 8-block shell", async () => {
  const res = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res.status, 200);
  const validation = generateModularLessonContentModule.validateGeneratedShell(res.data);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
});

test("5. QUALITY EVALUATION: Server quality score calculation is recorded on LessonVersion", async () => {
  const res = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  assert.equal(res.status, 200);
  const version = server.db.LessonVersion.find(v => v.id === res.data.version_id);
  assert.ok(typeof version.quality_score === "number", "Quality score is a number");
  assert.ok(version.quality_score >= 80, "Generated version meets Quality Shield >= 80 threshold");
});

// -----------------------------------------------------------------------------
// 3. ADMIN PREVIEW & PUBLICATION GATES
// -----------------------------------------------------------------------------

test("6. ADMIN PREVIEW: Admin receives draft version (preview=true) without altering block schema", async () => {
  // Create draft lesson
  const genRes = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  const lessonId = genRes.data.lesson_id;

  // Admin request with preview: true
  const previewRes = await invokeFunction(getLearningPackage, {
    lesson_id: lessonId,
    preview: true,
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(previewRes.status, 200);
  assert.equal(previewRes.data.success, true);
  assert.equal(previewRes.data.lesson_id, lessonId);
  assert.equal(previewRes.data.blocks.length, 8);
});

test("7. PUBLICATION GATES: Path A (valid quality >= 80 succeeds) vs Path B (quality < 80 / malformed rejected)", async () => {
  server.db.Lesson.push({ id: "les_path_a" });
  server.db.Lesson.push({ id: "les_path_b" });

  // Path A: Valid LessonVersion (quality_score = 90)
  server.db.LessonVersion.push({
    id: "ver_path_a",
    lesson_id: "les_path_a",
    quality_score: 90,
    preview_status: "APPROVED",
    status: "draft",
  });

  const pubResA = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_path_a",
    force_publish: true,
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(pubResA.status, 200);
  assert.equal(pubResA.data.success, true);
  const versionA = server.db.LessonVersion.find(v => v.id === "ver_path_a");
  assert.equal(versionA.status, "published");

  // Path B: Invalid LessonVersion (quality_score = 75)
  server.db.LessonVersion.push({
    id: "ver_path_b",
    lesson_id: "les_path_b",
    quality_score: 75,
    preview_status: "APPROVED",
    status: "draft",
  });

  const pubResB = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_path_b",
  }, { serverUrl, userToken: "admin-token" });

  assert.equal(pubResB.status, 400);
  assert.equal(pubResB.data.success, false);
  const versionB = server.db.LessonVersion.find(v => v.id === "ver_path_b");
  assert.equal(versionB.status, "draft");
});

// -----------------------------------------------------------------------------
// 4. STUDENT ISOLATION, ANSWER-KEY STRIPPING & RUNTIME CONTRACT
// -----------------------------------------------------------------------------

test("8. STUDENT PACKAGE RETRIEVAL: Student runtime (preview=false) receives published version ONLY", async () => {
  server.db.Lesson.push({ id: "les_student_iso", published_version_id: "ver_published_100", title: "Nombor 1-10" });
  server.db.LessonVersion.push({
    id: "ver_published_100",
    lesson_id: "les_student_iso",
    status: "published",
    review_status: "published",
    quality_score: 95,
  });
  server.db.LessonBlock.push({
    id: "blk_iso_1",
    lesson_version_id: "ver_published_100",
    block_type: "STORY_HOOK",
    status: "published",
    payload: { story_text: "Cerita" },
  });

  const res = await invokeFunction(getLearningPackage, {
    lesson_id: "les_student_iso",
    preview: false,
  }, { serverUrl, userToken: "student-1" });

  if (res.status !== 200) {
    console.error("Test 8 failed with status:", res.status, "data:", JSON.stringify(res.data));
  }

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.version_id, "ver_published_100");
});

test("9. ANSWER-KEY PROTECTION: Student package payload contains ZERO correctness metadata", async () => {
  server.db.Lesson.push({ id: "les_sec_check", published_version_id: "ver_sec_check", title: "Sekuriti" });
  server.db.LessonVersion.push({
    id: "ver_sec_check",
    lesson_id: "les_sec_check",
    status: "published",
    review_status: "published",
  });
  server.db.Assessment.push({ id: "asm_sec", lesson_id: "les_sec_check", workflow_status: "PUBLISHED" });
  server.db.QuestionBank.push({ id: "q_sec_1", assessment_id: "asm_sec", question_text: "Kira 3 + 2", status: "published" });
  server.db.QuestionOption.push({ id: "opt_sec_a", question_id: "q_sec_1", text: "5", is_correct: true, label: "A" });
  server.db.QuestionOption.push({ id: "opt_sec_b", question_id: "q_sec_1", text: "6", is_correct: false, label: "B" });

  const res = await invokeFunction(getLearningPackage, {
    lesson_id: "les_sec_check",
    preview: false,
  }, { serverUrl, userToken: "student-1" });

  assert.equal(res.status, 200);
  const jsonString = JSON.stringify(res.data);

  assert.equal(jsonString.includes('"is_correct"'), false, "is_correct stripped");
  assert.equal(jsonString.includes('"correct_answer"'), false, "correct_answer stripped");
  assert.equal(jsonString.includes('"correct_option_id"'), false, "correct_option_id stripped");
  assert.equal(jsonString.includes('"answer_key"'), false, "answer_key stripped");
  assert.equal(jsonString.includes('"solution_key"'), false, "solution_key stripped");
});

test("10. STUDENT RUNTIME CONTRACT: Package structure is fully renderer-compatible", async () => {
  const genRes = await invokeFunction(generateModularLessonContent, {
    subject: REAL_KSSR_TARGET.subject,
    year_level: "1",
    topic: REAL_KSSR_TARGET.subtopic,
    sk_code: REAL_KSSR_TARGET.sk_code,
    sp_code: REAL_KSSR_TARGET.sp_code,
  }, { serverUrl, serviceToken: "test-service-token" });

  // Update preview_status to APPROVED before publishing
  const vObj = server.db.LessonVersion.find(v => v.id === genRes.data.version_id);
  if (vObj) vObj.preview_status = "APPROVED";

  // Publish
  const pubRes = await invokeFunction(publishLessonVersion, {
    lesson_version_id: genRes.data.version_id,
    force_publish: true,
  }, { serverUrl, userToken: "admin-token" });

  if (pubRes.status !== 200) {
    console.error("Test 10 publish failed:", pubRes.status, JSON.stringify(pubRes.data));
  }
  assert.equal(pubRes.status, 200);

  // Retrieve student package
  const pkgRes = await invokeFunction(getLearningPackage, {
    lesson_id: genRes.data.lesson_id,
  }, { serverUrl, userToken: "student-1" });

  if (pkgRes.status !== 200) {
    console.error("Test 10 getLearningPackage failed:", pkgRes.status, JSON.stringify(pkgRes.data));
  }

  assert.equal(pkgRes.status, 200);
  assert.equal(pkgRes.data.blocks.length, 8);

  // Validate block contract keys for renderer
  for (const block of pkgRes.data.blocks) {
    assert.ok(block.order_number !== undefined || block.block_number !== undefined, "order_number or block_number exists");
    assert.ok(typeof block.block_type === "string", "block_type exists");
    assert.ok(typeof (block.payload || block.content) === "object" && (block.payload || block.content) !== null, "payload or content object exists");
  }
});

// -----------------------------------------------------------------------------
// 5. CLASSIC VS ADVENTURE MODE EQUIVALENCE
// -----------------------------------------------------------------------------

test("11. CLASSIC VS ADVENTURE MODE EQUIVALENCE: Both modes consume identical educational content", async () => {
  server.db.Lesson.push({ id: "les_mode_eq", published_version_id: "ver_mode_eq", title: "Nombor 1 hingga 10" });
  server.db.LessonVersion.push({
    id: "ver_mode_eq",
    lesson_id: "les_mode_eq",
    status: "published",
    review_status: "published",
    quality_score: 92,
  });

  // Simulated Classic mode call
  const classicRes = await invokeFunction(getLearningPackage, {
    lesson_id: "les_mode_eq",
    mode: "classic",
  }, { serverUrl, userToken: "student-1" });

  // Simulated Adventure mode call
  const adventureRes = await invokeFunction(getLearningPackage, {
    lesson_id: "les_mode_eq",
    mode: "adventure",
  }, { serverUrl, userToken: "student-1" });

  assert.equal(classicRes.status, 200);
  assert.equal(adventureRes.status, 200);

  // Assert canonical educational content equivalence
  assert.equal(classicRes.data.lesson_id, adventureRes.data.lesson_id);
  assert.equal(classicRes.data.version_id, adventureRes.data.version_id);
  assert.deepEqual(classicRes.data.blocks, adventureRes.data.blocks, "Canonical blocks are identical across modes");
  assert.deepEqual(classicRes.data.assessment, adventureRes.data.assessment, "Canonical assessment is identical across modes");
});

// -----------------------------------------------------------------------------
// 6. SERVER-AUTHORITATIVE ASSESSMENT & REWARD IDEMPOTENCY
// -----------------------------------------------------------------------------

test("12. SERVER-AUTHORITATIVE ASSESSMENT: Client score/reward overrides are completely ignored", async () => {
  server.db.Assessment.push({
    id: "asm_auth_eval",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
  });

  server.db.QuestionBank.push({
    id: "q_auth_1",
    assessment_id: "asm_auth_eval",
    question_text: "Manakah nombor 5?",
    correct_answer: "5",
  });

  server.db.QuestionOption.push({
    id: "opt_correct_5",
    question_id: "q_auth_1",
    text: "5",
    is_correct: true,
    label: "A",
  });

  // Submit correct selection with malicious client overrides
  const res = await invokeFunction(submitAssessment, {
    student_id: "student_auth_1",
    assessment_id: "asm_auth_eval",
    answers: [{ question_id: "q_auth_1", selected_option_id: "opt_correct_5" }],
    // Attempted client overrides
    score: 0,
    xp_earned: 999999,
    coins_earned: 999999,
    passed: false,
  }, { serverUrl, userToken: "student_auth_1" });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.score, 100, "Server calculated true score (100%)");
  assert.equal(res.data.passed, true, "Server calculated true passing status");
  assert.equal(res.data.xp_earned, 50, "Server awarded authoritative 50 XP");
  assert.equal(res.data.coins_earned, 10, "Server awarded authoritative 10 coins");
});

test("13. REWARD SETTLEMENT & LEDGER PERSISTENCE: Rewards are correctly recorded in DB entities", async () => {
  server.db.Assessment.push({
    id: "asm_ledger",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
  });

  server.db.QuestionBank.push({
    id: "q_ledger_1",
    assessment_id: "asm_ledger",
    correct_answer: "1",
  });

  server.db.QuestionOption.push({
    id: "opt_ledger_1",
    question_id: "q_ledger_1",
    text: "1",
    is_correct: true,
    label: "A",
  });

  const res = await invokeFunction(submitAssessment, {
    student_id: "std_ledger_user",
    assessment_id: "asm_ledger",
    answers: [{ question_id: "q_ledger_1", selected_option_id: "opt_ledger_1" }],
  }, { serverUrl, userToken: "std_ledger_user" });

  assert.equal(res.status, 200);
  assert.equal(res.data.reward_settled, true);

  // Check QuizAttempt persistence
  const attempts = server.db.QuizAttempt.filter(a => a.student_id === "std_ledger_user");
  assert.equal(attempts.length, 1, "QuizAttempt entity persisted");
  assert.equal(attempts[0].xp_earned, 50);
  assert.equal(attempts[0].coins_earned, 10);

  // Check Wallet persistence
  const wallets = server.db.Wallet.filter(w => w.student_id === "std_ledger_user");
  assert.equal(wallets.length, 1, "Wallet entity updated");
  assert.equal(wallets[0].coins, 10);
});

test("14. DUPLICATE SUBMISSION PROTECTION: Re-submitting identical assessment returns is_duplicate: true", async () => {
  server.db.User.push({
    id: "std_dupe_user",
    role: "student",
  });

  server.db.Assessment.push({
    id: "asm_dupe_check",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
  });

  server.db.QuestionBank.push({
    id: "q_dupe_1",
    assessment_id: "asm_dupe_check",
    correct_answer: "10",
  });

  server.db.QuestionOption.push({
    id: "opt_dupe_10",
    question_id: "q_dupe_1",
    text: "10",
    is_correct: true,
    label: "A",
  });

  const payload = {
    student_id: "std_dupe_user",
    assessment_id: "asm_dupe_check",
    answers: [{ question_id: "q_dupe_1", selected_option_id: "opt_dupe_10" }],
  };

  try {
    // First submission
    const res1 = await invokeFunction(submitAssessment, payload, { serverUrl, userToken: "std_dupe_user" });
    assert.equal(res1.status, 200);

    // Second identical submission
    const res2 = await invokeFunction(submitAssessment, payload, { serverUrl, userToken: "std_dupe_user" });
    assert.equal(res2.status, 200);
    assert.equal(res2.data.is_duplicate, true, "Duplicate submission flagged");
    assert.equal(res2.data.reward_settled, true, "Reward settled flag present");
  } catch (err) {
    throw err;
  }
});

// -----------------------------------------------------------------------------
// 7. FAILURE STATES & AUTHORIZATION BOUNDARIES
// -----------------------------------------------------------------------------

test("15. FAILURE STATES: Controlled errors for missing parameters & unauthorized publishing", async () => {
  // Missing parameters in getLearningPackage
  const resBadInput = await invokeFunction(getLearningPackage, {}, { serverUrl });
  assert.equal(resBadInput.status, 400);
  assert.equal(resBadInput.data.success, false);

  // Unauthorized publish attempt by non-admin user
  server.db.LessonVersion.push({
    id: "ver_unauth_pub",
    lesson_id: "les_unauth",
    quality_score: 50,
    status: "draft",
  });

  const resUnauthPub = await invokeFunction(publishLessonVersion, {
    lesson_version_id: "ver_unauth_pub",
    force_publish: true,
  }, { serverUrl, userToken: "student-token" });

  assert.ok(resUnauthPub.status === 400 || resUnauthPub.status === 403, "Unauthorized publish rejected with 400/403");
  assert.equal(resUnauthPub.data.success, false);
});
