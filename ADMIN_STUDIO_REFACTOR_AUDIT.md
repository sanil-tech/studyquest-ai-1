# StudyQuest AI — Admin Content Studio Refactoring Audit

**Role:** Lead Engineer  
**Date:** August 2026  
**Target:** Production Content Management Workflow (`AdminContentStudio.jsx` Refactoring Audit)

---

## Target Architectural Flow
```
AdminContentStudio.jsx
        │
        ▼
Base44 RPC Function
        │
        ▼
generateModularLessonContent
        │
        ▼
LessonVersion (draft) ──► Admin Review & Approval
        │
        ▼
publishLessonVersion (RPC)
        │
        ▼
Student LessonPage (via getLearningPackage)
```

---

## 1. Current Data Flow

Currently, `AdminContentStudio.jsx` operates almost entirely in-memory on the client side:

1. **Parameter Selection:** Admin selects Subject, Year/Grade, SK/SP code, Topic, Assigned Class, and Target TP.
2. **Client-Side Generation:** Admin clicks *"Jana Shell Pelajaran (v2)"* or *"Jana Pakej Legasi (v1.0)"*, triggering `generateLesson()` in `aiContentFiller.js` or `generateKSSRMissionPackage()` in `aiContentEngine.js`.
3. **In-Memory Storage:** Generated content is saved to local React component state (`activePackage` and `lessonResult`). No records are saved to the Base44 database.
4. **In-Memory Preview:** `UniversalLessonPreview.jsx` renders the generated JSON from React state.
5. **Mock Publishing:** Clicking *"Terbitkan Pelajaran ke Kelas"* calls `handlePublishLesson()`, which merely updates React state (`publishedLesson`) and shows a toast message. **No database entities or version records are created or updated.**

---

## 2. Exact Functions to Replace

| Component / Service | Current Function / Pattern | Replacement Strategy |
|---|---|---|
| **`AdminContentStudio.jsx`** | `handleGenerate()` calling `generateLesson()` (client-side) | Call `base44.functions.generateModularLessonContent({ subject, topic, year, sk_code, sp_code, target_tp })` |
| **`AdminContentStudio.jsx`** | `handlePublishLesson()` (in-memory state update) | Call `base44.functions.publishLessonVersion({ lesson_version_id, preview_status: "APPROVED" })` |
| **`src/services/aiContentFiller.js`** | `generateLesson()` & `callLLMForContent()` (client Gemini calls) | Deprecate client-side LLM calls; delegate to server-side RPC `generateModularLessonContent` |
| **`src/services/aiContentEngine.js`** | `generateKSSRMissionPackage()` (client-side generation) | Mark as deprecated / redirect to `generateModularLessonContent` RPC |
| **`src/services/generateKSSRContent.js`** | Client-side prompt strings & SDK writes | Deprecate in favor of server-side RPC pipeline |
| **`src/pages/LessonResources.jsx`** | Direct SDK entity creation (`LessonContent.create`, `QuestionBank.create`, etc.) | Refactor to delegate draft generation & publishing to `generateModularLessonContent` and `publishLessonVersion` |

---

## 3. State Variables Affected in `AdminContentStudio.jsx`

- **`activePackage`**: Currently holds client-side JSON generated in-memory. Will now store the structured RPC response containing `lesson_id`, `lesson_version_id`, `blocks`, and `quality_score`.
- **`lessonResult`**: Currently stores client-side `validateLessonShell()` output. Will be replaced by backend `quality_score`, `completeness`, and `validation_errors` returned by the RPC.
- **`publishedLesson`**: Currently stores in-memory mock state. Will track actual publication metadata (`published_version_id`, `published_at`) returned by `publishLessonVersion`.
- **New State `generatedVersionId`**: Will track the active draft `LessonVersion` ID to pass into `publishLessonVersion`.
- **New State `isPublishing`**: Tracks loading state during the `publishLessonVersion` RPC call.

---

## 4. Required Frontend Changes

1. **Wire `handleGenerate` to Backend RPC:**
   - Invoke `base44.functions.generateModularLessonContent`.
   - Handle loading state, error states, and store `lesson_version_id`, `blocks`, and `quality_score` in state.
2. **Wire `handlePublishLesson` to `publishLessonVersion` RPC:**
   - Pass `lesson_version_id` and `preview_status: "APPROVED"`.
   - Handle success response (archives previous version, marks draft as published, sets `Lesson.published_version_id`).
3. **Display Backend Quality Score & Status Badges:**
   - Display real Quality Shield rating (`quality_score >= 80%`).
   - Disable publishing button if quality score is below 80% or if preview status is not approved.
4. **Unify Preview Payload:**
   - Ensure `UniversalLessonPreview.jsx` renders directly from `blocks` returned by `generateModularLessonContent`.

---

## 5. Potential Breaking Points

1. **Block Payload Property Mismatch:**
   - Legacy state expected `activePackage.student_ui` or `activePackage.steps`.
   - The backend RPC `generateModularLessonContent` returns standard `LessonBlock` records adhering to `FIVE_PHASE_LESSON_SCHEMA`.
   - *Mitigation:* Verify `UniversalLessonPreview` accepts standard `blocks` arrays without relying on legacy `student_ui` wrappers.
2. **Parent `Lesson` Entity Association:**
   - `generateModularLessonContent` requires a valid `lesson_id` or creates/resolves a target `Lesson` entity.
   - *Mitigation:* Ensure frontend passes or creates a parent `Lesson` container ID properly.
3. **Quality Shield Enforcement:**
   - If generated content achieves `< 80%` quality score, `publishLessonVersion` will reject publishing.
   - *Mitigation:* Display clear validation errors in the admin UI, enabling the admin to regenerate or edit blocks prior to publishing.
