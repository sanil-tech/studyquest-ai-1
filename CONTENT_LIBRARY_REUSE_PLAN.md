# CONTENT LIBRARY REUSE PLAN

This document outlines the execution plan for maximizing architecture reuse while implementing the progressive Content Library Architecture in StudyQuest.

---

## 1. WHAT TO REUSE UNCHANGED (100% REUSE)

The following core infrastructure items will be preserved without modification:

1. **Curriculum Taxonomy System**:
   - Entities: `Curriculum`, `CurriculumStandard`, `Subject`, `Topic`, `Subtopic`, `Level`.
   - Role: Provides canonical DSKP hierarchy (`subject`, `year_level`, `standard_content_code`, `standard_learning_code`).
2. **Server-Authoritative Evaluation Engine**:
   - Entrypoint: [`base44/functions/submitAssessment/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/submitAssessment/entry.ts)
   - Role: Performs SHA-256 idempotency checks, score calculations, repeat-pass anti-farming checks, wallet/progress settlements, and EWMA mastery updates.
3. **Interactive Widget Registry**:
   - Service: [`src/services/widgetRegistry.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/widgetRegistry.js)
   - Role: Drives 10 interactive widgets (`base_ten_blocks`, `sentence_builder`, `fraction_slicer`, `number_scale`, `money_counter`, `clock_face`, `shape_sorter`, `piktograf`, etc.).
4. **Deterministic UI Renderers**:
   - Components: [`LessonShellRenderer.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/lesson/LessonShellRenderer.jsx), [`QuizRunner.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/QuizRunner.jsx), [`QuizResult.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/quiz/QuizResult.jsx), [`UniversalLessonPreview.jsx`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/components/admin/UniversalLessonPreview.jsx).
5. **Adventure & Student Journey Engines**:
   - Engine: [`adventureEngine.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/adventureEngine.js), [`studentJourneyService.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/studentJourneyService.js).
6. **Question & Option Storage**:
   - Entities: `QuestionBank.jsonc`, `QuestionOption.jsonc`.

---

## 2. WHAT TO REUSE WITH MINIMAL EXTENSION

1. **`LessonBlock` Entity**:
   - *Adjustment*: Remove `lesson_version_id` from `required` list. Add optional `topic_id`, `subtopic_id`, `sp_code` fields.
2. **`LessonContent` Entity**:
   - *Adjustment*: Remove `lesson_version_id` from `required` list. Add optional `topic_id`, `subtopic_id`, `sp_code` fields.
3. **`LearningActivity` Entity**:
   - *Adjustment*: Remove `lesson_id` from `required` list. Add optional `sp_code` and `widget_type` fields.
4. **`Assessment` Entity**:
   - *Adjustment*: Add optional `lesson_version_id` for snapshot linking.
5. **`getLearningPackage` Function**:
   - *Adjustment*: Enhance resolution logic to query approved library assets by `topic_id` / `sp_code` when no fixed version ID is specified.
6. **`AdminContentStudio.jsx` Component**:
   - *Adjustment*: Add asset-type filter controls to allow progressive single-asset generation & approval workflows.

---

## 3. WHAT TO DEPRECATE

1. Legacy `Quiz.jsonc` monolithic entity (once all legacy quizzes are converted via `migrateLegacyQuizData`).
2. `src/services/assessmentEngine.js` prototype mock code.

---

## 4. IMPLEMENTATION ROADMAP (Phase 3B Preparation)

```text
Phase 3B Step 1: Extend 4 existing entities (make parent FKs optional; add topic_id/sp_code tags)
Phase 3B Step 2: Add single-asset generation mode in AI content services
Phase 3B Step 3: Update AdminContentStudio UI for asset-by-asset generation & approval
Phase 3B Step 4: Enhance getLearningPackage runtime assembler to assemble approved library assets
Phase 3B Step 5: Verify zero regressions across student runtime and test suite
```
