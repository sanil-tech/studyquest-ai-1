# Phase 8B — Multi-SP Production Architecture

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## 1. Batch Production Overview

Phase 8B executes controlled multi-SP content generation across the canonical KSSR Matematik Tahun 1 curriculum using the 15-block macro prompt engine.

### Production Hierarchy & Gates
```text
Batch 1 Scope (3 SPs × 15 blocks = 45 assets)
      ↓
SP 1.1.1 (Golden Pilot Baseline — 15/15 Approved & Assembled)
SP 1.2.1 (Nilai Nombor — Menamai Nombor)
SP 1.2.2 (Nilai Nombor — Membandingkan Kuantiti)
      ↓
Macro Prompt v1.0 Generation per Block
      ↓
AI Quality Shield Evaluation (Scorecard Threshold ≥ 70)
      ↓
Server-Authoritative Admin Review & Approval
      ↓
15 / 15 Approval Gate Enforcement
      ↓
Immutable Snapshot Assembly (LessonVersion)
```

---

## 2. Invariants Certified in Batch 1

1. **Pre-flight Audit**: Verified 25 canonical SPs in `dskpRegistry.js` map to exact subject/year/topic/subtopic relations.
2. **One Request = One Asset**: Server-side `generateContentAsset` creates 1 discrete record per call.
3. **No Overwriting Approved Content**: Regeneration creates a new `v2` draft without mutating `v1` approved assets.
4. **Assembly Lock**: Assemblies with < 15 approved blocks return HTTP 422.
5. **No Auto-Publishing**: Snapshots remain in `draft` status until explicitly published.
