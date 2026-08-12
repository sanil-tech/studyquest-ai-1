# PHASE 4A: MIGRATION GAPS & RECOMMENDATIONS

This document identifies architectural gaps between current assessment implementations and the canonical target architecture, providing safe, non-breaking recommendations for future phases.

---

## 1. IDENTIFIED ARCHITECTURAL GAPS

### Gap 1: Standalone Quiz Generation Legacy Callers
* **Current State**: Some legacy views (`TopicMasteryPlayer.jsx`, prototype diagnostic flows) call `generateAssessment` in `src/services/assessmentEngine.js` which reads hardcoded JSON templates.
* **Target Architecture**: All quizzes should be resolved from `QuestionBank` via `getLearningPackage` or `Assessment` entity queries.
* **Impact**: Low risk. `submitAssessment` function already accepts `assessment_id` and checks `QuestionBank` first.

### Gap 2: Dual Question Storage (`QuestionOption` entity vs `options_json` string)
* **Current State**: `QuestionBank` stores inline `options_json` string, while `QuestionOption` entity stores separate rows.
* **Target Architecture**: `getLearningPackage` handles both seamlessly by parsing `options_json` if `QuestionOption` rows are absent.
* **Impact**: Zero runtime breakage. Dual compatibility is already fully supported in `getLearningPackage`.

### Gap 3: `QuestionOption` Correctness Field Representation
* **Current State**: `QuestionOption.jsonc` entity schema does not contain an `is_correct` field; correctness is evaluated via `QuestionBank.correct_answer` or `options_json`.
* **Target Architecture**: Correctness remains evaluated strictly on server side.
* **Impact**: Security-positive. Client cannot view correctness attributes on `QuestionOption` table reads.

---

## 2. RECOMMENDATIONS FOR PHASE 4B (IF EXECUTED)

1. **Keep `QuestionBank` & `QuestionOption` Unchanged**: Both entities are already fully compatible with Content Library and `LessonVersion` snapshot compilation.
2. **Preserve `submitAssessment` Server Authoritative Security**: Keep SHA-256 idempotency hashing, anti-farming reward settlement, and server-side grading intact.
3. **No Migration of Immutable Past `QuizAttempt` Records**: Historical attempts should remain untouched to preserve student progress integrity.
