# StudyQuest AI — Admin Content Studio Production Workflow Analysis

**Role:** Lead Engineer  
**Date:** August 2026  
**Target:** Production Backend RPC Integration & Workflow Analysis for `AdminContentStudio.jsx`

---

## 1. Where Lesson Creation Should Happen

- **Location:** Inside `handleGenerate()` in `AdminContentStudio.jsx` at **Step 1** of the generation sequence.
- **Workflow & Rules:**
  1. The admin selects curriculum parameters (`subject`, `year`, `topic`, `subtopic_id`, `sk_code`, `sp_code`).
  2. First, query existing lessons using `base44.entities.Lesson.filter({ topic_id, subtopic_id })` (or matching `sp_code`).
  3. **If Found:** Reuse the existing `Lesson` record and store its `id`.
  4. **If Not Found:** Create a new `Lesson` record via `base44.entities.Lesson.create(...)`:
     ```javascript
     const lesson = await base44.entities.Lesson.create({
       topic_id: selectedTopicId,
       subtopic_id: selectedSubtopicId || null,
       subject_name: selectedSubject,
       topic_name: selectedTopicName,
       content_status: "draft",
       version: 1
     });
     ```

---

## 2. Where LessonVersion Creation Should Happen

- **Location:** Inside `handleGenerate()` in `AdminContentStudio.jsx` at **Step 2**, immediately following `Lesson` resolution and prior to calling `generateModularLessonContent`.
- **Workflow & Rules:**
  1. Fetch existing versions for `lesson.id` via `base44.entities.LessonVersion.filter({ lesson_id: lesson.id })`.
  2. Compute `nextVersionNumber = existingVersions.length + 1`.
  3. Create a new `LessonVersion` in `draft` status:
     ```javascript
     const draftVersion = await base44.entities.LessonVersion.create({
       lesson_id: lesson.id,
       version_number: nextVersionNumber,
       status: "draft",
       curriculum_type: "KSSR_SEMAKAN",
       year_level: selectedYear,
       sk_code: selectedSkCode,
       sp_code: selectedSpCode,
       quality_score: 0,
       preview_status: "NOT_VIEWED"
     });
     ```
  4. Pass `draftVersion.id` as `lesson_version_id` into `base44.functions.generateModularLessonContent`:
     ```javascript
     await base44.functions.generateModularLessonContent({
       lesson_id: lesson.id,
       lesson_version_id: draftVersion.id,
       subject: selectedSubject,
       topic: selectedTopicName,
       year: selectedYear
     });
     ```

---

## 3. Required State Changes in `AdminContentStudio.jsx`

| State Variable | Type | Purpose |
|---|---|---|
| **`activeLessonId`** | `string \| null` | Stores the active parent `Lesson` entity ID. |
| **`activeLessonVersionId`** | `string \| null` | Stores the active draft `LessonVersion` ID generated for AI processing. |
| **`generationPhase`** | `'idle' \| 'creating_lesson' \| 'creating_version' \| 'generating_ai' \| 'preview_ready' \| 'publishing' \| 'published' \| 'failed'` | Granular lifecycle phase for visual progress spinners and multi-step UI feedback. |
| **`activeBlocks`** | `Array<LessonBlock>` | Stores the array of modular UI/learning blocks generated and retrieved from the database. |
| **`qualityAudit`** | `{ score: number, feedback: string, completion: number }` | Stores the backend AI Quality Audit metrics and DSKP validation feedback. |
| **`previewStatus`** | `'NOT_VIEWED' \| 'VIEWED' \| 'APPROVED'` | Controls administrative preview approval state required by `publishLessonVersion`. |

---

## 4. Error Handling Strategy

- **Step 1 Failure (Lesson Resolution):**
  - Catch database exception. Display error toast (*"Gagal mencipta/mencari rekod Pelajaran"*). Abort process without creating orphaned child records.
- **Step 2 Failure (LessonVersion Draft Creation):**
  - Catch exception before invoking AI RPC. Display toast (*"Gagal menyediakan Draf Versi Pelajaran"*). Abort process.
- **Step 3 Failure (AI Generation RPC `generateModularLessonContent`):**
  - If Gemini API fails, times out, or throws an RPC error:
  - Catch exception, inform admin via toast, and execute **Rollback Strategy**.
- **Step 5 Failure (`publishLessonVersion` RPC):**
  - If publishing is rejected (e.g. `quality_score < 80%` or `preview_status !== "APPROVED"`):
  - Retain draft `LessonVersion` in the database for inspection.
  - Display error details to the admin with actionable steps (e.g., *"Preview and approve content before publishing"*).

---

## 5. Rollback Strategy If AI Generation Fails

If `generateModularLessonContent` fails after a draft `LessonVersion` has already been created:

1. **Delete Draft `LessonVersion`:**
   ```javascript
   if (draftVersionId) {
     await base44.entities.LessonVersion.delete(draftVersionId);
   }
   ```
2. **Delete Parent `Lesson` (If Newly Created & Unreferenced):**
   ```javascript
   if (isNewLesson && activeLessonId) {
     const existingVersions = await base44.entities.LessonVersion.filter({ lesson_id: activeLessonId });
     if (existingVersions.length === 0) {
       await base44.entities.Lesson.delete(activeLessonId);
     }
   }
   ```
3. **State Cleanup:**
   - Reset `activeLessonId = null`, `activeLessonVersionId = null`, `activeBlocks = []`, and set `generationPhase = 'idle'`.
4. **User Feedback:**
   - Display toast alert: *"Penjana AI tergendala. Draf telah dipadamkan (rolled back). Sila cuba semula."*
