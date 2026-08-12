# Phase 7C-0 — Admin Content Studio Redesign Requirements (Phase 7C-1 Roadmap)

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## 1. Functional Requirements for Phase 7C-1 UI Redesign

### Component 1: Curriculum Navigator
- **Canonical Dropdowns**: Subject → Year → Domain → Topic → Subtopic → SP.
- **Persistent Breadcrumb**: Pin active curriculum selection (`Matematik > Tahun 1 > Nombor & Operasi > Nombor hingga 100 > SP 1.1.1`) at top of workspace.
- **Coverage Indicators**: Display completion badge next to each SP in dropdown (e.g. `[15/15 APPROVED]`, `[7/15 DRAFT]`, `[0/15 NOT_STARTED]`).

### Component 2: 15-Block Production Board
- Display all 15 Canonical Block Types in sequential order:
  1. `LESSON_HOOK`
  2. `STORY_HOOK`
  3. `REAL_WORLD_CONTEXT`
  4. `CONCEPT`
  5. `WORKED_EXAMPLE`
  6. `GUIDED_PRACTICE`
  7. `CONCEPT_CARD`
  8. `MIND_MAP`
  9. `INFOGRAPHIC`
  10. `FLASHCARD_DECK`
  11. `MATCHING_GAME`
  12. `INTERACTIVE_GAME`
  13. `VIDEO_LESSON`
  14. `AUDIO_HOOK`
  15. `QUIZ_QUESTION`
- Show status badge, quality score, version count, and action buttons (`Generate`, `Preview`, `Approve`, `Reject`, `Regenerate`) for each block.

### Component 3: Asset Workspace & Live Preview
- **Single-Asset Workspace**: Focused panel for generating, evaluating Quality Shield metrics, reviewing voice script/markdown, and admin sign-off.
- **Live Simulator**: Embed `UniversalLessonPreview` to simulate student experience for selected block.

### Component 4: Topic Production Progress & Assembly Gate
- **Progress Counter**: Show `X / 15 Approved` progress bar.
- **Assembly Gate**: Enable "Penumpunan Pelajaran (Assemble)" button **only when 15/15 assets are APPROVED**.
- **Immutable Snapshot**: Display generated `LessonVersion` snapshot ID and trigger final full-lesson preview.

---

## 2. Architectural Guardrails
1. **Zero Client AI Prompting**: All AI generations MUST invoke server endpoint `generateContentAsset`.
2. **Server-Authoritative Approval**: Approvals and rejections MUST invoke `approveContentAsset`.
3. **No Automatic Publishing**: Generation, preview, and assembly MUST NEVER automatically publish lessons.
