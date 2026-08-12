# PHASE 3B: CONTENT GENERATION CONTRACT

This document defines the API specification, JSON schemas, inputs, and validation gates for generating individual, progressive content assets (`generateContentAsset`).

---

## 1. GENERATION API CONTRACT (`generateContentAsset`)

### Endpoint Specification
* **Function**: `base44/functions/generateContentAsset/entry.ts`
* **Invocation**: `base44.functions.invoke("generateContentAsset", payload)`
* **Authorization**: Admin-only (`authUser.role === "admin"`).

---

## 2. REQUEST PAYLOAD (Frontend → Backend)

```json
{
  "curriculum_context": {
    "subject_id": "subj_matematik",
    "subject_name": "Matematik",
    "year_level": "Tahun 4",
    "topic_id": "top_pecahan_y4",
    "topic_name": "Pecahan, Perpuluhan dan Peratus",
    "subtopic_name": "Penambahan Pecahan",
    "sp_code": "SP 1.1.1",
    "learning_objective": "Menambah dua pecahan wajar yang penyebutnya sama hingga 10."
  },
  "asset_type": "CONCEPT_CPA",
  "pedagogical_mode": "SENIOR",
  "target_difficulty": "medium"
}
```

### Supported `asset_type` Enums
- `LESSON_HOOK`
- `LESSON_OBJECTIVE`
- `CONCEPT_CPA`
- `WORKED_EXAMPLE`
- `GUIDED_PRACTICE`
- `INTERACTIVE_WIDGET`
- `INFOGRAPHIC_VISUAL`
- `VIDEO_SCRIPT`
- `FLASHCARD_DECK`
- `QUIZ_SET`
- `KEY_TAKEAWAY`

---

## 3. ASSET-SPECIFIC PROMPT & SCHEMA RULES

### Rule 1: Single-Purpose Execution
The AI prompt MUST generate **ONLY ONE** asset corresponding to `asset_type`. It MUST NOT generate unrelated lesson sections or entire 15-block packages.

### Rule 2: Structured JSON Output
The LLM call utilizes `Core.InvokeLLM` with `response_json_schema` enforcing exact property shapes per asset type.

---

## 4. ASSET PAYLOAD SCHEMAS

### A. `CONCEPT_CPA` Schema
```json
{
  "title": "Konsep Penambahan Pecahan (CPA)",
  "concept_name": "Penambahan Pecahan Sama Penyebut",
  "cpa_explanation": {
    "concrete": "Gunakan 8 kepingan jubin warna. 3 jubin biru + 2 jubin merah = 5 jubin daripada 8 jubin (5/8).",
    "pictorial": "Gambar rajah bulatan dibahagikan kepada 8 bahagian saksama dengan 5 bahagian diwarnakan.",
    "abstract": "3/8 + 2/8 = (3 + 2)/8 = 5/8"
  },
  "key_formula": "Tambah pengangka sahaja apabila penyebut sama.",
  "voice_script": "Mari kita lihat cara menambah pecahan apabila penyebutnya sama..."
}
```

### B. `INTERACTIVE_WIDGET` Schema
```json
{
  "title": "Aktiviti Pemotong Pecahan",
  "widget_type": "fraction_slicer",
  "instructions": "Potong bulatan kepada 8 bahagian dan pilih 5 bahagian untuk menunjukkan 5/8.",
  "seed_data": {
    "target_fraction": "5/8",
    "shape_type": "circle"
  },
  "reward_xp": 25,
  "reward_coins": 10
}
```

### C. `QUIZ_SET` Schema
> [!IMPORTANT]
> **SECURITY RULE**: The generator creates `QuestionBank` and `QuestionOption` records server-side, storing `correct_answer` in the database. It DOES NOT return `correct_answer` in client-facing responses.

```json
{
  "title": "Kuiz Formatif: Penambahan Pecahan",
  "questions": [
    {
      "question_text": "Berapakah 2/7 + 4/7?",
      "difficulty": "medium",
      "cognitive_level": "apply",
      "tp_code": "TP3",
      "explanation": "Apabila penyebut sama (7), tambah pengangka 2 + 4 = 6. Jawapannya ialah 6/7.",
      "options": [
        { "label": "A", "text": "6/7", "is_correct": true },
        { "label": "B", "text": "6/14", "is_correct": false },
        { "label": "C", "text": "8/7", "is_correct": false },
        { "label": "D", "text": "2/7", "is_correct": false }
      ]
    }
  ]
}
```

---

## 5. RESPONSE PAYLOAD (Backend → Frontend)

```json
{
  "success": true,
  "asset_id": "blk_01h8x93a4b",
  "entity_type": "LessonBlock",
  "asset_type": "CONCEPT_CPA",
  "review_status": "UNDER_REVIEW",
  "quality_scorecard": {
    "score": 92,
    "status": "PASS",
    "checklist": {
      "dskp_aligned": true,
      "cpa_complete": true,
      "language_correct": true,
      "no_hallucinations": true
    },
    "feedback": "Kandungan memenuhi piawaian DSKP Tahun 4."
  },
  "asset_payload": {
    "title": "Konsep Penambahan Pecahan (CPA)",
    "concept_name": "Penambahan Pecahan Sama Penyebut",
    "cpa_explanation": { ... }
  },
  "curriculum_tags": {
    "subject_id": "subj_matematik",
    "topic_id": "top_pecahan_y4",
    "sp_code": "SP 1.1.1"
  }
}
```

---

## 6. QUALITY SHIELD GATE & SAVE PROTOCOL

Upon receiving LLM output, `generateContentAsset`:
1. Executes `evaluateAssetQuality(asset_payload, curriculum_context)` automated audit.
2. If `quality_score >= 80`, creates record in DB with `review_status = "UNDER_REVIEW"`.
3. Returns `asset_id` and payload to Admin Content Studio for live preview and final approval.
