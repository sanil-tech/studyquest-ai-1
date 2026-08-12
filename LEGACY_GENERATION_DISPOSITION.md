# Legacy Generation Disposition

This document tracks the classification and disposition of legacy generation files and endpoints in the StudyQuest AI repository following the implementation of the Phase 2 corrective audit.

## 1. Dead Code (Verified Unused)

These files have zero references in the current codebase and can be safely deleted:
- `base44/functions/generateLessonContent/entry.ts` (Legacy generation endpoint, fully replaced by `generateModularLessonContent`)
- `src/services/aiContentFiller.js` (Zero imports found; historically used for piecemeal block generation but no longer connected to UI)

## 2. Active Legacy (Do Not Delete Yet)

These files are still maintained because we must formally prove full substitution, or they are imported by active components and must be maintained until their callers are migrated:

- `base44/functions/saveGeneratedLesson/entry.ts`
  - **Status:** ACTIVE LEGACY (Pending Deletion Proof)
  - **Notes:** Now that `generateModularLessonContent` handles 100% of autonomous database graph generation (Lesson, LessonVersion, LessonBlock, Assessment, QuestionBank, QuestionOption) natively via atomic creation and rollback, this file is functionally superseded. It remains in the repository pending final proof and architectural sign-off before deletion.

- `src/services/aiContentEngine.js` 
  - **Status:** ACTIVE LEGACY
  - **Callers:** `resourceLibraryService.js`, `lessonShellBuilder.js`, `lessonReviewService.js`, `contentFactoryService.js`, `admin/AIGenerationPanel.jsx`
  - **Notes:** Contains `generateLessonForSP`, `getPedagogyContext`, and `generateKSSRMissionPackage`. Needs a dedicated refactoring phase to migrate all edge UI components to the unified canonical backend.

- `base44/functions/generateAIContent/entry.ts`
  - **Status:** ACTIVE LEGACY
  - **Callers:** `LessonResources.jsx`, `LessonBuilder.jsx`
  - **Notes:** Used for on-the-fly piece-meal generation (like flashcards or single questions) outside the main canonical pipeline.

## 3. Seeder / Scripts

- `scripts/seedKSSRLessons.js`
- `scripts/generateKSSRContent.js`
  - **Status:** SEEDER
  - **Notes:** These scripts are used for database seeding. They depend on older local generation logics or legacy endpoints. They need to be migrated to use `generateModularLessonContent` or deprecated entirely if dynamic generation eliminates the need for hardcoded seeds.

## Recommendation

We recommend keeping the **Active Legacy** files intact until their specific UI callers (e.g., `LessonBuilder`, `AIGenerationPanel`) are refactored in a future phase. `saveGeneratedLesson` should be deleted after final architectural sign-off verifies it is no longer required.
