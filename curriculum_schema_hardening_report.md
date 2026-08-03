# StudyQuest Curriculum Schema Hardening Audit Report (Phase 7.1)

**Date**: 2026-08-04  
**Audit Target**: `kssrTaxonomy.json` & `pedagogyMapping.json`  
**Scope**: Primary School Subjects — Mathematics, Science, Bahasa Melayu, English (Years 1 to 6)  
**Execution Constraint**: Audit & Planning Only (No source code modifications)  

---

## 1. Executive Summary

Prior to scaling the **StudyQuest AI Content Factory** from the Phase 6.5 pilot (17 SPs) to full national curriculum volume (**720+ Standard Pembelajaran**), a schema hardening audit was conducted to determine whether the existing JSON structure supports all subject domains.

### Key Finding:
While the current schema is **100% effective for Mathematics Years 1–3**, it lacks domain-specific metadata required for **Language subjects (Bahasa Melayu & English)** and **Science experiments**, as well as structured **PBD TP1–TP6 descriptors** and **KBAT problem-solving scaffolding**.

---

## 2. Comprehensive 6-Domain Audit Matrix

### Domain 1: Basic Curriculum Metadata & Identification
- **Current State**: Fields include `bidang`, `topic`, `sk_code`, `sk_title`, `sp_code`, `title`, `mode`, `bloom_level`, `prerequisites`, `default_widget_type`.
- **Gaps Identified**:
  - Lack of `subject_code` (e.g. `MAT_Y1`, `SAI_Y4`, `BM_Y2`, `ENG_Y6`) for global database indexing.
  - Lack of `kemahiran` / skill category (e.g. *Mendengar & Bertutur*, *Membaca*, *Menulis*, *Kemahiran Proses Sains*).
  - Missing `estimated_duration_minutes` for modular timetable allocation.
- **Severity**: 🟡 **MODERATE**

---

### Domain 2: Language Subject Requirements (Bahasa Melayu & English Years 1–6)
- **Current State**: Current schema assumes STEM-oriented numeric objectives.
- **Gaps Identified**:
  - **Reading / Comprehension Passages**: Language SPs require structured reference texts (`petikan_teks` / `reading_passage`).
  - **Vocabulary Lists**: Missing `target_vocabulary` / `kata_kunci` arrays for flashcard & spelling generation.
  - **Grammar Category Tagging**: Lacks `grammar_focus` (e.g., *Kata Nama Am, Kata Kerja, Past Tense, Prepositions*).
  - **Skill Domain**: Lacks explicit language skill classification (*Listening & Speaking*, *Reading*, *Writing*, *Language Arts*, *Grammar*).
- **Severity**: 🔴 **CRITICAL FOR LANGUAGES**

---

### Domain 3: Science Experiment & Process Requirements (Science Years 1–6)
- **Current State**: Lacks science-specific inquiry and experimental metadata.
- **Gaps Identified**:
  - **Scientific Process Skills (KPS)**: Lacks `science_process_skill` tagging (e.g., *Memerhati, Mengelas, Mengukur & Menggunakan Nombor, Membuat Hipotesis, Mengawal Pemboleh Ulah*).
  - **Experiment & Observation Setup**: Missing `experiment_config` (Hypothesis, Apparatus & Materials, Variables: Manipulated / Responding / Constant, Safety Precautions).
  - **Diagram & Model References**: Science topics require interactive diagrams (e.g., Water Cycle, Electric Circuits, Solar System, Human Digestive System).
- **Severity**: 🔴 **CRITICAL FOR SCIENCE**

---

### Domain 4: HOTS / KBAT Support (Years 1–6)
- **Current State**: Includes basic `bloom_level` (`REMEMBER`, `UNDERSTAND`, `APPLY`, `ANALYZE`).
- **Gaps Identified**:
  - Missing `kbat_type` taxonomy classification (*Menganalisis, Menilai, Mencipta*).
  - Lacks `kbat_scaffolding_steps` for multi-step reasoning in Year 4–6 SENIOR mode.
  - Lacks real-world scenario prompts for TP5/TP6 high-level mastery.
- **Severity**: 🟡 **MODERATE**

---

### Domain 5: Assessment Mapping (PBD TP1–TP6 Descriptors)
- **Current State**: Uses generic fallback target `PBD Target: TP3`.
- **Gaps Identified**:
  - Missing `pbd_rubric_descriptors`: Specific performance standard descriptors for Levels 1 through 6 directly extracted from official KPM DSKP documents.
- **Severity**: 🟡 **MODERATE**

---

### Domain 6: Widget Compatibility & Registry
- **Current Widgets**: `base_ten_blocks`, `number_scale`, `fraction_slicer`, `money_counter`, `clock_face`, `balance_scale`, `shape_sorter`, `piktograf_chart`.
- **Missing Widget Registrations**:
  - **Language Widgets Needed**: `sentence_builder` (susun ayat), `word_matching` (suai padan kata), `cloze_passage_fill` (isi tempat kosong), `spelling_bee`.
  - **Science Widgets Needed**: `science_lab_simulator` (litar elektrik, beker/silinder penyukat), `organ_system_explorer` (label anggota/organ), `lifecycle_sequencer` (kitaran hidup).
- **Severity**: 🔴 **CRITICAL FOR ENGAGEMENT**

---

## 3. Proposed Hardened Schema Specification

Before expanding `kssrTaxonomy.json` to 720+ SPs, the following expanded JSON schema is recommended:

```json
{
  "subject_code": "SAI_Y4",
  "subject": "Sains",
  "grade": "Tahun 4",
  "bidang": "Sains Hayat",
  "topic": "Proses Hidup Manusia",
  "sk_code": "2.1",
  "sk_title": "Pernafasan Manusia",
  "sp_code": "2.1.1",
  "title": "Mengenal pasti organ yang terlibat dalam proses pernafasan",
  "mode": "SENIOR",
  "bloom_level": "UNDERSTAND",
  "prerequisites": [],
  "skill_domain": "Kemahiran Proses Sains",
  "science_process_skill": ["Memerhati", "Making Inferences"],
  "language_metadata": null,
  "experiment_config": {
    "has_experiment": true,
    "apparatus": ["Model Paru-Paru", "Tiub Y", "Belon"],
    "variables": {
      "manipulated": "Pergerakan kepingan getah",
      "responding": "Saiz belon di dalam balang"
    }
  },
  "kbat_metadata": {
    "is_kbat": true,
    "kbat_type": "Menganalisis",
    "real_world_context": "Kesan merokok dan udara tercemar terhadap organ paru-paru"
  },
  "pbd_descriptors": {
    "TP1": "Label organ pernafasan",
    "TP3": "Menerangkan laluan udara semasa menarik dan menghembus nafas",
    "TP6": "Berkomunikasi tentang amalan menjaga kesihatan organ pernafasan"
  },
  "default_widget_type": "organ_system_explorer"
}
```

---

## 4. Final Recommendation & Decision

```text
FINAL DECISION: B. Schema requires improvement before expansion
```

### Rationale:
1. **Prevent Quality Regressions in Languages & Science**: Scaling to 720+ SPs using only the Math-centric schema will lead to generic language and science content lacking reading passages, grammar tags, and experiment process steps.
2. **Seamless AI Generation**: Hardening the schema first ensures `aiContentEngine.js` automatically receives complete metadata for ALL subjects without requiring prompt rewrites later.
3. **Widget Registry Alignment**: Hardening the schema allows defining language and science widget types upfront before batch production begins.
