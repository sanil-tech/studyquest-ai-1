# STUDYQUEST AI — PRODUCTION HARDENING MATRIX (PHASE 4C)

This document establishes the security, authorization, idempotency, data lifecycle, and contract hardening matrix across all core Base44 functions and services.

---

## 1. AUTHORIZATION & CAPABILITY MATRIX

| System Capability | Student | Teacher | Admin | Enforcing Edge Function / Verification Gate |
| :--- | :---: | :---: | :---: | :--- |
| **View Published Lesson** | **YES** | **YES** | **YES** | `getLearningPackage` (Only returns published version snapshots for non-admins) |
| **View Draft Lesson / Preview** | **NO** | **YES** | **YES** | `getLearningPackage` (Enforces role check for `preview=true` or draft `lesson_version_id`) |
| **Generate Content Asset** | **NO** | **NO** | **YES** | `generateContentAsset` (Token role check `role === "admin"`) |
| **Approve Content Asset** | **NO** | **NO** | **YES** | `approveContentAsset` (Server-authoritative admin authorization check) |
| **Assemble Lesson Snapshot** | **NO** | **NO** | **YES** | `assembleLessonFromApprovedAssets` (Strict admin authorization check) |
| **Publish Lesson Version** | **NO** | **NO** | **YES** | `publishLessonVersion` (Strict admin authorization check) |
| **View Answer Key / Correct Option** | **NO** | **YES** | **YES** | `getLearningPackage` (Sanitizes options array; omits `is_correct` / `correct_answer`) |
| **Submit Assessment** | **YES** | **NO*** | **NO*** | `submitAssessment` (Evaluates active user token; blocks cross-user submission) |

*\*Note: Admins and teachers can invoke test submissions in staging/preview environments, but server scoring records attempts under their respective user token.*

---

## 2. CORE BACKEND FUNCTION HARDENING & INVARIANTS

| Function / File | Primary Invariants & Hardening Controls | Status |
| :--- | :--- | :---: |
| [`base44/functions/generateContentAsset/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateContentAsset/entry.ts) | 1. Generates exactly 1 asset bound to curriculum metadata.<br>2. Evaluates Quality Shield (`evaluateAssetQuality`).<br>3. Saves strictly as `DRAFT` or `UNDER_REVIEW`.<br>4. Rejects attempts to write directly as `APPROVED`. | **HARDENED** |
| [`base44/functions/approveContentAsset/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/approveContentAsset/entry.ts) | 1. Server-authoritative state transition (`DRAFT` → `APPROVED`).<br>2. Verifies Quality Shield score $\ge 70$.<br>3. Rejects client spoofing of approval or quality metrics.<br>4. Creates AuditLog entry. | **HARDENED** |
| [`base44/functions/assembleLessonFromApprovedAssets/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/assembleLessonFromApprovedAssets/entry.ts) | 1. Selects strictly `review_status = "approved"` assets.<br>2. Validates curriculum alignment & required asset types.<br>3. Creates isolated `LessonVersion` snapshot (`status = "draft"`).<br>4. Atomic rollback on failure. Never auto-publishes. | **HARDENED** |
| [`base44/functions/getLearningPackage/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/getLearningPackage/entry.ts) | 1. Returns published version snapshots for students.<br>2. Sanitizes payload (omits `correct_answer`, `is_correct`, answer keys).<br>3. Rejects student requests for unapproved/draft lessons. | **HARDENED** |
| [`base44/functions/submitAssessment/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/submitAssessment/entry.ts) | 1. Server-authoritative scoring against database `QuestionOption`.<br>2. Ignores client-provided scores or correctness flags.<br>3. Computes SHA-256 submission hash for anti-farming.<br>4. Prevents duplicate XP / coin awards on replay. | **HARDENED** |
| [`base44/functions/publishLessonVersion/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/publishLessonVersion/entry.ts) | 1. Validates completeness criteria before publishing.<br>2. Updates `Lesson.published_version_id` atomically.<br>3. Ensures older published snapshots remain immutable. | **HARDENED** |

---

## 3. IDEMPOTENCY & ANTI-FARMING HARDENING

1. **Submission Hashing**: `submitAssessment` computes `submission_hash = SHA256(student_id + assessment_id + sortedAnswers)`. Duplicate submissions return cached `QuizAttempt` results with HTTP 200 without re-granting XP or coins.
2. **Repeat Pass Protection**: Submitting an assessment that was previously passed (`already_passed: true`) awards **0 coins** and **5 retention XP**, eliminating repeat quiz farming.
3. **Assembly Idempotency**: `assembleLessonFromApprovedAssets` always creates a distinct, numbered draft `LessonVersion` snapshot. It never mutates existing published versions.
