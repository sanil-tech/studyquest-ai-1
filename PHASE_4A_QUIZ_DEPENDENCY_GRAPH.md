# PHASE 4A: QUIZ & ASSESSMENT DEPENDENCY GRAPH

This document presents the complete component and data dependency graph for the assessment and quiz subsystem in StudyQuest AI.

---

## 1. CANONICAL PRODUCTION ARCHITECTURE GRAPH

```mermaid
graph TD
    subgraph ADMIN_CONTENT_PRODUCTION
        A1[Curriculum Identity: DSKP / SP Code] --> A2[generateContentAsset]
        A2 --> A3[(QuestionBank: draft)]
        A2 --> A4[(QuestionOption: draft)]
        A3 & A4 --> A5[approveContentAsset]
        A5 --> A6[(QuestionBank: approved)]
    end

    subgraph LESSON_ASSEMBLY_&_PUBLISHING
        A6 --> B1[assembleLessonFromApprovedAssets]
        B1 --> B2[(LessonVersion: snapshot draft)]
        B2 --> B3[publishLessonVersion]
        B3 --> B4[(Lesson: published_version_id)]
    end

    subgraph STUDENT_RUNTIME
        B4 --> C1[getLearningPackage API]
        C1 -->|Sanitized Payload: No Answer Keys| C2[QuizPage.jsx / LessonPage.jsx]
        C2 --> C3[QuizRunner.jsx]
        C3 -->|Submits answers JSON + SHA-256 Hash| C4[submitAssessment Function]
    end

    subgraph SERVER_SCORING_&_REWARDS
        C4 -->|Verify Correct Answers| D1[(QuestionBank DB)]
        C4 -->|Check Idempotency & Repeat Pass| D2[(QuizAttempt DB)]
        C4 -->|Update Balances| D3[(Wallet DB)]
        C4 -->|Update XP & Level| D4[(Progress DB)]
        C4 -->|Log Audit Trail| D5[(ActivityLog DB)]
        C4 -->|Update EWMA Mastery| D6[(StudentSkillProfile DB)]
        C4 -->|Return Score & XP/Coins| C5[QuizResult.jsx]
    end
```

---

## 2. LEGACY / PROTOTYPE COMPONENT DEPENDENCIES

```text
[Legacy Prototype Flow]
diagnosticAssessmentService.js / assessmentEngine.js
      │
      ▼
Client-Side Question Generator (Hardcoded questionTemplates.json)
      │
      ▼
TopicMasteryPlayer.jsx / DiagnosticAssessment.jsx
      │
      ▼
Local Component State Scoring (Deprecated in Canonical Production)
```

---

## 3. DEPENDENCY CLASSIFICATION

1. **Canonical Production Pipeline**:
   - `base44/functions/generateContentAsset/entry.ts`
   - `base44/functions/approveContentAsset/entry.ts`
   - `base44/functions/assembleLessonFromApprovedAssets/entry.ts`
   - `base44/functions/publishLessonVersion/entry.ts`
   - `base44/functions/getLearningPackage/entry.ts`
   - `base44/functions/submitAssessment/entry.ts`
   - `src/components/quiz/QuizRunner.jsx`
   - `src/components/quiz/QuizResult.jsx`

2. **Active Legacy / Prototype Compatibility**:
   - `src/services/assessmentEngine.js`
   - `src/services/diagnosticAssessmentService.js`
   - `src/lib/diagnosticQuestionBank.js`
