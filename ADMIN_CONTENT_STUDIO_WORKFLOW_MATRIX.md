# Admin Content Studio Workflow Matrix

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## Step-by-Step Workflow Alignment Matrix

| Workflow Step | Current UI Implementation | Backend Endpoint | Canonical? | Problem / Limitation | Recommendation |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **1. Curriculum Selection** | Dropdowns for Subject, Year, Topic, SK, SP | Base44 DB / `dskpRegistry.js` | ✅ YES | Lacks persistent breadcrumb and Topic-level progress overview | Add pinned Curriculum Breadcrumb & Topic Progress Header |
| **2. SP Selection** | Dropdown selection of SP code | Base44 DB / `dskpRegistry.js` | ✅ YES | Switching SP resets asset selection without prompt | Provide SP progress indicator and "Next SP" navigation |
| **3. Asset Type Selection** | List of 12 asset keys | `ASSET_ENTITY_MAP` | ⚠️ PARTIAL | Displays 12 keys rather than 15 canonical block types | Expand UI selector to 15 Canonical Block Types |
| **4. Asset Generation** | "⚡ Jana Aset Ini Dengan AI" button | `generateContentAsset` | ✅ YES | Single-asset button works well | Maintain server invocation |
| **5. Quality Evaluation** | "AI Quality Scorecard: Pass (85/100)" badge | Server Function Response | ✅ YES | Score is displayed after generation | Maintain score display |
| **6. Live Asset Preview** | `UniversalLessonPreview` panel | Client Component | ✅ YES | Single block preview works | Add full block sequence preview |
| **7. Admin Approval** | "Luluskan Aset Ini" button | `approveContentAsset` | ✅ YES | Server-authoritative status update | Maintain |
| **8. Admin Rejection** | "🛑 Aset Kandungan Ditolak" handler | `approveContentAsset` (`action: reject`) | ✅ YES | Rejection saves reason in DB | Maintain |
| **9. Regeneration** | "Cipta Deraf Versi Baharu" button | `generateContentAsset` | ✅ YES | Creates new version without deleting approved records | Maintain |
| **10. Coverage Tracking** | "Panel Liputan Aset Kandungan (12 Jenis)" | `getAssetCoverageState` | ⚠️ PARTIAL | Limited to 12 keys for currently selected SP | Show 15-block coverage board across SP |
| **11. Assembly Readiness** | `isReadyForAssembly` boolean | Computed State | ⚠️ PARTIAL | Checks 3 required blocks instead of 15/15 approved | Require 15/15 approved assets before assembly |
| **12. Lesson Assembly** | "Penumpunan Pelajaran (Assemble)" button | `assembleLessonFromApprovedAssets` | ✅ YES | Creates immutable `LessonVersion` snapshot | Maintain |
| **13. Final Review** | `UniversalLessonPreview` snapshot | Client Component | ✅ YES | Shows assembled lesson structure | Maintain |
| **14. Publishing Gate** | Controlled outside Studio | `publishLessonVersion` | ✅ YES | Studio cannot auto-publish lessons | Maintain explicit gating |
