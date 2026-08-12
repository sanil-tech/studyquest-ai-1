# PHASE 4A: ASSESSMENT & QUIZ ARCHITECTURE AUDIT REPORT

This document details the audit of the current StudyQuest assessment and quiz ecosystem, tracing data flow, QuestionBank/QuestionOption/Assessment/QuizAttempt entities, security boundaries, and reward settlement guarantees.

---

## 1. END-TO-END DATA FLOW TRACE

```text
ADMIN CONTENT STUDIO / ASSET GENERATOR
      │
      ▼
QuestionBank + QuestionOption (Content Library Asset)
      │ review_status = "approved"
      ▼
assembleLessonFromApprovedAssets
      │
      ▼
Immutable LessonVersion Snapshot Container
      │
      ▼
publishLessonVersion (Admin Action)
      │
      ▼
Lesson.published_version_id
      │
      ▼
getLearningPackage (Sanitizes & Omits Answer Keys)
      │
      ▼
Student Browser Runtime (QuizRunner.jsx)
      │
      ▼ (Submits answers JSON + SHA-256 hash)
submitAssessment (Server-Authoritative Function)
      │ Evaluates answers, calculates score & XP/coins
      ▼
QuizAttempt (Historical Immutable Record)
      ├── Progress (XP & Level)
      ├── Wallet (Coins & Total Earned)
      └── ActivityLog (Audit Trail & Anti-Farming)
```

---

## 2. QUESTIONBANK & QUESTIONOPTION ENTITY AUDIT

### A. QuestionBank (`base44/entities/QuestionBank.jsonc`)
* **Primary Identifier**: `id` / `question_id`.
* **Relationships**: Linked to `topic_id`, `subtopic_id`, `sp_code` (`standard_pembelajaran`), `subject_id`, `assessment_id`, `lesson_version_id`.
* **Metadata & Taxonomy**: Stores `difficulty`, `cognitive_level` (Bloom's Taxonomy), `tp_code`, `quiz_type`, `question_type` (`mcq`, `true_false`, `fill_blank`, `short_answer`).
* **Answer & Explanation Storage**: `correct_answer`, `explanation`, `hint`, `options_json`.
* **Content Library Lifecycle**: Supports `status` (`draft`, `published`, `archived`), `review_status` (`draft`, `under_review`, `approved`, `published`, `archived`), `created_source` (`manual`, `ai_generated`), `approved_by`, `approved_at`.
* **Audit Verdict**: **CANONICAL & REUSABLE**. `QuestionBank` already satisfies all Content Library asset requirements. No new question entity is needed.

### B. QuestionOption (`base44/entities/QuestionOption.jsonc`)
* **Relationships**: Linked via `question_id` to parent `QuestionBank`.
* **Properties**: `id`, `label` (`"A"`, `"B"`, `"C"`, `"D"`), `text`, `sort_order`.
* **Security Shield**: Does **NOT** store `is_correct` on the entity property definition itself. Correctness is evaluated server-side in `submitAssessment` via `QuestionBank.correct_answer` or `options_json` matching.

---

## 3. ASSESSMENT & QUIZATTEMPT ENTITY AUDIT

### A. Assessment (`base44/entities/Assessment.jsonc`)
* **Properties**: `title`, `assessment_type` (`practice`, `mastery`, `diagnostic`, `exam`), `lesson_id`, `lesson_version_id`, `topic_id`, `subject_id`, `passing_score`, `time_limit_minutes`, `reward_xp`, `reward_coin`, `status`.
* **Audit Verdict**: Serves as the canonical assessment container binding multiple `QuestionBank` items to a curriculum unit or lesson.

### B. QuizAttempt (`base44/entities/QuizAttempt.jsonc`)
* **Properties**: `student_id`, `assessment_id`, `quiz_id`, `score_percentage`, `passed_status`, `correct_count`, `total_questions`, `answers_json`, `submission_hash`, `reward_settled`, `completed_at`.
* **Immutability Protection**: Serves as an immutable historical execution log. Past `QuizAttempt` records are never modified if `QuestionBank` items are updated or re-assembled.

---

## 4. SERVER-AUTHORITATIVE EVALUATION & SECURITY AUDIT

### A. `submitAssessment` (`base44/functions/submitAssessment/entry.ts`)
1. **Authentication**: Resolves user token via `base44.auth.me()`. Prevents student impersonation (`403 FORBIDDEN`).
2. **Idempotency Protection**: Generates SHA-256 `submission_hash` from `student_id + assessment_id + JSON.stringify(sortedAnswers)`. Duplicate submissions return cached result cleanly without re-executing reward settlement.
3. **Anti-Farming Protection**: Queries previous attempts for `student_id + assessment_id`. Repeat passes yield 0 coins and 5 retention XP (`already_passed: true`).
4. **Server-Side Answer Evaluation**: Matches student choices against server-authoritative `QuestionBank.correct_answer` or `QuestionOption` database records.

### B. `getLearningPackage` (`base44/functions/getLearningPackage/entry.ts`)
* **Answer-Key Stripping**: Omits `correct_answer`, `is_correct`, `correct_option_id`, and `explanation` from client payloads. Students receive only `{ id, label, text, sort_order }` options.

---

## 5. RISK CLASSIFICATION & FINDINGS

| Risk ID | Severity | Area | Description |
|---|---|---|---|
| R-01 | **P2 (Medium)** | UI / Client | Legacy `assessmentEngine.js` generates prototype client-side questions with embedded `correctAnswer` in local state. |
| R-02 | **P3 (Low)** | Schema | `QuestionOption.jsonc` lacks explicit `is_correct` field, forcing `submitAssessment` to rely on `QuestionBank.correct_answer` or `options_json` string parsing. |
| R-03 | **P3 (Low)** | Schema | `QuestionBank` has dual fields `sp_code` vs `standard_pembelajaran` vs `curriculum_standard`. Handled by mapper helpers. |
