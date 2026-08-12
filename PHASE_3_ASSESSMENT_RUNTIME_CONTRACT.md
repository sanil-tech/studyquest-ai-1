# PHASE 3A: ASSESSMENT RUNTIME CONTRACT

This document defines the strict API data exchange contract between the student frontend runtime and the Base44 backend services for assessment fetching and evaluation.

---

## 1. ASSESSMENT FETCH CONTRACT (`getLearningPackage` / `getAssessment`)

### Request Payload (Frontend → Backend)

```json
{
  "assessment_id": "asm_math_y4_001",
  "lesson_version_id": "ver_01h8x92k3m",
  "topic_id": "top_pecahan_y4",
  "preview": false
}
```

### Response Payload (Backend → Frontend)

> [!IMPORTANT]
> **SECURITY REQUIREMENT**: The response MUST NOT contain `correct_answer`, `is_correct`, `correct_option_id`, or `correct_index`.

```json
{
  "success": true,
  "package_type": "COMPLETE_LEARNING_PACKAGE",
  "curriculum_context": {
    "subject_name": "Matematik",
    "topic_name": "Pecahan",
    "form_level": "Tahun 4",
    "learning_standard_code": "7.1.1"
  },
  "assessments": [
    {
      "id": "asm_math_y4_001",
      "title": "Penilaian Minda: Penambahan Pecahan",
      "assessment_type": "PRACTICE",
      "time_limit_minutes": 15,
      "passing_score": 70,
      "reward_xp": 50,
      "reward_coins": 10,
      "questions": [
        {
          "id": "qb_q101",
          "learning_standard_id": "ls_7_1_1",
          "question_text": "Hitung 3/8 + 2/8.",
          "question_type": "MCQ",
          "question_image_url": null,
          "difficulty": "medium",
          "cognitive_level": "apply",
          "options": [
            { "id": "opt_a", "label": "A", "text": "5/8", "sort_order": 0 },
            { "id": "opt_b", "label": "B", "text": "5/16", "sort_order": 1 },
            { "id": "opt_c", "label": "C", "text": "6/8", "sort_order": 2 },
            { "id": "opt_d", "label": "D", "text": "1/8", "sort_order": 3 }
          ]
        }
      ]
    }
  ]
}
```

---

## 2. ASSESSMENT SUBMISSION CONTRACT (`submitAssessment`)

### Request Payload (Frontend → Backend)

```json
{
  "assessment_id": "asm_math_y4_001",
  "answers": [
    {
      "question_id": "qb_q101",
      "selected_option_id": "opt_a",
      "selected_option": "A",
      "text_answer": ""
    }
  ],
  "duration_seconds": 45,
  "adaptive_queue_id": "queue_991283"
}
```

### Response Payload (Backend → Frontend)

```json
{
  "success": true,
  "attempt_id": "att_88192301",
  "score": 100,
  "score_percentage": 100,
  "passed": true,
  "correct_count": 1,
  "total_questions": 1,
  "xp_earned": 50,
  "coins_earned": 10,
  "attempt_number": 1,
  "already_passed": false,
  "reward_status": "awarded",
  "reward_settled": true,
  "feedback": [
    {
      "question_id": "qb_q101",
      "result": "correct",
      "concept": "Penambahan Pecahan Sama Penyebut",
      "cognitive_level": "apply",
      "explanation": "Apabila menambah pecahan dengan penyebut yang sama, tambah pengangka sahaja (3 + 2 = 5). Penyebut kekal 8."
    }
  ],
  "mastery_update": {
    "change": "+10%",
    "previous_score": 60,
    "new_score": 70,
    "tp_before": "TP3",
    "tp_after": "TP4"
  },
  "detailed_results": [
    {
      "question_id": "qb_q101",
      "is_correct": true,
      "selected_option_id": "opt_a",
      "explanation": "Apabila menambah pecahan dengan penyebut yang sama, tambah pengangka sahaja."
    }
  ]
}
```

---

## 3. IDEMPOTENT DUPLICATE RESUBMISSION RESPONSE

If the student re-submits the exact same answers (matching SHA-256 submission hash):

```json
{
  "success": true,
  "is_duplicate": true,
  "message": "Penyerahan jawapan ini telah diproses sebelum ini.",
  "attempt_id": "att_88192301",
  "score": 100,
  "score_percentage": 100,
  "passed": true,
  "correct_count": 1,
  "total_questions": 1,
  "xp_earned": 0,
  "coins_earned": 0,
  "attempt_number": 1,
  "reward_settled": true
}
```

---

## 4. FIELD-LEVEL SECURITY & ACCESSIBILITY MATRIX

| Field Name | Exposed Before Submit? | Exposed After Submit? | Server-Authoritative? |
|---|---|---|---|
| `question_text` | **YES** | **YES** | YES |
| `options` (label & text) | **YES** | **YES** | YES |
| `options[].id` | **YES** | **YES** | YES |
| `difficulty` / `cognitive_level` | **YES** | **YES** | YES |
| `correct_answer` | ❌ **NO** | ❌ **NO** (Only explanation) | YES |
| `is_correct` per option | ❌ **NO** | ❌ **NO** | YES |
| `is_correct` per question | ❌ **NO** | **YES** (In `detailed_results`) | YES |
| `score` / `score_percentage` | ❌ **NO** | **YES** | YES |
| `xp_earned` / `coins_earned` | ❌ **NO** | **YES** | YES |
| `explanation` | ❌ **NO** | **YES** (In feedback) | YES |
