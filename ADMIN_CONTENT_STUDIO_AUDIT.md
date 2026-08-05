# StudyQuest AI — Admin Content Studio & Content Pipeline Audit

**Role:** Lead Engineer  
**Date:** August 2026  
**Target:** Admin Content Studio & Generation Pipeline Refactoring Plan

---

## 1. Current Admin Workflow

### In `AdminContentStudio.jsx`:
1. **Curriculum Selection:** The admin selects Subjek, Tahun/Darjah, Tajuk Utama, SK, SP, Assigned Class, and PBD target (TP3).
2. **AI Generation Trigger:**
   - Clicking **"Jana Shell Pelajaran (v2)"** calls `generateLesson()` in `aiContentFiller.js` (client-side generation).
   - Clicking **"Jana Pakej Legasi (v1.0)"** calls `generateKSSRMissionPackage()` in `aiContentEngine.js` (client-side generation).
   - *Issue:* Neither button currently calls the server-side Base44 RPC `generateModularLessonContent`.
3. **In-Memory Preview & Edit:** Generated content is saved strictly in React state (`activePackage`). The admin can override mascot dialogue or select interactive widgets in state.
4. **Publishing:** Clicking **"Terbitkan Pelajaran ke Kelas"** runs `handlePublishLesson()`.
   - *Issue:* This handler currently performs an **in-memory mock update** (`setPublishedLesson`, toast alert) and **does not write to the Base44 database**. Data is lost on refresh.

### In `BatchGenerationRunner.jsx` & `contentProductionService.js`:
1. **Batch Runner Pipeline:** Clicking **"Start Pipeline"** runs `processSp()` sequentially for curriculum targets.
2. **Simulated State Machine:** `processSp()` iterates through status transitions (`MISSING` -> `GENERATING` -> `QUALITY_CHECK` -> `APPROVED` -> `RESOURCE_LIBRARY`) using `setTimeout` delays and a local `productionDb` array.
3. *Issue:* It does not create real `Lesson`, `LessonVersion`, or sub-entity records in the Base44 database.

---

## 2. Files Still Using Legacy AI Generation

1. **`src/services/aiContentEngine.js`**
   - Implements `generateKSSRMissionPackage()` and `generateAdventurePackage()`.
   - Executes client-side Gemini calls or mock generators rather than calling backend RPCs.
2. **`src/services/generateKSSRContent.js`**
   - Constructs legacy client-side prompt strings and invokes client-side AI routines for KSSR/KSSM modules.
3. **`src/services/aiContentFiller.js`**
   - Implements `generateLesson()` used by `AdminContentStudio.jsx` (v2 flow).
   - Performs client-side schema assembly without persisting draft `LessonVersion` records to Base44.
4. **`src/components/AdminContentStudio.jsx`**
   - Directly imports and invokes `generateKSSRMissionPackage` and `generateLesson`.

---

## 3. Components Directly Writing Database Entities (or Bypassing Backend RPCs)

1. **`src/pages/LessonResources.jsx`**
   - Bypasses backend RPCs by making fragmented SDK calls:
     - `base44.entities.LessonContent.create(...)`
     - `base44.entities.Flashcard.create(...)`
     - `base44.entities.QuestionBank.create(...)`
     - `base44.entities.LessonBlock.create(...)`
     - `base44.entities.LessonVersion.create(...)`
     - `base44.entities.Lesson.update(...)`
2. **`src/components/AdminContentStudio.jsx`**
   - Does not write to DB at all during publishing (`handlePublishLesson` only updates local React state).
3. **`src/services/contentProductionService.js`**
   - Uses an in-memory JavaScript array (`productionDb`) to simulate DB entity creation.

---

## 4. Recommended Files to Modify

| File | Proposed Change |
|---|---|
| **`src/components/AdminContentStudio.jsx`** | Wire generation to `base44.functions.generateModularLessonContent` (RPC) and publishing to `base44.functions.publishLessonVersion` (RPC). |
| **`src/services/contentProductionService.js`** | Replace simulated `productionDb` logic in `processSp()` with real calls to `generateModularLessonContent` and `publishLessonVersion`. |
| **`src/components/admin/BatchGenerationRunner.jsx`** | Update batch status triggers to reflect real `LessonVersion` statuses (`draft`, `published`) from the backend. |
| **`src/pages/LessonResources.jsx`** | Refactor manual entity `create()` calls to delegate version creation and publishing to backend RPCs. |
| **`src/services/aiContentEngine.js`** | Refactor functions to wrap `base44.functions.generateModularLessonContent` or flag legacy client-side generation routines as deprecated. |

---

## 5. Migration Risks

1. **Data Loss Risk:** Admin content generated in `AdminContentStudio.jsx` or `BatchGenerationRunner.jsx` currently disappears on page refresh because no persistent records are created in Base44.
2. **Schema & Component Payload Mismatch:** `AdminContentStudio.jsx` expects `activePackage.student_ui` and `activePackage.steps`, whereas the server-side RPC `generateModularLessonContent` returns `blocks` adhering to `FIVE_PHASE_LESSON_SCHEMA`. The preview components (`UniversalLessonPreview.jsx` and `BlockRenderer.jsx`) must seamlessly handle the modular `blocks` payload.
3. **Bypassing Quality Shield:** Direct entity creation in `LessonResources.jsx` bypasses the server-side Quality Shield audit (`quality_score >= 80%`) in `publishLessonVersion`.
4. **Client-Side Secret Exposure:** Client-side Gemini calls in `aiContentEngine.js` risk exposing API keys. Shifting all generation to server-side RPCs ensures complete security and compliance.
