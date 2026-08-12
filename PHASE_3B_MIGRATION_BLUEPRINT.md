# PHASE 3B: CONTENT LIBRARY MIGRATION BLUEPRINT

This document details the exact database change table, 10-step implementation sequence, risk mitigation matrix, and Phase 2 coexistence strategy for implementing the Content Library Architecture.

---

## 1. EXACT DATABASE CHANGE TABLE

The migration adheres strictly to the rule: **ZERO NEW DATABASE ENTITIES**. Existing entities are extended by adding optional properties.

| Entity File | Current Schema | Required Schema Change | Reason & Purpose | Risk |
|---|---|---|---|:---:|
| `base44/entities/LessonBlock.jsonc` | `lesson_version_id` required | Make `lesson_version_id` optional. Add optional `topic_id`, `subtopic_id`, `sp_code`, `review_status` properties. | Allows standalone content blocks to exist in Content Library before being attached to a `LessonVersion`. | **P2** |
| `base44/entities/LessonContent.jsonc` | `lesson_version_id` required | Make `lesson_version_id` optional. Add optional `topic_id`, `subtopic_id`, `sp_code` properties. | Allows notes, video scripts, and worksheets to be stored by topic/SP in Content Library. | **P2** |
| `base44/entities/LessonMediaAsset.jsonc` | `lesson_id` optional | Add optional `subtopic_id`, `sp_code` properties. | Enables visual media assets to be queried by DSKP learning standard code. | **P3** |
| `base44/entities/LearningActivity.jsonc` | `lesson_id` required | Make `lesson_id` optional. Add optional `topic_id`, `subtopic_id`, `sp_code`, `widget_type` properties. | Allows interactive widget assets to exist independently in Content Library. | **P2** |
| `base44/entities/Assessment.jsonc` | Links to `lesson_id` | Add optional `lesson_version_id` property. | Establishes version snapshot linking for assessments. | **P2** |
| `base44/entities/QuestionBank.jsonc` | Has `topic_id`, `sp_code`, `status` | **NO CHANGE REQUIRED** | Already fully equipped for topic/SP content library queries. | **P3** |
| `base44/entities/QuestionOption.jsonc` | Links to `question_id` | **NO CHANGE REQUIRED** | Already fully equipped. | **P3** |
| `base44/entities/Flashcard.jsonc` | Has `topic_id`, `sp_code`, `status` | **NO CHANGE REQUIRED** | Already fully equipped. | **P3** |
| `base44/entities/LessonVersion.jsonc` | Has `version_number`, `status` | Add optional `assembled_from_library` boolean flag. | Tracks whether version was compiled from Content Library assets. | **P3** |

---

## 2. 10-STEP IMPLEMENTATION SEQUENCE (FOR PHASE 3C)

The following sequence details the safest implementation roadmap:

```text
Step 1: Schema Property Extensions
        Extend LessonBlock, LessonContent, LessonMediaAsset, LearningActivity, Assessment schemas.
        (Non-breaking: all new fields optional).

Step 2: Content Asset Registry Utility
        Create base44/shared/contentAssetRegistry.ts defining enum mappings and validator rules.

Step 3: Single-Asset Generator Function
        Implement base44/functions/generateContentAsset/entry.ts for generating single assets.

Step 4: AI Quality Shield Gate
        Integrate evaluateAssetQuality into single-asset generator to auto-calculate quality scores.

Step 5: Admin Content Studio UI Adaptation
        Update src/components/admin/AdminContentStudio.jsx to support progressive asset generation & approval.

Step 6: Asset Approval Endpoint
        Implement base44/functions/approveContentAsset/entry.ts to set review_status = 'APPROVED'.

Step 7: Content Library Query Service
        Implement base44/shared/contentLibraryService.ts for querying approved assets by topic/SP.

Step 8: Content Assembler Service
        Implement base44/functions/assembleLessonFromApprovedAssets/entry.ts to compile snapshot versions.

Step 9: Runtime Assembler Integration
        Update getLearningPackage to invoke Assembler when no fixed published_version_id is passed.

Step 10: Legacy Code Deprecation & Verification
        Run full test suite (npm run test), verify published lesson immutability, and archive legacy mock code.
```

---

## 3. COEXISTENCE WITH PHASE 2 PUBLISHED LESSONS

The blueprint guarantees 100% backward compatibility with Phase 2 published lessons:

1. **Dual-Mode Resolution in `getLearningPackage`**:
   - If `lesson_version_id` or `lesson.published_version_id` exists: Serves existing compiled version snapshot directly from DB. Zero disruption.
   - If no version ID exists but `topic_id` / `sp_code` is requested: Serves assembled package from Content Library approved assets.
2. **Draft Isolation Integrity**:
   - Assets in `review_status = "draft"` or `"UNDER_REVIEW"` are visible **ONLY** to admins in `preview=true` mode.
   - Student runtime queries filter strictly by `review_status = "APPROVED"` or `status = "published"`.

---

## 4. MIGRATION RISK MITIGATION MATRIX

| Identified Risk | Severity | Mitigation Strategy |
|---|:---:|---|
| Orphan Content Assets in DB | **P2** | Add `created_source` and clean-up cron job for un-approved draft assets older than 30 days. |
| Incomplete Stage Asset Assembly | **P2** | Content Assembler validates that all 8 DSKP stages exist; if an asset is missing, inserts system fallback block. |
| Student Answer Key Leakage | **P0** | Single-asset quiz generator stores `correct_answer` in `QuestionBank`/`QuestionOption` DB rows, returning sanitized questions without answer keys to client. |
| Overwriting Published Lessons | **P1** | Content Assembler creates a NEW `LessonVersion` number upon each publish. Existing version snapshots remain untouched. |
