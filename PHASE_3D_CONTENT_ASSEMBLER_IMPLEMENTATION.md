# PHASE 3D: CONTENT ASSEMBLER & IMMUTABLE LESSON SNAPSHOT IMPLEMENTATION REPORT

This document details the assembly contract, approved-only asset eligibility filter, curriculum matching, required/optional asset classification, deterministic 8-stage sequence ordering, snapshot compilation, immutability guarantees, rollback mechanism, idempotency policy, assessment security, and test results for `assembleLessonFromApprovedAssets`.

---

## 1. BACKEND ENDPOINT SPECIFICATION

* **File Location**: [`base44/functions/assembleLessonFromApprovedAssets/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/assembleLessonFromApprovedAssets/entry.ts)
* **Function Purpose**: Server-authoritative endpoint that queries **APPROVED** Content Library assets matching a curriculum identity and compiles them into an **IMMUTABLE** `LessonVersion` snapshot container.
* **Authorization**: Admin-only (`authUser.role === "admin"`). Rejects unauthenticated callers with HTTP 401 `UNAUTHENTICATED` and non-admin users with HTTP 403 `FORBIDDEN`.

---

## 2. INPUT CONTRACT & INPUT VALIDATION

```json
{
  "lesson_id": "les_pecahan_01",
  "topic_id": "top_pecahan_y4",
  "subtopic_id": "sub_penambahan_pecahan",
  "sp_code": "SP 1.1.1"
}
```

The client CANNOT submit trusted blocks or pre-assembled payloads. The server queries the database for approved assets matching `sp_code` and `topic_id`.

---

## 3. APPROVED ASSET ELIGIBILITY & MISSING ASSET GATE

- **Approved-Only Selection**: Filters records strictly by `review_status = "approved"` (or `status = "approved"`). Rejects `draft`, `under_review`, `rejected`, and `archived` assets.
- **Required Asset Validation**: Requires presence of core pedagogical stages: `STORY_HOOK`, `LEARNING_OBJECTIVE`, `CONCEPT_CPA`.
- **Missing Required Asset Gate**: If any required asset type is missing from the Content Library, returns HTTP 422 `{ success: false, error_code: "MISSING_REQUIRED_ASSET", missing_asset_type: "STORY_HOOK" }`.
- **No Placeholder Content**: Never fabricates `"Kandungan tidak tersedia"` placeholder text.

---

## 4. DETERMINISTIC 8-STAGE SEQUENCE ORDERING

Assets are sorted into system-owned stage order using `STAGE_ORDER` (NO AI ordering):

```text
Stage 1: STORY_HOOK (Set Induksi / Naratif Pengenalan)
Stage 2: LEARNING_OBJECTIVE (Objektif Pembelajaran & Kriteria Kejayaan)
Stage 3: CONCEPT_CPA (Penerangan Konsep CPA)
Stage 4: WORKED_EXAMPLE (Contoh Penyelesaian Langkah-demi-Langkah)
Stage 5: INTERACTIVE_PRACTICE (Latihan Terbimbing & Kendiri)
Stage 6: KEY_TAKEAWAY (Refleksi & Nota Ringkas)
Stage 7: APPLICATION (Video & Aktiviti Widget Interaktif)
Stage 8: PBD_ASSESSMENT (Soalan Kuiz & Pentaksiran PBD)
```

If multiple approved candidates exist for a stage, the assembler deterministically selects the latest approved version candidate.

---

## 5. IMMUTABLE SNAPSHOT CONTAINER & NON-PUBLISHING INVARIANTS

1. **Snapshot Isolation**: Compiles new `LessonVersion` container (`version_number = max + 1`, `status = "draft"`, `preview_status = "NOT_VIEWED"`, `assembled_from_library = true`).
2. **Compiled Block Ownership**: Compiled blocks belong strictly to `lesson_version_id = snapshot.id`. Subsequent edits or updates to Content Library assets do **NOT** mutate this compiled snapshot.
3. **No Automatic Publishing**: Assembler **NEVER** mutates `Lesson.published_version_id` or sets status to `published`. Publishing remains a separate, explicit admin action.
4. **Assessment & Answer-Key Security**: `getLearningPackage` continues serving sanitized student payloads; `correct_answer` is never exposed in client payloads.
5. **Clean Rollback**: Tracks created IDs in a stack; if any error occurs during snapshot creation, all newly-created records are deleted in reverse order without modifying pre-existing DB rows.

---

## 6. TEST SUITE & VERIFICATION MATRIX

### Dedicated Unit Tests ([tests/phase3d.test.js](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/tests/phase3d.test.js))
```text
✔ Test 1: Approved asset can be assembled (34ms)
✔ Test 2: Draft asset cannot be assembled (22ms)
✔ Test 3: Under-review asset cannot be assembled (21ms)
✔ Test 4: Archived asset cannot be assembled (20ms)
✔ Test 5: Correct topic assets are selected (31ms)
✔ Test 6: Wrong topic assets are rejected / ignored (22ms)
✔ Test 7: Wrong subtopic assets are rejected / ignored (21ms)
✔ Test 8: Wrong SP code assets are rejected / ignored (21ms)
✔ Test 9: Required asset missing causes assembly failure (20ms)
✔ Test 10: Optional asset missing follows registry policy (32ms)
✔ Test 11: Duplicate asset versions follow deterministic version policy (34ms)
✔ Test 12: Assets appear in deterministic canonical order (31ms)
✔ Test 13: Database insertion order cannot change lesson order (31ms)
✔ Test 14: Assembly creates LessonVersion (30ms)
✔ Test 15: New LessonVersion starts as DRAFT (31ms)
✔ Test 16: assembled_from_library is correctly recorded (29ms)
✔ Test 17: Existing published version remains unchanged (27ms)
✔ Test 18: Modifying library asset after assembly does not alter snapshot (33ms)
✔ Test 19: Approved library assets are not mutated during assembly (27ms)
✔ Test 20: Student runtime does not receive answer keys (23ms)
✔ Test 21: Assembly rollback removes only newly-created records (22ms)
✔ Test 22: Duplicate assembly creates new explicit draft version snapshot (43ms)
✔ Test 23: No automatic publishing occurs (22ms)
✔ Test 24: Preview status is not automatically approved (22ms)
```

### Full Suite Summary
* **Phase 3D Content Assembler Tests**: 24 / 24 PASS (100%)
* **Phase 3C-3 Progressive Workspace Tests**: 15 / 15 PASS (100%)
* **Phase 3C-2B Approval Tests**: 12 / 12 PASS (100%)
* **Phase 3C-2A Generator Tests**: 10 / 10 PASS (100%)
* **Phase 3C-1 Contract Tests**: 10 / 10 PASS (100%)
* **Phase 2 Regression Tests**: 10 / 10 PASS (100%)
* **Build Status**: PASS (`npm run build`)
