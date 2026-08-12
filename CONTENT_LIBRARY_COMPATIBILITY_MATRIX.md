# CONTENT LIBRARY COMPATIBILITY MATRIX

This document maps proposed progressive Content Library assets against existing Base44 database entities, analyzing reuse feasibility, missing fields, and architectural risk.

---

## CONTENT ASSET COMPATIBILITY MATRIX

| Proposed Content Asset | Existing Entity | Can Reuse? | Missing Fields / Needed Adjustments | Risk |
|---|---|:---:|---|:---:|
| **Lesson Hook (Induction)** | `LessonBlock` / `LessonContent` | **YES** | Make `lesson_version_id` optional; add direct `topic_id`, `subtopic_id`, `sp_code` fields. | **P2** |
| **Lesson Objective** | `TeacherGuide` / `LessonBlock` | **YES** | Make `lesson_id` / `lesson_version_id` optional; add direct `sp_code` and `learning_standard_id`. | **P2** |
| **Concept (CPA)** | `LessonBlock` / `LessonContent` | **YES** | Make `lesson_version_id` optional; store `cpa_stage` (Concrete, Pictorial, Abstract) in payload. | **P2** |
| **Worked Example** | `LessonBlock` / `AIExplanation` | **YES** | Make `lesson_version_id` optional; add direct `sp_code` and `difficulty` tagging. | **P2** |
| **Guided Practice** | `LessonBlock` / `LearningActivity` | **YES** | Make `lesson_id` / `lesson_version_id` optional; add direct `sp_code` foreign key. | **P2** |
| **Video Asset** | `LessonMediaAsset` / `LessonContent` | **YES** | Make `lesson_version_id` optional; add `youtube_url`, `video_script`, `duration_seconds`, `topic_id`. | **P2** |
| **Interactive Widget** | `LearningActivity` | **YES** | Make `lesson_id` optional; add direct `sp_code`, `widget_type` (linking to `widgetRegistry.js`). | **P2** |
| **Quiz Question** | `QuestionBank` | **YES** | Already supports `topic_id`, `subtopic_id`, `sp_code`, `status`, `approved_by`! Fully reusable. | **P3** |
| **Quiz Option** | `QuestionOption` | **YES** | Fully reusable AS-IS. Links to `QuestionBank.id`. | **P3** |
| **Assessment Container** | `Assessment` | **YES** | Already supports `topic_id`, `subject_id`, `assessment_type`, `status`. Needs optional `lesson_version_id`. | **P2** |
| **Flashcard Deck** | `Flashcard` | **YES** | Already supports `topic_id`, `sp_code`, `status`, `approved_by`. Fully reusable. | **P3** |
| **Infographic Asset** | `LessonMediaAsset` | **YES** | Already supports `image_url`, `key_points_json`, `visual_labels_json`, `status`. Fully reusable. | **P3** |

---

## KEY COMPATIBILITY FINDINGS

1. **No New Entities Required**: Every single proposed asset type in the progressive Content Library maps cleanly onto existing Base44 entities (`LessonBlock`, `LessonContent`, `LessonMediaAsset`, `LearningActivity`, `QuestionBank`, `QuestionOption`, `Assessment`, `Flashcard`).
2. **Single Schema Adjustment Needed**: The only structural adjustment required across content entities is making `lesson_version_id` / `lesson_id` **optional** (nullable) and ensuring direct `topic_id`, `subtopic_id`, and `sp_code` fields exist. This allows assets to be created, approved, and stored in the Content Library **BEFORE** being attached to a specific `LessonVersion`.
3. **Approval Status Already Exists**: All content entities already contain `status` (`draft`, `published`, `archived`), `created_source` (`manual`, `ai_generated`), `approved_by`, and `approved_at`.
