# Phase 7A — Curriculum Gap Matrix

**Date**: 2026-08-10  
**Project**: StudyQuest AI  

---

## Itemized Curriculum Gap Matrix

| Level | Official DSKP Definition | Current StudyQuest State | Status | Gap Description | Risk Level |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Framework** | KSSR Semakan 2017 / KSSM | Supported in `CurriculumStandard` & `Curriculum` entities | ✅ COMPLIANT | None | Low |
| **Subject** | Subjek (e.g. Matematik, Sains, BM, English) | Defined in `Subject` entity & `dskpRegistry.js` | ✅ COMPLIANT | None | Low |
| **Year / Grade** | Tahun 1 - 6 / Tingkatan 1 - 5 | Defined in `Year` entity & `Level` entity | ⚠️ DUAL ATTRIBUTE | `Topic.form_level` deprecated in favor of `level_id` | Low |
| **Domain / Bidang** | Bidang Pembelajaran (e.g. Nombor & Operasi) | Stored as string in `bidang` field | ⚠️ UNSTRUCTURED | Missing dedicated `Domain` entity in database graph | Low |
| **Standard Kandungan (SK)** | SK Code (e.g. 1.1 Kuantiti secara intuitif) | Stored in `CurriculumStandard.standard_content_code` & `Subtopic.standard_kandungan` | ✅ COMPLIANT | SK titles in frontend registry are slightly paraphrased | Low |
| **Standard Pembelajaran (SP)** | SP Code (e.g. 1.1.1) | Stored in `CurriculumStandard.standard_learning_code` | ⚠️ PARTIAL Wording | SP titles in `dskpRegistry.js` truncate tail clause (e.g. "sama banyak atau tidak...") | Medium |
| **Standard Prestasi (TP)** | TP 1 to TP 6 Assessment Rubrics | Defined in `CurriculumStandard.tahapan_penguasaan` JSON | ✅ COMPLIANT | Needs full population across all 17 pilot SPs | Medium |
| **Topic / Unit Level** | Official DSKP Tajuk | Named "Banyak dan Sedikit" for SP 1.1.1 pilot | ℹ️ EXTENSION | Classified as StudyQuest Extension title, not official DSKP Tajuk | Low |
| **Subtopic / Lesson Level** | Sub-lesson pedagogical grouping | Named "Membandingkan Kuantiti" for SP 1.1.1 pilot | ℹ️ EXTENSION | Classified as StudyQuest Extension title | Low |
| **Taxonomy Storage** | Single Database Source of Truth | Split between `dskpRegistry.js` and Base44 database | ⚠️ DUPLICATION | Frontend components fallback to hardcoded `dskpRegistry.js` | Medium |

---

## Detailed Gap Analyses

### Gap 1: SP Description Truncation
- **Official Text**: `"1.1.1 Menyatakan kuantiti secara membandingkan banyak atau sedikit, sama banyak atau tidak sama banyak dan lebih atau kurang."`
- **StudyQuest `dskpRegistry.js` Text**: `"1.1.1 Menyatakan kuantiti secara membandingkan banyak atau sedikit"`
- **Impact**: AI prompt receives partial description. While concept remains accurate, full DSKP scope is omitted.

### Gap 2: Taxonomy Storage Duplication
- **Primary Canonical**: Base44 `CurriculumStandard` database entity.
- **Frontend Fallback**: Hardcoded JavaScript object `EXTENDED_DSKP_TAXONOMY` in `src/services/dskpRegistry.js`.
- **Impact**: Updating curriculum in backend DB does not automatically reflect in frontend services relying on `dskpRegistry.js`.
