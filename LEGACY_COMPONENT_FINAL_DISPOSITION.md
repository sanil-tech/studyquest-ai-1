# STUDYQUEST AI — LEGACY COMPONENT FINAL DISPOSITION (PHASE 4C)

This document classifies all legacy content engines, helper services, and generation endpoints according to their current usage and future deprecation lifecycle.

---

## 1. COMPONENT CLASSIFICATION MATRIX

| Component / File Path | Callers & Usage | Production Status | Recommended Action |
| :--- | :--- | :---: | :--- |
| [`src/services/assessmentEngine.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/assessmentEngine.js) | Hardcoded mock template questions (`fraction_addition`, `number_comparison`). Not imported by student runtime. | **ACTIVE LEGACY** | Retained for prototype fallback. Safe to deprecate in future frontend cleanup phase. |
| [`src/services/diagnosticAssessmentService.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/diagnosticAssessmentService.js) | Used by `StudentOnboarding.jsx` & `studentJourneyService.js` for initial placement testing. | **MUST RETAIN** | Active production service powering student diagnostic onboarding flow. |
| [`src/services/aiContentEngine.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/src/services/aiContentEngine.js) | Used by `contentFactoryService.js`, `AIGenerationPanel.jsx`, `resourceLibraryService.js`, `lessonShellBuilder.js`. | **SAFE TO DEPRECATE** | Retain during architecture freeze. Migrate edge UI callers to `generateContentAsset` in future phase. |
| [`base44/functions/saveGeneratedLesson/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/saveGeneratedLesson/entry.ts) | Superseded by `generateModularLessonContent` and `assembleLessonFromApprovedAssets`. | **MIGRATION COMPATIBILITY** | Retained for backward compatibility. |
| [`base44/functions/generateLessonContent/entry.ts`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/base44/functions/generateLessonContent/entry.ts) | Replaced by `generateModularLessonContent` and `generateContentAsset`. | **DEAD CODE** | Deletion candidate. |
| [`scripts/generateKSSRContent.js`](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/scripts/generateKSSRContent.js) | Local CLI script for initial database seeding. | **TEST / SEED ONLY** | Retained for offline database seeding. |

---

## 2. POLICY ON LEGACY CODE REMOVAL

Per the Phase 4C architectural guidelines:
> **"Do NOT remove legacy code automatically. Only document the disposition."**

All active legacy and migration compatibility files listed above remain intact in the codebase to prevent regressions in legacy edge views until a future refactoring phase is explicitly scheduled.
