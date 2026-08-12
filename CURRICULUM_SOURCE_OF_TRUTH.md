# Phase 7A — Curriculum Source of Truth Architecture

**Date**: 2026-08-10  
**Project**: StudyQuest AI  

---

## 1. Non-Negotiable Hierarchy Definition

```text
============================================================
OFFICIAL KPM CURRICULUM IDENTITY (IMMUTABLE & AUTHORITATIVE)
============================================================

Subject (Subjek, e.g. Matematik)
   ↓
Year / Level (Tahun / Tingkatan, e.g. Tahun 1)
   ↓
Domain / Bidang Pembelajaran (e.g. Nombor dan Operasi)
   ↓
Standard Kandungan (SK Code & Title, e.g. 1.1 Kuantiti secara intuitif)
   ↓
Standard Pembelajaran (SP Code & Full DSKP Wording, e.g. 1.1.1)
   ↓
Standard Prestasi (TP 1 - TP 6 Assessment Rubrics)


============================================================
STUDYQUEST PEDAGOGICAL EXTENSIONS (FLEXIBLE DISPLAY LAYERS)
============================================================

Topic (Unit Title / Theme, e.g. "Banyak dan Sedikit")
   ↓
Subtopic (Lesson Title, e.g. "Membandingkan Kuantiti")
   ↓
15-Block Pedagogical Model (Content Assets)
   ↓
Interactive Widgets & Adventure Missions
```

---

## 2. Canonical Identity Rules

1. **Official KPM DSKP Authority**:
   - Official DSKP codes (`sp_code`, `sk_code`), official wording, and TP definitions belong **exclusively** to the Official Curriculum Identity.
   - AI generators and frontend components **must never** modify or re-interpret official SP codes or official wording.

2. **StudyQuest Extension Boundaries**:
   - `Topic` and `Subtopic` titles in StudyQuest represent learner-friendly theme titles and lesson names designed to engage primary school students.
   - Every `Subtopic` **must be explicitly bound** to a verified `sp_code` from the `CurriculumStandard` database entity.

3. **Immutability Throughout Generation Pipeline**:
   ```text
   Validated Curriculum Standard (DB)
           ↓
   Server Function (generateContentAsset)
           ↓
   Macro Prompt Registry (blockPromptRegistry.ts)
           ↓
   Block Generation & Quality Shield
           ↓
   Content Asset (Content Library)
           ↓
   Lesson Assembly (LessonVersion Snapshot)
   ```
   Curriculum identity tags (`subject_id`, `year_level`, `sp_code`, `sk_code`) remain strictly immutable throughout every step of the generation and assembly pipeline.

---

## 3. Database Schema Mapping Guidelines

- **Primary Canonical Model**: `CurriculumStandard.jsonc` entity in Base44.
- **Fields**:
  - `subject`: String (e.g., "Matematik")
  - `curriculum_type`: Enum ("KSSR_SEMAKAN", "KSSM")
  - `education_level`: Enum ("PRIMARY", "SECONDARY")
  - `year_level`: String (e.g., "Tahun 1")
  - `topic`: String (Official Tajuk)
  - `standard_content_code`: String (e.g., "1.1")
  - `standard_learning_code`: String (e.g., "1.1.1")
  - `learning_objective`: String (Full official DSKP wording)
  - `tahapan_penguasaan`: JSON string (TP1-TP6 rubrics)
