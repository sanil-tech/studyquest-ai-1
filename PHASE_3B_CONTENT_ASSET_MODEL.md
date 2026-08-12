# PHASE 3B: CANONICAL CONTENT ASSET MODEL

This document defines the canonical entity roles, curriculum identity, versioning, and approval lifecycle for the progressive Content Library Architecture in StudyQuest.

---

## 1. CANONICAL CONTENT ASSET ROLES & REUSABILITY

The Content Library Architecture utilizes existing Base44 database entities, extending them with curriculum tags to enable asset-level reusability prior to lesson version compilation.

| Entity | Canonical Role | Reusable Asset? | Curriculum Tagged? | Versioned? | Approved Status? |
|---|---|:---:|:---:|:---:|:---:|
| `LessonBlock` | **Pedagogical Lesson Asset** (Hook, Objective, Concept, Worked Example, Key Takeaway) | **YES** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`review_status`) |
| `LessonContent` | **Supplementary Learning Asset** (Notes, Worksheets, TTS Audio, Video Script) | **YES** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`status`, `approved_by`) |
| `LessonMediaAsset` | **Visual Media Asset** (Infographic, Image, Diagram, Illustration, Chart) | **YES** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`status`, `approved_by`) |
| `LearningActivity` | **Interactive Widget Asset** (Matching, Sorting, Word Builder, Simulations, Puzzles) | **YES** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`status`, `approved_by`) |
| `Flashcard` | **Memory Anchor Asset** (Front/Back concept prompts, explanations) | **YES** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`status`, `approved_by`) |
| `QuestionBank` | **Assessment Question Asset** (MCQ, Short Answer, Fill-in-Blank items) | **YES** | **YES** (`topic_id`, `sp_code`, `tp_code`) | **YES** (`version_number`) | **YES** (`status`, `approved_by`) |
| `QuestionOption` | **Structured MCQ Option Asset** (Labels A, B, C, D) | **YES** | Indirect (via `question_id`) | Indirect | Indirect |
| `Assessment` | **Assessment Container** (Practice, Mastery, Exam metadata container) | **NO (Container)** | **YES** (`topic_id`, `subject_id`) | **YES** (`version_number`) | **YES** (`status`) |
| `LessonVersion` | **Lesson Snapshot Container** (Published container assembling approved assets) | **NO (Container)** | **YES** (`topic_id`, `sp_code`) | **YES** (`version_number`) | **YES** (`review_status`) |

---

## 2. ASSET vs CONTAINER DISTINCTION

To prevent the Content Library from deteriorating into monolithic JSON blobs, the architecture enforces a strict distinction between **Content Assets** and **Content Containers**:

```text
               ┌──────────────────────────────────────────────┐
               │              CONTENT CONTAINER               │
               │   (e.g., LessonVersion, Assessment Container) │
               └──────────────────────┬───────────────────────┘
                                      │  Assembles / Compiles
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              CONTENT LIBRARY                              │
│                                                                           │
│  [LessonBlock Asset]     [LessonMediaAsset]     [LearningActivity Asset]  │
│  - Type: CONCEPT         - Type: INFOGRAPHIC    - Type: MATCHING_CARDS    │
│  - SP: SP 1.1.1          - SP: SP 1.1.1         - SP: SP 1.1.1            │
│  - Status: APPROVED      - Status: APPROVED     - Status: APPROVED        │
│                                                                           │
│  [QuestionBank Asset]    [Flashcard Asset]      [LessonContent Asset]     │
│  - Type: MCQ             - Type: MEMORY_CARD    - Type: NOTES             │
│  - SP: SP 1.1.1          - SP: SP 1.1.1         - SP: SP 1.1.1            │
│  - Status: APPROVED      - Status: APPROVED     - Status: APPROVED        │
└───────────────────────────────────────────────────────────────────────────┘
```

* **Content Asset**: An independent, self-contained unit of learning material (e.g., a single Hook, a Concept explanation, an Infographic, an Interactive Widget, or a Quiz Question) bound to curriculum metadata (`subject_id`, `topic_id`, `sp_code`).
* **Content Container**: An immutable published snapshot (e.g., `LessonVersion` or `Assessment`) that references or compiles a set of approved Content Assets for student runtime delivery.

---

## 3. CURRICULUM IDENTITY & TAGGING SCHEMA

Every reusable Content Asset must be identifiable and queryable by its canonical Curriculum Identity.

### Mandatory Curriculum Tagging Fields

```text
Curriculum Identity = subject_id + year_level + topic_id + subtopic_id + sp_code
```

1. `subject_id` *(String, Foreign Key -> Subject)*: e.g., `"subj_matematik"`
2. `year_level` *(String)*: e.g., `"Tahun 4"`
3. `topic_id` *(String, Foreign Key -> Topic)*: e.g., `"top_pecahan"`
4. `subtopic_id` *(String, Optional Foreign Key -> Subtopic)*: e.g., `"sub_penambahan_pecahan"`
5. `sp_code` *(String, Standard Pembelajaran Code)*: e.g., `"SP 1.1.1"`
6. `learning_standard_id` *(String, Optional Foreign Key -> CurriculumStandard)*: e.g., `"std_01h8x9"`

### Canonical Lookup Strategy
When searching the Content Library for reusable assets, the lookup service queries:
```sql
WHERE topic_id = target_topic_id 
  AND sp_code = target_sp_code 
  AND review_status = 'APPROVED'
```

---

## 4. DETERMINISTIC CONTENT TYPE TAXONOMY

The architecture establishes a deterministic taxonomy mapping Content Types to DB Entities and UI Renderers:

