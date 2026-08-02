# StudyQuest Diagnostic Assessment Architecture

The Diagnostic Assessment Engine is the official entry point for any new student joining StudyQuest. Rather than assuming mastery based on a student's registered age/grade, this engine evaluates their actual capabilities and safely populates the Mastery Engine to construct a highly personalized learning path.

## 1. Architecture Flow

```mermaid
graph TD
    A[Student Registration] --> B[Diagnostic Engine]
    B -->|Fetches Tests| C[diagnosticTemplates.json]
    B -->|Records Answers| D[Session State]
    D -->|submitAnswer()| B
    B -->|Calculates Mastery| E[Mastery Engine]
    E --> F[Resource Library]
    B -->|generateAssessmentReport()| G[Diagnostic Report]
    G --> H[Personalized Learning Path]
```

## 2. Data Model (`diagnosticTemplates.json`)

The test bank contains carefully constructed assessments tied strictly to SP (Standard Pembelajaran) codes.

- **Assessment Meta**: `id`, `curriculum`, `subject`, `year_level`, `passing_score`.
- **Question Schema**: Supports normal MCQs and full interactive widgets.
  - `type`: `MULTIPLE_CHOICE` | `INTERACTIVE_WIDGET`
  - `widget_type`: e.g., `base_ten_blocks`, `sentence_builder`
  - `sp_code`: The exact SP being tested.
  - `correct_answer`: Deterministic target state for validation.

## 3. Service API (`diagnosticAssessmentService.js`)

A decoupled, stateless (beyond active sessions) service bridging evaluations to the Mastery Engine.

### Session Lifecycle
- `createDiagnosticAssessment(studentId, curriculum, subject, yearLevel)`: Initializes tracking for a new test.
- `generateAssessment(assessmentId)`: Fetches the payload.
- `getQuestions(assessmentId)`: Extracts the questions array.
- `submitAnswer(sessionId, questionId, answer, timeSpent)`: Records the raw answer attempt.

### Evaluation & Sync
- `calculateScore(sessionId)`: Simple overall percentage.
- `calculateMastery(sessionId)`: Groups performance by SP code to evaluate precise topic mastery.
- `updateMasteryEngine(sessionId)`: The critical bridge function. Translates the diagnostic attempts directly into the `Mastery Engine`, populating the student's global progress tree safely.

### Reporting & Pathing
- `recommendRevision(masteryMap)`: Detects weak SPs and fetches prerequisites from the Resource Library.
- `recommendNextSP(masteryMap)`: Detects strong SPs and fetches logical progression steps.
- `generateAssessmentReport(sessionId)`: Compiles all data into a dashboard-ready JSON object.
- `generateLearningPath(sessionId)`: Outputs an ordered array of SP codes (revisions first, then next-steps).

## 4. Example Usage

```javascript
import { 
  createDiagnosticAssessment, 
  submitAnswer, 
  updateMasteryEngine, 
  generateAssessmentReport,
  generateLearningPath
} from '@/services/diagnosticAssessmentService';

// 1. A new student joins Tahun 1 Matematik
const session = createDiagnosticAssessment('stud_789', 'KSSR_SEMAKAN', 'Matematik', 'Tahun 1');

// 2. Student takes the test
submitAnswer(session.sessionId, 'q_mat_141_01', '40', 15); // Correct
submitAnswer(session.sessionId, 'q_mat_141_02', '{"puluh":3,"sa":2}', 45); // Correct

// 3. Test completes. Sync data globally!
updateMasteryEngine(session.sessionId);

// 4. Generate the dashboard report
const report = generateAssessmentReport(session.sessionId);
/*
  {
    overallScore: 100,
    strongAreas: ["1.4.1"],
    weakAreas: [],
    recommendedNext: ["1.4.2", "1.5.1"],
    ...
  }
*/

// 5. Build their custom syllabus journey
const path = generateLearningPath(session.sessionId);
// Output: ["1.4.2", "1.5.1"] (Skipped 1.4.1 entirely because they proved mastery!)
```

## 5. Future Integration Points

The Diagnostic Assessment is the first step in total automation:
1. **Onboarding Flow**: This engine will be attached directly to the post-registration UI.
2. **AI Tutor**: If a student skips an entire year, the AI will reference the Diagnostic Report to know they learned it via placement, not via StudyQuest lessons.
3. **Recommendation Engine**: The `generateLearningPath()` output will be fed directly into the daily quest generation system.
