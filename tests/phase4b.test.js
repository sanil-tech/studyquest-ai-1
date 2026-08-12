// tests/phase4b.test.js
// Phase 4B: Assessment & Quiz End-to-End Integration Verification Test Suite
import test from "node:test";
import assert from "node:assert";
import { Base44TestServer, loadFunction, invokeFunction } from "./base44Harness.js";

const server = new Base44TestServer();
let serverUrl = "";
let getLearningPackageHandler = null;
let submitAssessmentHandler = null;

test.before(async () => {
  serverUrl = await server.start();
  const modPkg = await loadFunction("./base44/functions/getLearningPackage/entry.ts");
  getLearningPackageHandler = modPkg.default;
  const modSub = await loadFunction("./base44/functions/submitAssessment/entry.ts");
  submitAssessmentHandler = modSub.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();

  // Seed Lesson, LessonVersion, Assessment, QuestionBank, QuestionOption
  server.db.Lesson.push({
    id: "les_pecahan_01",
    title: "Pecahan Tahun 4",
    topic_id: "top_p4",
    status: "published",
    published_version_id: "ver_pub_v1",
  });

  server.db.LessonVersion.push({
    id: "ver_pub_v1",
    lesson_id: "les_pecahan_01",
    version_number: 1,
    status: "published",
    review_status: "published",
  });

  server.db.Assessment.push({
    id: "asm_pecahan_01",
    title: "Ujian Pecahan",
    lesson_id: "les_pecahan_01",
    lesson_version_id: "ver_pub_v1",
    topic_id: "top_p4",
    passing_score: 70,
    reward_xp: 50,
    reward_coins: 10,
    status: "published",
  });

  server.db.QuestionBank.push(
    {
      id: "qb_1",
      question_id: "qb_1",
      assessment_id: "asm_pecahan_01",
      lesson_version_id: "ver_pub_v1",
      topic_id: "top_p4",
      sp_code: "1.1.1",
      question: "Berapakah 1/4 + 2/4?",
      correct_answer: "3/4",
      explanation: "1/4 + 2/4 = 3/4.",
      difficulty: "medium",
      question_type: "mcq",
      status: "published",
      review_status: "approved",
    },
    {
      id: "qb_2",
      question_id: "qb_2",
      assessment_id: "asm_pecahan_01",
      lesson_version_id: "ver_pub_v1",
      topic_id: "top_p4",
      sp_code: "1.1.1",
      question: "Antara berikut, yang manakah pecahan wajar?",
      correct_answer: "1/2",
      explanation: "1/2 mempunyai pengangka lebih kecil daripada penyebut.",
      difficulty: "easy",
      question_type: "mcq",
      status: "published",
      review_status: "approved",
    }
  );

  server.db.QuestionOption.push(
    { id: "opt_1a", question_id: "qb_1", label: "A", text: "3/4", sort_order: 1 },
    { id: "opt_1b", question_id: "qb_1", label: "B", text: "2/4", sort_order: 2 },
    { id: "opt_2a", question_id: "qb_2", label: "A", text: "1/2", sort_order: 1 },
    { id: "opt_2b", question_id: "qb_2", label: "B", text: "3/2", sort_order: 2 }
  );
});

// --- GROUP 1: ASSESSMENT GRAPH TESTS (1-4) ---
test("TEST 1: Valid Assessment Graph relationships", async () => {
  const asm = server.db.Assessment.find((a) => a.id === "asm_pecahan_01");
  const qb = server.db.QuestionBank.filter((q) => q.assessment_id === asm.id);
  const opts = server.db.QuestionOption.filter((o) => o.question_id === "qb_1");

  assert.ok(asm, "Assessment must exist");
  assert.strictEqual(qb.length, 2, "2 Questions linked to Assessment");
  assert.strictEqual(opts.length, 2, "2 Options linked to Question 1");
});

test("TEST 2: Assessment Belongs To Correct LessonVersion", async () => {
  const asm = server.db.Assessment.find((a) => a.id === "asm_pecahan_01");
  assert.strictEqual(asm.lesson_version_id, "ver_pub_v1");
});

test("TEST 3: QuestionBank Belongs To Correct Assessment", async () => {
  const qbList = server.db.QuestionBank.filter((q) => q.assessment_id === "asm_pecahan_01");
  assert.strictEqual(qbList.length, 2);
  assert.strictEqual(qbList[0].assessment_id, "asm_pecahan_01");
});

test("TEST 4: QuestionOption Belongs To Correct Question", async () => {
  const opts1 = server.db.QuestionOption.filter((o) => o.question_id === "qb_1");
  const opts2 = server.db.QuestionOption.filter((o) => o.question_id === "qb_2");
  assert.strictEqual(opts1.length, 2);
  assert.strictEqual(opts2.length, 2);
  assert.ok(opts1.every((o) => o.question_id === "qb_1"));
});