| Content Type Enum | DB Entity | Rendering Component | Pedagogical Purpose |
|---|---|---|---|
| `LESSON_HOOK` | `LessonBlock` (`block_type: "STORY_HOOK"`) | `StoryHookBlock` | Real-world Malaysian scenario & mascot introduction (Induction). |
| `LESSON_OBJECTIVE` | `LessonBlock` (`block_type: "LEARNING_OBJECTIVE"`) | `LearningObjectiveBlock` | Explicit DSKP learning goals & success criteria. |
| `CONCEPT_CPA` | `LessonBlock` (`block_type: "CONCEPT_CPA"`) | `ConceptCPABlock` | Concrete-Pictorial-Abstract concept explanation. |
| `WORKED_EXAMPLE` | `LessonBlock` (`block_type: "WORKED_EXAMPLE"`) | `WorkedExampleBlock` | Step-by-step solved problem with hints. |
| `GUIDED_PRACTICE` | `LessonBlock` / `LearningActivity` | `InteractivePracticeBlock` | Interactive practice with instant mascot feedback. |
| `INTERACTIVE_WIDGET`| `LearningActivity` (`activity_type`) | `WidgetContainer` (`widgetRegistry.js`) | Hands-on math/language tool (`base_ten_blocks`, `sentence_builder`, etc.). |
| `INFOGRAPHIC_VISUAL`| `LessonMediaAsset` (`asset_type: "infographic"`) | `InfographicBlock` | Visual summary card with hotspots & key points. |
| `VIDEO_BRIEF` | `LessonContent` (`content_type: "video"`) | `VideoBlock` | Video briefing URL & voice script. |
| `FLASHCARD_DECK` | `Flashcard` (Grouped by `topic_id`) | `FlashcardDeckBlock` | Flip-card memory anchors for key terms. |
| `QUIZ_QUESTION` | `QuestionBank` + `QuestionOption` | `KnowledgeCheckBlock` / `QuizRunner` | Formative PBD quiz question mapping to TP levels. |
| `KEY_TAKEAWAY` | `LessonBlock` (`block_type: "KEY_TAKEAWAY"`) | `KeyTakeawayBlock` | Concise summary of core principles. |
| `MISSION_COMPLETE` | `LessonBlock` (`block_type: "MISSION_COMPLETE"`) | `MissionCompleteBlock` | Checkpoint summary, XP/Coin award, and transition. |

---

## 5. DETERMINISTIC ASSEMBLY SEQUENCE

AI **NEVER** determines the structure or order of a lesson. Ordering is strictly governed by the system-owned 8-Stage DSKP Sequence:

```text
Sequence Index 0: LESSON_HOOK          (Induction)
Sequence Index 1: LESSON_OBJECTIVE     (Objective)
Sequence Index 2: CONCEPT_CPA          (Concept)
Sequence Index 3: WORKED_EXAMPLE       (Example)
Sequence Index 4: GUIDED_PRACTICE      (Interactive Practice)
Sequence Index 5: QUIZ_QUESTION        (Formative Knowledge Check)
Sequence Index 6: KEY_TAKEAWAY         (Memory Anchor)
Sequence Index 7: MISSION_COMPLETE     (Checkpoint & Completion)
```

---

## 6. VERSIONING MODEL & IMMUTABLE PUBLISHED SNAPSHOTS

Assets in the Content Library undergo revision without corrupting published lessons:

```text
Content Library Asset (e.g. Concept Block for SP 1.1.1)
 ├── Version 1: APPROVED  ──► Used in Published LessonVersion #1 (IMMUTABLE)
 ├── Version 2: APPROVED  ──► Available for new assemblies
 └── Version 3: DRAFT     ──► Admin currently editing in Content Studio
```

* **Asset Revision**: Editing an approved asset creates a new record or increments `version_number` with `review_status = "draft"`.
* **Snapshot Immutability**: When a `LessonVersion` is published, it compiles/copies the approved asset IDs into an immutable snapshot. Future asset edits in the Content Library **DO NOT** alter previously published lessons.

---

## 7. APPROVAL MODEL & LIFECYCLE

All assets strictly follow a 5-stage approval lifecycle:

```text
[AI_GENERATED] ──► [DRAFT] ──► [UNDER_REVIEW] ──► [APPROVED] ──► [PUBLISHED]
                                                      │
                                                      └──► [ARCHIVED]
```

* `AI_GENERATED`: Fresh output from AI single-asset generator.
* `DRAFT`: Saved draft in Admin Content Studio; pending validation.
* `UNDER_REVIEW`: AI Quality Audit passed (>80 score); queued for admin review.
* `APPROVED`: Explicitly approved by admin (`approved_by`, `approved_at`). Reusable in Content Library.
* `PUBLISHED`: Compiled into an active published `LessonVersion` or `Assessment`.
* `ARCHIVED`: Soft-deleted or deprecated asset.

---

## 8. QUALITY GATE (AI AUDIT vs ADMIN APPROVAL)

The architecture distinguishes automated quality scoring from human approval:

```text
Generate Asset
      ↓
Automated AI Quality Audit (AIQualityScorecard)
      ↓
Score >= 80%? ───► YES ───► Set review_status = "UNDER_REVIEW"
      │
      NO ────────► Prompt Admin / AI Re-generate
      ↓
Admin Manual Preview & Verification (UniversalLessonPreview)
      ↓
Admin Clicks "Approve & Save to Library"
      ↓
Set review_status = "APPROVED", approved_by = Admin.ID, approved_at = NOW()
```

* **Rule**: AI Quality Audit validation (`quality_score`) is a prerequisite to enter `UNDER_REVIEW`, but **ONLY** explicit admin action can transition an asset to `APPROVED`.
