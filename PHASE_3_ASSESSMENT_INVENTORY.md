# PHASE 3A: ASSESSMENT / QUIZ REPOSITORY INVENTORY

This document provides a comprehensive audit and classification of every assessment and quiz file, function, component, and database entity across the StudyQuest repository.

---

## 1. BACKEND FUNCTIONS (`base44/functions/`)

| File Path | Function / Entry | Classification | Primary Responsibility |
|---|---|---|---|
| [`base44/functions/submitAssessment/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/submitAssessment/entry.ts) | `submitAssessment` | **ACTIVE PRODUCTION / BACKEND** | Server-authoritative answer evaluation, SHA-256 idempotency hash, score calculation, repeat pass protection, `QuizAttempt` recording, `Wallet` & `Progress` reward settlement, and `StudentSkillProfile` EWMA mastery update. |
| [`base44/functions/getLearningPackage/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/getLearningPackage/entry.ts) | `getLearningPackage` | **ACTIVE PRODUCTION / BACKEND** | Unified content and assessment endpoint. Assembles `Assessment`, `QuestionBank`, and `QuestionOption` records, sanitizing options and redacting `correct_answer` and `is_correct` for student security. |
| [`base44/functions/generateModularLessonContent/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateModularLessonContent/entry.ts) | `generateModularLessonContent` | **ACTIVE PRODUCTION / BACKEND** | Generates 15 DSKP modular lesson blocks, creating `Assessment`, `QuestionBank`, and `QuestionOption` records when building Block 6 (`KNOWLEDGE_CHECK`). |
| [`base44/functions/generateAdaptiveQuiz/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateAdaptiveQuiz/entry.ts) | `generateAdaptiveQuiz` | **ACTIVE PRODUCTION / BACKEND** | Generates AI adaptive 10-question quizzes based on student weakness/mastery parameters. *(Note: Currently exposes `correct_answer` in return JSON)*. |
| [`base44/functions/createAdaptiveLearningMission/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/createAdaptiveLearningMission/entry.ts) | `createAdaptiveLearningMission` | **ACTIVE PRODUCTION / BACKEND** | Creates adaptive `Assessment`, `QuestionBank`, and `QuestionOption` records and logs `AdaptiveQuizQueue` entries. |
| [`base44/functions/getLessonContent/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/getLessonContent/entry.ts) | `getLessonContent` | **LEGACY / BACKEND** | Legacy lesson content endpoint with fallback to monolithic `Quiz` entity. Redacts `correct_answer` explicitly. |
| [`base44/functions/generateLessonContent/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateLessonContent/entry.ts) | `generateLessonContent` | **LEGACY / BACKEND** | Phase 1 legacy AI content generator writing directly to monolithic `Quiz.questions_json`. |
| [`base44/functions/migrateLegacyQuizData/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/migrateLegacyQuizData/entry.ts) | `migrateLegacyQuizData` | **ADMIN / BACKEND** | Migration script to extract questions from legacy `Quiz.questions_json` and convert them into `Assessment` + `QuestionBank` + `QuestionOption` entities. |
| [`base44/functions/runDiagnosticAnalysis/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/runDiagnosticAnalysis/entry.ts) | `runDiagnosticAnalysis` | **ACTIVE PRODUCTION / BACKEND** | Evaluates student diagnostic assessment results and determines baseline mastery / starting grade level. |

---

## 2. FRONTEND PAGES & COMPONENTS (`src/`)

| File Path | Component / Page | Classification | Primary Responsibility |
|---|---|---|---|
| [`src/pages/QuizPage.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/QuizPage.jsx) | `QuizPage` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Renders student standalone quiz page. Invokes `getLearningPackage` API with fallback to `Quiz` entity if empty, then mounts `QuizRunner`. |
| [`src/components/quiz/QuizRunner.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/QuizRunner.jsx) | `QuizRunner` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Manages question progression, option selection, duration timer, and invokes `submitAssessment` on final submit. Calculates ZERO scores client-side. |
| [`src/components/quiz/QuizResult.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/QuizResult.jsx) | `QuizResult` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Displays score percentage, earned XP & coins, Suku AI misconception feedback, mastery progress update, and optional detailed question explanations based on `submitAssessment` server response. |
| [`src/pages/QuizResult.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/QuizResult.jsx) | `QuizResultPage` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Route component (`/quiz-result/:attemptId`). Fetches `QuizAttempt` record by ID from database and mounts `PracticeReport` or `MasteryReport`. |
| [`src/components/quiz/QuestionCard.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/QuestionCard.jsx) | `QuestionCard` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Visual presentation of a single question and its options (`OptionButton`). Contains no answer verification logic. |
| [`src/components/quiz/OptionButton.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/OptionButton.jsx) | `OptionButton` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Render component for MCQ options (labels A, B, C, D). |
| [`src/components/quiz/PracticeReport.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/PracticeReport.jsx) | `PracticeReport` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Summary card for completed practice attempts using `QuizAttempt` entity data. |
| [`src/components/quiz/MasteryReport.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/MasteryReport.jsx) | `MasteryReport` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Comprehensive report card for formal mastery assessments displaying Bloom's taxonomy performance and retake button. |
| [`src/components/quiz/ExplanationCard.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/ExplanationCard.jsx) | `ExplanationCard` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Renders post-submission explanations for reviewed questions. |
| [`src/components/lesson/blocks/KnowledgeCheckBlock.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/lesson/blocks/KnowledgeCheckBlock.jsx) | `KnowledgeCheckBlock` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Formative assessment component embedded in `LessonShell` Block 6. *(Note: Currently evaluates score client-side using `correct_index` embedded in `LessonBlock.payload`)*. |
| [`src/pages/DiagnosticAssessment.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/DiagnosticAssessment.jsx) | `DiagnosticAssessment` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | 3M (Membaca, Menulis, Mengira) Diagnostic onboarding test experience. Uses dedicated `DiagnosticQuestionBank` entity. |

