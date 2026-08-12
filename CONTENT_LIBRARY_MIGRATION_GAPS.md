# CONTENT LIBRARY MIGRATION GAPS

This document details the exact architectural, service, and component changes required to transition StudyQuest to a progressive Content Library Architecture.

---

## 1. COMPONENT & ENTITY CLASSIFICATION

| Target Component / Entity | Audit Classification | Required Action |
|---|---|---|
| `CurriculumStandard` (DSKP) | **REUSE AS-IS** | Use directly for structured taxonomy lookup (`subject`, `year_level`, `topic`, `standard_content_code`, `standard_learning_code`). |
| `Topic` / `Subtopic` / `Subject` | **REUSE AS-IS** | Hierarchy links remain unchanged. |
| `QuestionBank` / `QuestionOption` | **REUSE AS-IS** | Already support `topic_id`, `subtopic_id`, `sp_code`, `difficulty`, `status`, `approved_by`. |
| `Flashcard` | **REUSE AS-IS** | Already support `topic_id`, `sp_code`, `status`, `approved_by`. |
| `LessonMediaAsset` | **REUSE AS-IS** | Supports `image_url`, `key_points_json`, `visual_labels_json`, `status`, `approved_by`. |
| `LessonBlock` | **REUSE WITH SMALL EXTENSION** | Make `lesson_version_id` optional; add direct `topic_id`, `subtopic_id`, `sp_code` properties. |
| `LessonContent` | **REUSE WITH SMALL EXTENSION** | Make `lesson_version_id` optional; add direct `topic_id`, `subtopic_id`, `sp_code` properties. |
| `LearningActivity` | **REUSE WITH SMALL EXTENSION** | Make `lesson_id` optional; add direct `sp_code` and `widget_type` properties. |
| `Assessment` | **REUSE WITH SMALL EXTENSION** | Add optional `lesson_version_id` to establish immutable version snapshot links. |
| `LessonVersion` | **REUSE WITH SMALL EXTENSION** | Maintain snapshot container role. Add `assembled_from_library` flag. |
| `AdminContentStudio.jsx` | **REFILL / ADAPT** | Adapt existing UI to support progressive single-asset generation & approval workflows (Hook, Concept, Video, Interactive, Quiz). |
| `AIQualityScorecard.jsx` | **REUSE AS-IS** | Evaluates asset and version quality against DSKP rubrics. |
| `UniversalLessonPreview.jsx` | **REUSE AS-IS** | Renders live preview of individual assets or assembled lesson shells. |
| `widgetRegistry.js` | **REUSE AS-IS** | Manages all 10 interactive widgets (`base_ten_blocks`, `sentence_builder`, `fraction_slicer`, etc.). |
| `getLearningPackage` | **REFILL / ADAPT** | Adapt to query approved library assets by `topic_id` / `sp_code` if no fixed `lesson_version_id` is passed. |
| `submitAssessment` | **REUSE AS-IS** | Server-authoritative submission engine remains completely unchanged. |
| `adventureEngine.js` | **REUSE AS-IS** | Consumes assembled learning packages seamlessly. |
| Legacy `Quiz.jsonc` entity | **DEPRECATE** | Phase out once all legacy monolithic quizzes are migrated. |
| `src/services/assessmentEngine.js` | **DEPRECATE** | Archive unused mock prototype file. |

---

## 2. DETAILED GAP ANALYSIS BY DOMAIN

### A. Database & Schema Gaps
* **Gap**: Currently, `LessonBlock`, `LessonContent`, and `LearningActivity` require `lesson_version_id` or `lesson_id` upon creation.
* **Solution**: In `LessonBlock.jsonc`, `LessonContent.jsonc`, and `LearningActivity.jsonc`, remove `lesson_version_id` / `lesson_id` from the `"required"` array and add optional `topic_id`, `subtopic_id`, and `sp_code` properties.
* **New Entities Required**: **ZERO**.

### B. Admin Content Production Workflow Gaps
* **Gap**: Admin generators (`generateModularLessonContent`) currently generate all 15 blocks simultaneously in a single API call.
* **Solution**: Expose progressive asset generation endpoints (or mode flags) in AI services to generate single assets on demand:
  1. `generateAsset({ topic_id, sp_code, asset_type: "HOOK" })`
  2. `generateAsset({ topic_id, sp_code, asset_type: "CONCEPT" })`
  3. `generateAsset({ topic_id, sp_code, asset_type: "VIDEO_SCRIPT" })`
  4. `generateAsset({ topic_id, sp_code, asset_type: "INTERACTIVE" })`
  5. `generateAsset({ topic_id, sp_code, asset_type: "QUIZ_SET" })`
* **Admin UI Adjustment**: Update `AdminContentStudio.jsx` to present a asset selection menu (Curriculum → Topic → SP → Content Type → Generate Asset → Review/Approve → Save to Library).

### C. Runtime Lesson Assembly Gaps
* **Gap**: `getLearningPackage` expects a fixed `published_version_id`.
* **Solution**: Enhance `getLearningPackage` resolution logic:
  - If explicit `lesson_version_id` is provided: Fetch fixed version snapshot.
  - If `topic_id` or `sp_code` is provided without a version ID: Fetch approved assets for that topic/SP from the Content Library and sort them into the deterministic 8-stage DSKP sequence (`STORY_HOOK` → `LEARNING_OBJECTIVE` → `CONCEPT_CPA` → `WORKED_EXAMPLE` → `INTERACTIVE_PRACTICE` → `KNOWLEDGE_CHECK` → `KEY_TAKEAWAY` → `MISSION_COMPLETE`).

---

## 3. SUMMARY OF REQUIRED CHANGES

```text
Entities to create:      0
Entities to extend:      4 (Make parent FKs optional; add topic_id / sp_code)
Entities to deprecate:   1 (Legacy Quiz.jsonc)
UI Components to adapt:  1 (AdminContentStudio.jsx)
UI Components to reuse:  ALL previewers, renderers, and widget components
Backend APIs to adapt:   1 (getLearningPackage assembler)
Backend APIs to reuse:   submitAssessment, runDiagnosticAnalysis, etc.
```