// --- GROUP 2: STUDENT PAYLOAD SECURITY (5-6) ---
test("TEST 5: Student Cannot Receive correct_answer in getLearningPackage", async () => {
  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);

  const assessments = res.data.assessments || [];
  assert.ok(assessments.length > 0);
  const q1 = assessments[0].questions[0];

  assert.strictEqual(q1.correct_answer, undefined, "correct_answer must be omitted");
  assert.strictEqual(q1.is_correct, undefined, "is_correct must be omitted");
  assert.ok(q1.options.every((opt) => opt.is_correct === undefined), "Options must not contain is_correct");
});

test("TEST 6: Student Receives Question Structure without answer keys", async () => {
  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  const q1 = res.data.assessments[0].questions[0];
  assert.ok(q1.question_text, "Question text present");
  assert.ok(Array.isArray(q1.options), "Options array present");
  assert.strictEqual(q1.options.length, 2);
  assert.strictEqual(q1.question_type, "mcq");
});

// --- GROUP 3: SERVER-SIDE SCORING (7-10) ---
test("TEST 7: Correct Submission Produces Correct Score", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "A" }, // "3/4" is correct
        { question_id: "qb_2", selected_option_id: "A" }, // "1/2" is correct
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.score, 100);
  assert.strictEqual(res.data.correct_count, 2);
  assert.strictEqual(res.data.passed, true);
});

test("TEST 8: Client Cannot Fake Score in submitAssessment", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      score: 100, // Forged client score
      answers: [
        { question_id: "qb_1", selected_option_id: "B" }, // Wrong
        { question_id: "qb_2", selected_option_id: "B" }, // Wrong
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.score, 0, "Server must evaluate actual score (0%), ignoring client forgery");
  assert.strictEqual(res.data.passed, false);
});

test("TEST 9: Client Cannot Fake Correct Answers", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "B", is_correct: true }, // Client trying to claim wrong answer is correct
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.question_results[0].is_correct, false);
});

test("TEST 10: Client Cannot Submit Answer Key", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [{ question_id: "qb_1", selected_option_id: "B", correct_answer: "B" }],
    },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.question_results[0].is_correct, false);
});

// --- GROUP 4: QUIZ ATTEMPT INTEGRITY (11-13) ---
test("TEST 11: QuizAttempt Created with Proper Schema Properties", async () => {
  await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "A" },
        { question_id: "qb_2", selected_option_id: "A" },
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  const attempt = server.db.QuizAttempt.find((a) => a.student_id === "usr_student");
  assert.ok(attempt, "QuizAttempt record created");
  assert.strictEqual(attempt.score, 100);
  assert.strictEqual(attempt.total_questions, 2);
  assert.strictEqual(attempt.passed, true);
});

test("TEST 12: QuizAttempt Uses Server Score", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "A" },
        { question_id: "qb_2", selected_option_id: "B" },
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  const attempt = server.db.QuizAttempt.find((a) => a.id === res.data.attempt_id);
  assert.strictEqual(attempt.score, 50);
});

test("TEST 13: Historical Attempt Is Stable", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "A" },
        { question_id: "qb_2", selected_option_id: "A" },
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  const attemptId = res.data.attempt_id;

  // Later mutate QuestionBank item
  const q1 = server.db.QuestionBank.find((q) => q.id === "qb_1");
  q1.correct_answer = "99/99";

  // Historical QuizAttempt score remains unchanged
  const attempt = server.db.QuizAttempt.find((a) => a.id === attemptId);
  assert.strictEqual(attempt.score, 100);
});

// --- GROUP 5: DUPLICATE SUBMISSION & REWARD SECURITY (14-17) ---
test("TEST 14: Duplicate Submission Handles Idempotency Cleanly", async () => {
  const payload = {
    student_id: "usr_student",
    assessment_id: "asm_pecahan_01",
    answers: [
      { question_id: "qb_1", selected_option_id: "A" },
      { question_id: "qb_2", selected_option_id: "A" },
    ],
  };

  const res1 = await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });
  const res2 = await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });

  assert.strictEqual(res1.data.success, true);
  assert.strictEqual(res2.data.is_duplicate, true, "Second submission flagged as duplicate");
  assert.strictEqual(res1.data.attempt_id, res2.data.attempt_id, "Same attempt ID returned");
});

test("TEST 15: SHA-256 Submission Hash Prevents Repeated Processing", async () => {
  const payload = {
    student_id: "usr_student",
    assessment_id: "asm_pecahan_01",
    answers: [{ question_id: "qb_1", selected_option_id: "A" }],
  };

  await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });
  const attempt1 = server.db.QuizAttempt[0];
  assert.ok(attempt1.submission_hash, "SHA-256 submission_hash generated");

  const res2 = await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });
  assert.strictEqual(res2.data.is_duplicate, true);
});

