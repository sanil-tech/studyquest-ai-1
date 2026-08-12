# Phase 7C-0 — Admin Content Studio Workflow Compatibility Audit Report

**Date**: 2026-08-11  
**Project**: StudyQuest AI  
**Target Component**: `src/components/AdminContentStudio.jsx`  
**Audit Type**: Strictly Read-Only Forensic Architecture Audit  

---

## 1. Executive Summary

A comprehensive forensic audit of `src/components/AdminContentStudio.jsx` was conducted to evaluate its readiness and compatibility for the canonical **15-Block Topic-First Curriculum Content Production Pipeline** (Phase 6–7B). The audit revealed that while backend endpoints (`generateContentAsset`, `approveContentAsset`, `assembleLessonFromApprovedAssets`) enforce 100% server authority and security, the current UI layout presents significant usability, workflow clarity, and scalability bottlenecks when scaling production across multiple topics and SPs.

---

## 2. Answers to the 20 Audit Questions

### Audit Question 1: Workflow Progression
- **Current Flow**: `CURRICULUM SELECTION` → `ASSET SELECTION (12 asset keys)` → `GENERATE / APPROVE` → `ASSEMBLE` → `PREVIEW`.
- **Deviation**: The current UI presents a 12-type asset panel instead of the canonical 15-block production journey. `LESSON_HOOK` maps internally to `STORY_HOOK`, `CONCEPT` maps to `CONCEPT_CPA`, etc.

### Audit Question 2: Canonical Curriculum Selection
- **Status**: ✅ **PASS WITH ADAPTER**. Curriculum selection relies on `dskpRegistry.js` taxonomy selectors (`getTaxonomySubjects`, `getTaxonomyYears`, `getTaxonomyTopics`, `getTaxonomySKs`, `getTaxonomySPs`). IDs (`topicId`, `subtopicId`) are derived deterministically using slugification.

### Audit Question 3: Active SP Visibility
- **Status**: ⚠️ **PARTIAL**. The selected `spCode` is displayed in dropdowns and asset card headers. However, there is no persistent pinned header showing the complete curriculum breadcrumb (`Subject > Year > Domain > Topic > Subtopic > SP`) while scrolling through assets.

### Audit Question 4: One Request = One Asset Invariant
- **Status**: ✅ **ENFORCED**. Clicking "⚡ Jana Aset Ini Dengan AI" or "Jana Aset Seterusnya" triggers `generateContentAsset` for exactly ONE target asset type. No client-side batching or hidden automatic generation exists.

### Audit Question 5: 15-Block Journey Representation
- **Status**: ⚠️ **MAPPED TO 12 ASSET KEYS**. The UI displays 12 `CANONICAL_ASSET_TYPES` keys rather than explicitly showing the 15 canonical block types. For example, `MIND_MAP`, `INFOGRAPHIC`, `AUDIO_HOOK`, `MATCHING_GAME`, and `INTERACTIVE_GAME` are grouped under `INTERACTIVE` or `CONCEPT`.

### Audit Question 6: Status Distinction & Server State
- **Status**: ✅ **PASS**. The UI computes `assetCoverageMap` using `getAssetCoverageState(records)` from `@/lib/contentAssetContract`. Statuses (`MISSING`, `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `PUBLISHED`, `REJECTED`) strictly reflect DB record fields.

### Audit Question 7: Rejection Workflow
- **Status**: ✅ **PASS**. `handleRejectSingleAsset` invokes `approveContentAsset` with `{ action: "reject", rejection_reason }`. Approved assets cannot be overwritten by client-side editing.

### Audit Question 8: Regeneration & Versioning
- **Status**: ✅ **PASS**. Clicking "Cipta Deraf Versi Baharu" or "Jana Semula AI" calls `generateContentAsset`, creating a new DRAFT asset version without mutating or deleting existing APPROVED records.

### Audit Question 9: Quality Shield Evaluation
- **Status**: ✅ **PASS**. AI generation returns `quality_score`. Content defaults to DRAFT status and MUST be manually reviewed and approved by an admin before being marked `APPROVED`.

### Audit Question 10: Assembly Readiness Condition
- **Status**: ⚠️ **SUBSET CHECK**. `isReadyForAssembly` currently checks if `["LESSON_HOOK", "CONCEPT", "WORKED_EXAMPLE"]` are approved, rather than strictly enforcing `15/15 APPROVED`.

### Audit Question 11: Security & Bypass Prevention
- **Status**: ✅ **ENFORCED**.
  - `Generate → Publish`: Blocked (Generation saves DRAFT).
  - `Generate → Auto Approve`: Blocked (`sanitizeAiGeneratedAsset` strips approved status).
  - `Client → Fake Quality Score / Fake Approval`: Blocked (Backend endpoints validate authentication and calculate metrics).

### Audit Question 12: Topic-First Production Usability
- **Status**: ⚠️ **MANUAL NAVIGATION**. Admin must manually change dropdowns to switch between SPs. There is no automated "Next SP" queue or Topic completion dashboard.

### Audit Question 13: Production at Scale
- **Status**: 🛑 **SCALABILITY BOTTLENECK**. Managing 10+ topics × 25 SPs × 15 blocks = 3,750 assets in the current single-page layout causes excessive scrolling, lack of search/filtering across SPs, and inability to view high-level topic progress.

### Audit Question 14: Curriculum Coverage Obviousness
- **Status**: ⚠️ **LOCAL TO SP ONLY**. The coverage panel displays the 12 asset states for the *currently selected SP*, but does not show overall Topic-level or Subject-level coverage across all 25 SPs.

### Audit Question 15: Data Entity Separation
- **Status**: ✅ **ENFORCED**. `CurriculumStandard` (DB) → `LessonContent` / `LessonBlock` (Content Library) → `assembleLessonFromApprovedAssets` → `LessonVersion` (Snapshot).

### Audit Question 16: Legacy Code References
- **Status**: Legacy backend functions (`generateModularLessonContent`) and client filler services (`aiContentEngine`) exist in the repository but are NOT imported or called by `AdminContentStudio.jsx`.

### Audit Question 17: State Architecture Audit
- **Status**: State is clean but contains derived ID calculations (`topicId`, `subtopicId`) that should be cleanly provided by taxonomy resolvers.

### Audit Question 18: End-to-End Producer UX Walkthrough
- **Status**: The flow works end-to-end but feels fragmented due to 12 asset key grouping vs 15 block types and lack of sequential block step guidance.

### Audit Question 19: Responsive Layout Architecture
- **Status**: Two-column layout (`lg:grid-cols-12`) is functionally sound but becomes cramped when displaying live preview and 12 asset cards simultaneously.

### Audit Question 20: Redesign Categorization (GREEN / YELLOW / RED / BLACK)
- **GREEN (Keep)**: Backend API integrations (`generateContentAsset`, `approveContentAsset`, `assembleLessonFromApprovedAssets`), `getAssetCoverageState` calculator, live `UniversalLessonPreview` integration.
- **YELLOW (Restructure)**: Two-column layout, SP dropdown selectors, asset status badges.
- **RED (Replace)**: 12-key asset list (replace with 15-Block Canonical Board), partial assembly gate (`3/3` -> replace with `15/15 APPROVED`).
- **BLACK (Remove)**: Legacy unneeded state fallbacks and inline prompt mocks.
