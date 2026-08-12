# STUDYQUEST AI — CANONICAL ARCHITECTURE FREEZE (PHASE 4C)

This document formalizes the canonical architecture freeze for StudyQuest AI following the completion and verification of Phases 1 through 4B.

---

## 1. ARCHITECTURE FREEZE SPECIFICATION

Effective immediately, the core backend data structures, content pipeline, assessment runtime, and security invariants are frozen under the following canonical specifications:

### 1. Asset & Content Library Invariants
- `generateContentAsset` is the **ONLY** canonical server function for generating individual curriculum-bound content assets.
- `evaluateAssetQuality` is the **ONLY** server quality evaluator for generated assets.
- `approveContentAsset` is the **ONLY** server-authoritative state transition from `DRAFT` / `UNDER_REVIEW` to `APPROVED`. Client-side approval spoofing is permanently blocked.
- Approved content library assets are **IMMUTABLE**.

### 2. Assembler & Snapshot Invariants
- `assembleLessonFromApprovedAssets` is the **ONLY** canonical assembler compiling approved library assets into deterministic `LessonVersion` snapshots.
- `assembleLessonFromApprovedAssets` selects strictly `review_status = "approved"` assets matching curriculum identity (`topic_id` / `subtopic_id` / `sp_code`).
- Newly assembled `LessonVersion` snapshots start strictly as `DRAFT` and require explicit admin publication via `publishLessonVersion`.
- Student runtime endpoints (`getLearningPackage`) **NEVER** dynamically invoke the assembler.

### 3. Student Runtime & Security Invariants
- `getLearningPackage` serves strictly published `LessonVersion` snapshots (`status = "published"`) for student requests.
- `getLearningPackage` recursively sanitizes options arrays, omitting `correct_answer`, `is_correct`, `correct_option_id`, and explanations from student payloads.
- Direct student access to `DRAFT`, `UNDER_REVIEW`, or unpublished version snapshots is blocked (HTTP 404).

### 4. Assessment & Reward Invariants
- `submitAssessment` is the **ONLY** server-authoritative scoring endpoint for student assessment submissions.
- Client-provided scores, `passed` flags, or correctness booleans are completely ignored.
- SHA-256 submission hashes (`student_id + assessment_id + sortedAnswers`) enforce idempotency, preventing duplicate XP or coin awards on repeated submissions or replay requests.

---

## 2. VERIFIED CANONICAL ENDPOINT INVENTORY

| Endpoint / Service | Role in Frozen Canonical Architecture | Status |
| :--- | :--- | :---: |
| `base44/functions/generateContentAsset/entry.ts` | Single Asset Content Library Generator | **FROZEN** |
| `base44/functions/approveContentAsset/entry.ts` | Server-Authoritative Asset Approval Gate | **FROZEN** |
| `base44/functions/assembleLessonFromApprovedAssets/entry.ts` | Deterministic Content Assembler | **FROZEN** |
| `base44/functions/publishLessonVersion/entry.ts` | Lesson Version Publishing Gate | **FROZEN** |
| `base44/functions/getLearningPackage/entry.ts` | Student Package Delivery & Payload Sanitizer | **FROZEN** |
| `base44/functions/submitAssessment/entry.ts` | Server-Authoritative Assessment Scoring & Rewards | **FROZEN** |
| `base44/shared/lessonMapper.ts` | Canonical DTO & Entity Mapping Transformer | **FROZEN** |
| `base44/shared/masteryEngine.ts` | 4-Tier Student Mastery Calculation Engine | **FROZEN** |
| `base44/shared/lessonCompletenessEvaluator.ts` | Lesson Completeness & Quality Shield Evaluator | **FROZEN** |
