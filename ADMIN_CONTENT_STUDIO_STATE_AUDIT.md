# Admin Content Studio State Architecture Audit

**Date**: 2026-08-11  
**Project**: StudyQuest AI  
**Target File**: `src/components/AdminContentStudio.jsx`  

---

## 1. Frontend State Variables Inventory

| State Variable | Initial Value | Category | Authority / Source | Duplication Risk | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `subject` | `"Matematik"` | `CURRICULUM STATE` | User Selection / DSKP Registry | Low | Keep, bind to canonical DB entity |
| `yearLevel` | `"Tahun 1"` | `CURRICULUM STATE` | User Selection / DSKP Registry | Low | Keep |
| `topic` | `"Nombor hingga 100"` | `CURRICULUM STATE` | User Selection / DSKP Registry | Low | Keep |
| `skCode` | `"1.1"` | `CURRICULUM STATE` | User Selection / DSKP Registry | Low | Keep |
| `spCode` | `"1.1.1"` | `CURRICULUM STATE` | User Selection / DSKP Registry | Low | Keep |
| `topicId` | Derived | `CURRICULUM STATE` | Slugification memo | Low | Derive from canonical Topic entity |
| `subtopicId` | Derived | `CURRICULUM STATE` | Slugification memo | Low | Derive from canonical Subtopic entity |
| `selectedAssetType` | `"LESSON_HOOK"` | `ASSET STATE` | User Click | Low | Expand to 15 Block Types |
| `dbAssets` | `{}` | `ASSET STATE` | Server DB Filter Queries | Low | Keep (Server Authoritative) |
| `loadingDb` | `false` | `ASSET STATE` | Network Status | None | Keep |
| `generatingAsset` | `false` | `ASSET STATE` | Network Status | None | Keep |
| `approvingAsset` | `false` | `APPROVAL STATE` | Network Status | None | Keep |
| `activePreviewPackage` | `null` | `PREVIEW STATE` | Derived from `currentSelectedAsset` | Low | Keep |
| `assemblingLesson` | `false` | `ASSEMBLY STATE` | Network Status | None | Keep |
| `assembledSnapshot` | `null` | `ASSEMBLY STATE` | Server Response (`assembleLesson`) | Low | Keep |

---

## 2. Server Authority Verification

- **Curriculum Resolution**: Frontend selects `sp_code` -> Server endpoints validate `sp_code` against canonical DSKP records before executing operations.
- **Approval Rights**: `handleApproveSingleAsset` and `handleRejectSingleAsset` require valid Admin session tokens and execute on server role.
- **Assembly Snapshot**: `handleAssembleLesson` queries DB for approved assets and creates immutable `LessonVersion` records server-side.
