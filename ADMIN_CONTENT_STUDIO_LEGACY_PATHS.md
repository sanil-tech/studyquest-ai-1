# Admin Content Studio Legacy Paths Inventory

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## 1. Repository Code Path Inventory

| Code Path / Service | File Location | Used By | Authority Level | Migration Status | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `generateContentAsset` | `base44/functions/generateContentAsset/entry.ts` | `AdminContentStudio.jsx` | **CANONICAL** | ✅ ACTIVE CANONICAL | Maintain |
| `approveContentAsset` | `base44/functions/approveContentAsset/entry.ts` | `AdminContentStudio.jsx` | **CANONICAL** | ✅ ACTIVE CANONICAL | Maintain |
| `assembleLessonFromApprovedAssets` | `base44/functions/assembleLessonFromApprovedAssets/entry.ts` | `AdminContentStudio.jsx` | **CANONICAL** | ✅ ACTIVE CANONICAL | Maintain |
| `publishLessonVersion` | `base44/functions/publishLessonVersion/entry.ts` | Base44 Admin API | **CANONICAL** | ✅ ACTIVE CANONICAL | Maintain |
| `blockPromptRegistry` | `base44/shared/blockPromptRegistry.ts` | `generateContentAsset` | **CANONICAL** | ✅ ACTIVE CANONICAL | Maintain |
| `generateModularLessonContent` | `base44/functions/generateModularLessonContent/entry.ts` | Legacy Monolithic Generator | Legacy Backend | ⚠️ ACTIVE LEGACY | Deprecate in favor of `generateContentAsset` |
| `generateKSSRContent.js` | `src/services/generateKSSRContent.js` | Legacy Frontend Generator | Client Generator | 🛑 DEAD CODE | Keep for backward compatibility, do not import |
| `aiContentEngine.js` | `src/services/aiContentEngine.js` | Legacy Client Prompt Builder | Client Generator | 🛑 DEAD CODE | Keep for backward compatibility, do not import |
| `aiContentFiller.js` | `src/services/aiContentFiller.js` | Legacy Filler | Client Generator | 🛑 DEAD CODE | Keep for backward compatibility, do not import |

---

## 2. Security & Bypass Audit

- **No Client AI Generation**: `AdminContentStudio.jsx` does not invoke client-side LLM APIs or prompt builders. All generation is executed via server endpoint `generateContentAsset`.
- **No Direct Approval Mutation**: Approval is executed strictly through server function `approveContentAsset`.
