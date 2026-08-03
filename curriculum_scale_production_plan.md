# StudyQuest Curriculum Scale Production Plan (Phase 7)

**Date**: 2026-08-04  
**Status**: APPROVED FOR PLANNING  
**Target Systems**: StudyQuest Content Factory, Pedagogy Intelligence Layer, DSKP Taxonomy Engine  

---

## 1. Executive Summary

Following the 100% success rate of the **Phase 6.5 Pilot Validation** (Matematik Tahun 1: 17/17 SPs passed quality and authenticity gates), this plan establishes the roadmap for scaling the StudyQuest AI Content Factory across the full primary school curriculum (Years 1 to 6) for four core subjects: **Matematik, Sains, Bahasa Melayu, and English**.

---

## 2. KSSR Taxonomy Coverage Audit (`kssrTaxonomy.json`)

### Current Taxonomy State vs. Full National DSKP Scope

| Subject | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Year 6 | Total SP (Taxonomy) | Est. Full DSKP SP | Coverage % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Matematik** | 17 | 3 | 1 | 1 | 0 | 0 | **22** | ~180 | 12.2% |
| **Sains** | 2 | 0 | 0 | 0 | 0 | 0 | **2** | ~160 | 1.3% |
| **Bahasa Melayu** | 2 | 0 | 0 | 0 | 0 | 0 | **2** | ~190 | 1.1% |
| **English** | 1 | 0 | 0 | 0 | 0 | 0 | **1** | ~190 | 0.5% |
| **TOTALS** | **22** | **3** | **1** | **1** | **0** | **0** | **27** | **~720** | **3.8%** |

---

## 3. Workload & Generation Estimates

### 1. Lesson Package Volume
- **1 Standard Pembelajaran (SP)** = 1 Complete 9-Step Macro Journey Lesson Package.
- **Current Taxonomy Volume**: **27** Lesson Packages.
- **Full Scale Production Volume**: **~720** Lesson Packages.

### 2. AI Workload & Token Calculation
- **Package Architecture**: 9 Steps per package (including 4 Micro-CPA blocks, Mascot Dialogue, Interactive Widget Config, Flashcards, Mini Game, PBD Quiz TP1-TP6, Rewards).
- **Average Tokens per Package**: ~3,000 output tokens.
- **Current Workload (27 SPs)**: ~81,000 tokens (~1.5 minutes total execution).
- **Full Workload (~720 SPs)**: ~2.16 Million tokens (~35-45 minutes total batch processing time).

---

## 4. Missing Pedagogy Mappings Audit (`pedagogyMapping.json`)

Currently, `src/data/pedagogyMapping.json` only contains full mappings for **Matematik Tahun 1** (8 topics).

### Missing Mappings in Current Taxonomy (10 Topics):
1. **Matematik Tahun 2**: `Nombor hingga 1000`, `Tambah, Tolak, Darab dan Bahagi`, `Pecahan dan Perpuluhan`
2. **Matematik Tahun 3**: `Nombor hingga 10,000`
3. **Matematik Tahun 4**: `Nombor hingga 100,000`
4. **Bahasa Melayu Tahun 1**: `Mendengar dan Memahami`, `Membaca Ayat`
5. **English Tahun 1**: `Phonics and Greeting`
6. **Sains Tahun 1**: `Kemahiran Proses Sains`, `Manusia dan Deria`

### Required Actions Before Production Expansion:
Populate `pedagogyMapping.json` for all 24 Subject-Year combinations before launching AI generation for those tiers to ensure 100% pedagogical context injection.

---

## 5. Production Recommendations

### A. Subject & Grade Generation Order (Phased Rollout)

```
Phase 7A: STEM Core (Matematik & Sains Years 1-3)
      ↓
Phase 7B: Language Core (Bahasa Melayu & English Years 1-3)
      ↓
Phase 7C: Senior STEM (Matematik & Sains Years 4-6)
      ↓
Phase 7D: Senior Language (Bahasa Melayu & English Years 4-6)
```

1. **Phase 7A — Junior STEM (Tahun 1-3 Matematik & Sains)**
   - *Rationale*: Leverages existing Base Ten, Number Scale, Clock Face, and Balance Scale widget infrastructure.
2. **Phase 7B — Junior Language (Tahun 1-3 BM & English)**
   - *Rationale*: Introduces Sentence Builder, Phonics, and Vocabulary Flashcard widgets.
3. **Phase 7C — Senior STEM (Tahun 4-6 Matematik & Sains)**
   - *Rationale*: Shifts to SENIOR mode (KBAT problem solving, higher-order Bloom's taxonomy).
4. **Phase 7D — Senior Language (Tahun 4-6 BM & English)**
   - *Rationale*: Focuses on comprehension passages, grammar rules, and essay structuring.

---

### B. Batch Execution Strategy & Sizing
- **Recommended Batch Size**: **15 to 20 SPs per execution**.
- **Rationale**: Prevents API gateway timeouts, stays within LLM rate limits, and provides real-time progress bar feedback in `AdminContentStudio.jsx`.

---

### C. Content Review & Quality Control Workflow

```
1. Taxonomy Input ➔ 2. Content Factory Batch ➔ 3. Automated Quality Gate (≥80%)
                                                         ↓
6. Student Delivery 🏃 ⬅️ 5. Teacher Sign-off ⬅️ 4. AI Authenticity Gate (≥85%)
```

1. **Automated Batch Generation**: Runs in `DRAFT` status (`content_status: "READY_FOR_REVIEW"`).
2. **Dual-Gate Verification**:
   - Gate 1: `validateLessonQuality()` $\ge 80\%$.
   - Gate 2: `validateAIContentAuthenticity()` $\ge 85\%$.
3. **Admin Studio Review**: Teacher or Admin inspects generated 9-step packages and approves preview checklist.
4. **Publish Event**: Updates `content_status` to `PUBLISHED`.

---

### D. Data Persistence & Storage Strategy

1. **Local Data Layer**:
   - Maintain `kssrTaxonomy.json` and `pedagogyMapping.json` as version-controlled local JSON configurations.
2. **Entity Storage (`LessonVersion` & `LessonBlock`)**:
   - Store generated packages as `LessonVersion` records with child `LessonBlock` items.
3. **Caching & Query Indexing**:
   - Index lessons by `[subject, grade, topic, sk_code, sp_code]` to enable $O(1)$ query speeds on student dashboard rendering.

---

## 6. Implementation Checklist & Next Steps

- `[ ]` **Step 1**: Expand `kssrTaxonomy.json` to cover 100% of DSKP SPs for Years 1-6 across the 4 core subjects.
- `[ ]` **Step 2**: Expand `pedagogyMapping.json` for all 24 Subject-Year combinations.
- `[ ]` **Step 3**: Execute Phase 7A (Junior STEM Batch Production) via Admin Content Studio.
- `[ ]` **Step 4**: Perform Admin Review & One-Click Publish.
