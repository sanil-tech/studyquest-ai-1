# PHASE 3A: ASSESSMENT MIGRATION RISK MATRIX

This document outlines all architectural, security, and data integrity risks identified during the Phase 3A Assessment Discovery Audit.

---

## RISK OVERVIEW

```text
🔴 P0 CRITICAL (Immediate Vulnerability / Security Exposure): 2
🟠 P1 HIGH (System Architecture / Data Integrity Issue):    2
🟡 P2 MEDIUM (Duplicated Logic / Code Debt):                3
🟢 P3 LOW (Legacy Maintenance / Unused Code):               2
```

---

## 1. P0 CRITICAL RISKS

### `RISK-P0-01`: Client Exposure of Answer Keys in `generateAdaptiveQuiz`
* **Location**: [`base44/functions/generateAdaptiveQuiz/entry.ts:135-140`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateAdaptiveQuiz/entry.ts#L135-L140)
* **Description**: `generateAdaptiveQuiz` invokes LLM to generate an adaptive quiz and returns `Response.json({ success: true, quiz: aiRes })` directly to the caller. The `quiz.questions` array contains `correct_answer` inside every question object. Any student inspecting network traffic or calling `generateAdaptiveQuiz` receives full answer keys before taking the test.
* **Impact**: Completely bypasses server-authoritative scoring integrity for adaptive quizzes.
* **Required Phase 3 Migration Action**: Strip `correct_answer` from `generateAdaptiveQuiz` HTTP response payload. Store the questions with `correct_answer` into `QuestionBank` and `QuestionOption` entities in DB, and return sanitized questions (without `correct_answer` or `is_correct`) to the client.

### `RISK-P0-02`: Client-Side Scoring & Answer Key Leakage in `KnowledgeCheckBlock.jsx`
* **Location**: [`src/components/lesson/blocks/KnowledgeCheckBlock.jsx:19-53`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/lesson/blocks/KnowledgeCheckBlock.jsx#L19-L53)
* **Description**: `KnowledgeCheckBlock` renders formative quiz questions inside the `LessonShell` (Block 6). It reads `correct_index` directly from `content.questions` in `LessonBlock.payload`, calculates percentage score client-side in React state (`score = Math.round((correct / questions.length) * 100)`), and does NOT call `submitAssessment` or log to `QuizAttempt`.
* **Impact**:
  1. The student browser receives `correct_index` inside block JSON.
  2. No server-authoritative score record or attempt history is logged in `QuizAttempt`.
  3. Rewards (+50 XP) are awarded directly via local state without server verification.
* **Required Phase 3 Migration Action**: Refactor `KnowledgeCheckBlock` to route submissions through `submitAssessment` or sanitize `correct_index` out of block payloads, using server verification.

---

## 2. P1 HIGH RISKS

### `RISK-P1-01`: Unversioned Assessment Foreign Keys (`Assessment` -> `Lesson` vs `LessonVersion`)
* **Location**: [`base44/entities/Assessment.jsonc:20-23`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/Assessment.jsonc#L20-L23)
* **Description**: `Assessment` entity links to `lesson_id` (`Lesson` table), but NOT directly to `lesson_version_id` (`LessonVersion` table). However, `QuestionBank` links to both `assessment_id` AND `lesson_version_id`.
* **Impact**: Updating or regenerating a lesson version can overwrite or mutate questions associated with a previously published `LessonVersion`, violating versioning immutability.
* **Required Phase 3 Migration Action**: Add `lesson_version_id` property to `Assessment.jsonc` schema and enforce that every `LessonVersion` creates/links a specific immutable `Assessment` instance.

### `RISK-P1-02`: Legacy `Quiz` Entity Fallbacks in Student Runtime
* **Location**: [`src/pages/QuizPage.jsx:136-159`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/QuizPage.jsx#L136-L159) and [`base44/functions/getLessonContent/entry.ts:152-165`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/getLessonContent/entry.ts#L152-L165)
* **Description**: If `getLearningPackage` yields no questions, `QuizPage.jsx` falls back to querying `base44.entities.Quiz.filter({ id: targetAssessmentId })` directly from client, parsing `questions_json`.
* **Impact**: Legacy un-sanitized monolithic `Quiz` records can bypass V3 modular pipeline, risking schema inconsistency and outdated question formats.
* **Required Phase 3 Migration Action**: Complete legacy `Quiz` entity data migration via `migrateLegacyQuizData` and deprecate legacy entity fallbacks in student runtime once all production records are migrated.

---

## 3. P2 MEDIUM RISKS

### `RISK-P2-01`: Duplicated Client vs Server Reward Settlement Logic
* **Location**: [`src/pages/LessonPage.jsx:193-200`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/LessonPage.jsx#L193-L200) vs [`base44/functions/submitAssessment/entry.ts:298-352`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/submitAssessment/entry.ts#L298-L352)
* **Description**: `LessonPage.jsx` calls `processReward()` (client-side utility) for block completion, while `submitAssessment` performs server-authoritative wallet and progress updates with SHA-256 idempotency.
* **Impact**: Risk of double-counting XP/Coins between block completions and assessment submissions if not strictly scoped.
* **Required Phase 3 Migration Action**: Consolidate reward settlement so all XP and Coins are awarded strictly through server endpoints (`submitAssessment`).

### `RISK-P2-02`: Dead Mock Code (`assessmentEngine.js`) in Repository
* **Location**: [`src/services/assessmentEngine.js:13-65`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/assessmentEngine.js#L13-L65)
* **Description**: `assessmentEngine.js` contains hardcoded mock templates (`fraction_addition`, `number_comparison`) and mock `logAssessmentAttempt` functions. It is not imported by any file.
* **Impact**: Code rot and developer confusion.
* **Required Phase 3 Migration Action**: Safely archive/delete `src/services/assessmentEngine.js`.

### `RISK-P2-03`: Inconsistent Question Option Representations (`QuestionOption` vs `options_json`)
* **Location**: [`base44/entities/QuestionBank.jsonc:104-107`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/QuestionBank.jsonc#L104-L107) and [`base44/entities/QuestionOption.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/QuestionOption.jsonc)
* **Description**: `QuestionBank` supports inline `options_json` string array AND separate normalized `QuestionOption` records (`question_id`, `label`, `text`). `getLearningPackage` handles both, but legacy code creates `options_json` without creating `QuestionOption` rows.
* **Impact**: Inconsistent database queries and extra parsing overhead in endpoints.
* **Required Phase 3 Migration Action**: Standardize all quiz generation to create normalized `QuestionOption` records.

---

## 4. P3 LOW RISKS

### `RISK-P3-01`: Unused Legacy Admin Pages Accessing `Quiz` Entity
* **Location**: [`src/pages/EditLessonResources.jsx:75`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/EditLessonResources.jsx#L75) and [`src/pages/LessonResources.jsx:207`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/LessonResources.jsx#L207)
* **Description**: Legacy admin resource management pages manipulate the `Quiz` entity directly instead of `Assessment` and `QuestionBank`.
* **Impact**: Admins using legacy screens write outdated entity formats.
* **Required Phase 3 Migration Action**: Update admin UI components to interface strictly with `Assessment` and `QuestionBank`.

### `RISK-P3-02`: Deprecated Join Entities in Entity Registry
* **Location**: [`base44/entities/AssessmentAttempt.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/AssessmentAttempt.jsonc) and [`base44/entities/AssessmentQuestion.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/AssessmentQuestion.jsonc)
* **Description**: Prototype entities from Phase 0 still exist in `base44/entities/`.
* **Impact**: Minor schema clutter.
* **Required Phase 3 Migration Action**: Mark entities as deprecated or archive after Phase 3 migration.