---

## 3. SERVICES & UTILITIES (`src/services/` & `src/lib/`)

| File Path | Service / File | Classification | Primary Responsibility |
|---|---|---|---|
| [`src/services/assessmentEngine.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/assessmentEngine.js) | `assessmentEngine` | **DEAD / LEGACY MOCK** | Prototype template-driven question generator (`fraction_addition`, `number_comparison`). Not imported or invoked in production frontend runtime. |
| [`src/services/diagnosticAssessmentService.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/diagnosticAssessmentService.js) | `diagnosticAssessmentService` | **ACTIVE PRODUCTION / STUDENT RUNTIME** | Service for managing diagnostic session creation, answer logging, and submitting results to `runDiagnosticAnalysis`. |
| [`src/services/lessonBuilderService.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/lessonBuilderService.js) | `lessonBuilderService` | **LEGACY / ADMIN** | Legacy builder service performing CRUD on the monolithic `Quiz` entity. |
| [`src/pages/AdminDashboard.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/AdminDashboard.jsx) | `AdminDashboard` | **ADMIN** | Admin management dashboard. Displays count of legacy `Quiz` records alongside new entities. |
| [`src/pages/EditLessonResources.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/EditLessonResources.jsx) | `EditLessonResources` | **LEGACY / ADMIN** | Legacy resource editor performing updates on `Quiz` entity rows. |
| [`src/pages/LessonResources.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/pages/LessonResources.jsx) | `LessonResources` | **LEGACY / ADMIN** | Legacy content list displaying `Quiz` records. |

---

## 4. BASE44 DATABASE ENTITIES (`base44/entities/`)

| Entity File | Entity Name | Schema Status | Ownership & Role |
|---|---|---|---|
| [`base44/entities/Assessment.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/Assessment.jsonc) | `Assessment` | **CANONICAL TARGET (V3)** | Parent assessment container. Links to `lesson_id`, `topic_id`, `subject_id`, `level_id`. Stores title, `assessment_type`, `passing_score`, `reward_xp`, `reward_coin`, and status. |
| [`base44/entities/QuestionBank.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/QuestionBank.jsonc) | `QuestionBank` | **CANONICAL TARGET (V3)** | Individual question entity. Links to `assessment_id`, `lesson_version_id`, `lesson_id`, `topic_id`. Stores `question`, `correct_answer`, `explanation`, `difficulty`, `cognitive_level`, `standard_pembelajaran`, `tp_code`. |
| [`base44/entities/QuestionOption.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/QuestionOption.jsonc) | `QuestionOption` | **CANONICAL TARGET (V3)** | Structured option record for MCQ questions. Links to `question_id`. Stores `label` ('A', 'B', 'C', 'D'), `text`, and `sort_order`. |
| [`base44/entities/QuizAttempt.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/QuizAttempt.jsonc) | `QuizAttempt` | **CANONICAL TARGET (V3)** | Student attempt execution log. Stores `student_id`, `assessment_id`, `lesson_version_id`, `score`, `score_percentage`, `answers_json`, `submission_hash`, `reward_settled`, `coins_earned`, `xp_earned`. |
| [`base44/entities/Quiz.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/Quiz.jsonc) | `Quiz` | **LEGACY / MIGRATION** | Phase 1 monolithic entity storing `questions_json` string array. Kept for backward compatibility until full Phase 3 migration. |
| [`base44/entities/AssessmentAttempt.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/AssessmentAttempt.jsonc) | `AssessmentAttempt` | **LEGACY / DEPRECATED** | Early prototype attempt table (822 bytes). Superseded by schema-hardened `QuizAttempt`. |
| [`base44/entities/AssessmentQuestion.jsonc`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/entities/AssessmentQuestion.jsonc) | `AssessmentQuestion` | **LEGACY / DEPRECATED** | Early prototype join table (864 bytes). Superseded by direct `assessment_id` foreign key in `QuestionBank`. |

---

## 5. INVENTORY SUMMARY TABLE

```text
Active Production (Frontend & Backend): 14 files
Admin & Migration Tools:                5 files
Legacy Code (Active & Fallback):        5 files
Dead / Prototype Code:                  3 files
Canonical V3 Entities:                  4 entities
Legacy Entities:                        3 entities
```