test("TEST 16: XP Cannot Be Farmed by Duplicate Submissions", async () => {
  const payload = {
    student_id: "usr_student",
    assessment_id: "asm_pecahan_01",
    answers: [
      { question_id: "qb_1", selected_option_id: "A" },
      { question_id: "qb_2", selected_option_id: "A" },
    ],
  };

  const res1 = await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });
  const initialXp = res1.data.xp_earned;

  await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });

  const progress = server.db.Progress.find((p) => p.student_id === "usr_student");
  assert.strictEqual(progress.total_xp, initialXp, "Progress XP not increased by duplicate submission");
});

test("TEST 17: Coins Cannot Be Farmed by Duplicate Submissions", async () => {
  const payload = {
    student_id: "usr_student",
    assessment_id: "asm_pecahan_01",
    answers: [
      { question_id: "qb_1", selected_option_id: "A" },
      { question_id: "qb_2", selected_option_id: "A" },
    ],
  };

  const res1 = await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });
  const initialCoins = res1.data.coins_earned;

  await invokeFunction(submitAssessmentHandler, payload, { serverUrl, userToken: "student-token" });

  const wallet = server.db.Wallet.find((w) => w.student_id === "usr_student");
  assert.strictEqual(wallet.balance, initialCoins, "Wallet balance not increased by duplicate submission");
});

// --- GROUP 6: PROGRESS INTEGRITY (18-19) ---
test("TEST 18: Progress Updated After Valid Completion", async () => {
  await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "A" },
        { question_id: "qb_2", selected_option_id: "A" },
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  const progress = server.db.Progress.find((p) => p.student_id === "usr_student");
  assert.ok(progress, "Progress record created/updated");
  assert.ok(progress.total_xp > 0, "XP awarded");
});

test("TEST 19: Failed Submission Does Not Grant Completion Reward", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_student",
      assessment_id: "asm_pecahan_01",
      answers: [
        { question_id: "qb_1", selected_option_id: "B" },
        { question_id: "qb_2", selected_option_id: "B" },
      ],
    },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.data.passed, false);
  assert.strictEqual(res.data.coins_earned, 0, "0 coins awarded for failed attempt");
});

// --- GROUP 7: ACCESS CONTROL (20-23) ---
test("TEST 20: Student Cannot Access DRAFT Assessment", async () => {
  server.db.LessonVersion[0].status = "draft";

  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.data.success, false);
});

test("TEST 21: Student Cannot Access Unpublished Assessment", async () => {
  server.db.Lesson.find((l) => l.id === "les_pecahan_01").published_version_id = null;
  server.db.LessonVersion.forEach((v) => (v.status = "draft"));

  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 404);
});

test("TEST 22: Published Assessment Is Accessible to Student", async () => {
  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.assessments.length > 0);
});

test("TEST 23: Unauthorized User Cannot Submit For Another Student", async () => {
  const res = await invokeFunction(
    submitAssessmentHandler,
    {
      student_id: "usr_OTHER_STUDENT",
      assessment_id: "asm_pecahan_01",
      answers: [{ question_id: "qb_1", selected_option_id: "A" }],
    },
    { serverUrl, userToken: "student-token" } // Logged in as usr_student trying to submit for usr_OTHER_STUDENT
  );

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.data.success, false);
});

// --- GROUP 8: SNAPSHOT INTEGRITY (24-26) ---
test("TEST 24: Published Snapshot Uses Intended Assessment", async () => {
  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.data.assessments[0].id, "asm_pecahan_01");
});

test("TEST 25: Library Question Change Does Not Mutate Compiled Published Snapshot", async () => {
  // 1. Fetch published package
  const res1 = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );
  const originalQText = res1.data.assessments[0].questions[0].question_text;

  // 2. Add an unapproved/standalone library item
  server.db.QuestionBank.push({
    id: "qb_unapproved",
    topic_id: "top_p4",
    sp_code: "1.1.1",
    question: "LIBRARY QUESTION MUTATED",
    review_status: "draft",
  });

  // 3. Re-fetch published package
  const res2 = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  // Student payload remains unchanged
  assert.strictEqual(res2.data.assessments[0].questions[0].question_text, originalQText);
});

test("TEST 26: New Assembly Does Not Mutate Existing Published Version", async () => {
  // Published version pointer is ver_pub_v1
  const lesson = server.db.Lesson.find((l) => l.id === "les_pecahan_01");
  const originalPubVersion = lesson.published_version_id;

  // Simulate new version draft creation V2
  server.db.LessonVersion.push({
    id: "ver_draft_v2",
    lesson_id: "les_pecahan_01",
    version_number: 2,
    status: "draft",
  });

  // Fetch student package again
  const res = await invokeFunction(
    getLearningPackageHandler,
    { lesson_id: "les_pecahan_01" },
    { serverUrl, userToken: "student-token" }
  );

  assert.strictEqual(res.data.version.id, originalPubVersion);
  assert.strictEqual(lesson.published_version_id, originalPubVersion, "Published pointer remains V1!");
});
