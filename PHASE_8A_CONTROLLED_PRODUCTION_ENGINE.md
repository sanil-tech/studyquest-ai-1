# Phase 8A — Controlled Curriculum Production Engine Architecture

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## 1. Architectural Overview

The **Controlled Curriculum Production Engine** establishes a production-grade workflow in `AdminContentStudio.jsx` designed to progressively manage and execute content asset production across all 25 Standard Pembelajaran (SPs) of Matematik Tahun 1 (375 total required assets).

### Core Pipeline Flow
```text
Curriculum Production Queue (25 Discoverable SPs)
      ↓
Select Target SP
      ↓
Load 15-Block Production Board
      ↓
Single / Batch Asset Generation (generateContentAsset)
      ↓
AI Quality Shield Evaluation (Scorecard ≥ 70)
      ↓
Human Admin Review (Approve / Reject / Regenerate)
      ↓
15 / 15 Approval Gate (Locked < 15, Ready = 15)
      ↓
Lesson Assembler (assembleLessonFromApprovedAssets)
      ↓
Immutable LessonVersion Snapshot (Status: Draft / Ready for Review)
      ↓
Deterministic Next-SP Navigation (Advance to Next SP)
```

---

## 2. Invariant Rules Enforced

1. **SP-First Production Model**: Production is strictly organized around individual SP nodes. Assets from different SPs cannot be mixed or assembled together.
2. **Dynamic Taxonomy Resolution**: Queue items are derived dynamically from `dskpRegistry.js` (`getTaxonomySPs`). No hardcoding of SP codes.
3. **1 Request = 1 Asset = 1 Block**: Each generation request targets exactly one block type with explicit curriculum metadata (`sp_code`, `topic_id`, `subtopic_id`).
4. **Immutable Approved Assets**: Approving an asset sets `review_status: "approved"`. Regenerating an asset creates a new `v2` draft without overwriting `v1` approved.
5. **Strict 15/15 Assembly Gate**: The backend assembler (`assembleLessonFromApprovedAssets`) locks assembly until all required block types are approved (returns 422 if unapproved).
6. **No Auto-Publishing**: Neither generation nor assembly automatically publishes content. Content snapshots remain in `draft` status until published via official gates.
