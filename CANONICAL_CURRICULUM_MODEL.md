# Phase 7B — Canonical Curriculum Model Architecture

**Date**: 2026-08-11  
**Project**: StudyQuest AI  

---

## 1. Canonical Hierarchy Architecture

```text
===================================================================
OFFICIAL KPM KSSR / KSSR SEMAKAN CURRICULUM IDENTITY (AUTHORITATIVE)
===================================================================

Subjek (Subject, e.g. Matematik)
   ↓
Tahun / Level (Grade Level, e.g. Tahun 1)
   ↓
Bidang Pembelajaran (Domain, e.g. Nombor dan Operasi)
   ↓
Standard Kandungan (SK Code & Official SK Title, e.g. SK 1.1 Kuantiti secara intuitif)
   ↓
Standard Pembelajaran (SP Code & Unabridged Official DSKP Text, e.g. SP 1.1.1)
   ↓
Standard Prestasi (TP 1 - TP 6 Assessment Rubrics & Performance Standards)


===================================================================
STUDYQUEST PEDAGOGICAL EXTENSIONS (FLEXIBLE LEARNER DISPLAY LAYERS)
===================================================================

Topic (Unit Theme Title, e.g. "Banyak dan Sedikit")
   ↓
Subtopic (Lesson Module Title, e.g. "Membandingkan Kuantiti")
   ↓
15-Block Pedagogical Model (Content Assets)
   ↓
Interactive Widgets & Adventure Quests
```

---

## 2. Binding Contracts & Rules

1. **Subordination Rule**: StudyQuest `Topic` and `Subtopic` names exist strictly as learner-facing display titles. They **must always remain subordinate** to the official `sp_code` and `sk_code`.
2. **Unabridged Text Preserved**: The canonical `learning_objective` and DSKP description store the **complete, exact official DSKP wording**. Display extensions may use `display_title` for shorter UI headers without modifying the underlying official text.
3. **Server-Enforced Curriculum Identity**: LLMs and clients receive validated curriculum identity from server resolvers. AI is strictly prohibited from inventing or mutating curriculum standards.
