# Strategi Penjanaan Kandungan Pelajaran KSSR — StudyQuest AI

> **Status:** Disimpan untuk pelaksanaan kemudian (2026-08-28)
> **Konteks:** Audit kerangka pembelajaran pelajar + cadangan strategi penjanaan sejajar DSKP

---

## Audit Kerangka Pembelajaran Pelajar

### Dua Kerangka Render (Perpecahan)
| Kerangka | Fail | Block Types | Penggunaan |
|---|---|---|---|
| LessonShellRenderer (v2.0) | `LessonShellRenderer.jsx` | 8 kanonikal | Lesson v2.0 (generateModularLessonContent) |
| BlockRenderer (legacy) | `BlockRenderer.jsx` | ~30+ jenis (banyak alias) | Lesson lama & standalone |

### 5 Peringkat Pedagogi (LessonShellRenderer)
```
Stage 1: Engagement     → STORY_HOOK, LEARNING_OBJECTIVE
Stage 2: Concept Learning → CONCEPT_CPA, WORKED_EXAMPLE
Stage 3: Practice Arena   → INTERACTIVE_PRACTICE, KNOWLEDGE_CHECK
Stage 4: Memory Anchor    → KEY_TAKEAWAY
Stage 5: Checkpoint       → MISSION_COMPLETE
```

### Sumber Kurikulum DSKP
`officialCurriculumTaxonomy.json`:
```
Curriculum → Level → Subject → Domain → Topic → Subtopic → Standard Learning (SK + SP)
```

---

## Strategi Penjanaan (8 Langkah)

### 1. Penyelarasan Block Type — 8 Kanonikal (bukan 15)
| # | Peringkat | Block Type (Render) | Asset Type (Jana) | Kontrak Pedagogi |
|---|---|---|---|---|
| 1 | Engagement | STORY_HOOK | LESSON_HOOK | Naratif 1-3 min, soalan curiousity |
| 2 | Engagement | LEARNING_OBJECTIVE | LESSON_OBJECTIVE | "Di akhir pelajaran..." |
| 3 | Concept | CONCEPT_CPA | CONCEPT | CPA: Concrete→Pictorial→Abstract |
| 4 | Concept | WORKED_EXAMPLE | WORKED_EXAMPLE | Langkah + kesilapan lazim |
| 5 | Practice | INTERACTIVE_PRACTICE | GUIDED_PRACTICE | Widget (drag/match/sentence) |
| 6 | Practice | KNOWLEDGE_CHECK | QUIZ_QUESTION | 2-3 MCQ + distractor + explanation |
| 7 | Memory | KEY_TAKEAWAY | REFLECTION | 3-5 point kunci |
| 8 | Checkpoint | MISSION_COMPLETE | auto-generated | Ringkasan + ganjaran |

**Aset tambahan** disokong dalam blok (bukan entiti tersendiri):
- FLASHCARD → dalam KEY_TAKEAWAY / INTERACTIVE_PRACTICE
- VIDEO → dalam CONCEPT_CPA sebagai media_url
- MIND_MAP → dalam KEY_TAKEAWAY sebagai visual
- INFOGRAPHIC → dalam CONCEPT_CPA sebagai image_url

### 2. Urutan Penjanaan Mengikut Peringkat (Bukan Random)
```
Gate 1: Engagement (2 blok) → STORY_HOOK + LEARNING_OBJECTIVE
Gate 2: Concept (2 blok)    → CONCEPT_CPA + WORKED_EXAMPLE
Gate 3: Practice (2 blok)  → INTERACTIVE_PRACTICE + KNOWLEDGE_CHECK
Gate 4: Memory (1 blok)     → KEY_TAKEAWAY
Gate 5: Checkpoint (auto)   → MISSION_COMPLETE
```

### 3. Validasi DSKP Pelayan (Server-Authoritative)
1. Ambil SP code dari request (e.g. "1.1.1")
2. Cari dalam registry → dapatkan title rasmi DSKP
3. Masukkan title rasmi ke dalam prompt LLM
4. LLM diarahkan: "Kandungan MESTI menjawab SP ini: {title}"
5. Selepas janaan, semak kandungan mengandungi kata kunci dari SP title

### 4. Kontrak Output JSON per Blok (Schema Enforcement)
Setiap blok mempunyai `response_json_schema` ketat. Contoh CONCEPT_CPA:
```json
{
  "title": "string",
  "concrete": { "description": "string", "visual_emoji": "string" },
  "pictorial": { "description": "string", "image_prompt": "string" },
  "abstract": { "definition": "string", "formula": "string" },
  "analogy": "string"
}
```

### 5. Personalisasi `{{nama}}` pada Penjanaan
Prompt LLM: "Gunakan `{{nama}}` sebagai placeholder untuk nama pelajar."
Render-time: `personalize()` menggantikan `{{nama}}` dengan nama sebenar.

### 6. Assembly Gate 8/8 (bukan 15/15)
```
Engagement: 2/2 ✓
Concept:    2/2 ✓
Practice:   2/2 ✓
Memory:     1/1 ✓
Checkpoint: auto ✓
Total: 8/8 → ASSEMBLE READY
```

### 7. Tier Liputan Kurikulum
| Tier | Skop | Aset Dijana |
|---|---|---|
| Tier 1 (Pilot) | 5 SP teras Matematik Tahun 1 | 40 aset |
| Tier 2 (Core) | 15 SP baki Matematik Tahun 1 | 120 aset |
| Tier 3 (Expand) | Sains + Bahasa Melayu Tahun 1 | ~200 aset |

### 8. Pembersihan Data Satu Kali
1. Standarkan `sp_code` → format `"1.1.1"` sahaja
2. Tetapkan `review_status` untuk 30 blok unknown
3. Buang/jana semula 9 blok payload kosong
4. Migrasi blok lama ke 8 jenis kanonikal
5. Bersara `generateAIContent` (paip lama ke AIExplanation/CommonMistake/TeacherGuide)

### 9. Kitaran Kualiti Tiga-Lapis
```
Lapis 1: AI Generation → InvokeLLM + blockPromptRegistry + DSKP SP validation
Lapis 2: Auto-Quality Shield → skor ≥ 75, tiada placeholder, kandungan ≥ 20 char
Lapis 3: Manual Admin Approval → preview pelajar, luluskan/tolak
```

---

## Pelan Tindakan
| Langkah | Tindakan | Tempoh |
|---|---|---|
| 1 | Kunci `generateContentAsset` kepada 8 block type LessonShellRenderer | Segera |
| 2 | Standarkan `sp_code` & isi `review_status` | 1 hari |
| 3 | Baiki 9 blok payload kosong | 1 hari |
| 4 | Ubah assembly gate 15/15 → 8/8 | 0.5 hari |
| 5 | Tambah validasi SP DSKP dalam backend | 1 hari |
| 6 | Mulakan Pilot Tier 1: 5 SP × 8 blok = 40 aset | 1-2 minggu |
| 7 | Bersara `generateAIContent` & entiti pertindihan | Selepas Pilot |