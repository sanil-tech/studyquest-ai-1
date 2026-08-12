# Phase 2 Database Graph Verification

## V3 Canonical Database Graph

We verified `base44/functions/generateModularLessonContent/entry.ts` and confirmed that a single autonomous generation pass now correctly persists all required entities into the database using a robust relational schema.

```mermaid
erDiagram
    Lesson ||--o{ LessonVersion : "has versions"
    LessonVersion ||--o{ LessonBlock : "contains"
    LessonVersion ||--o| Assessment : "has one"
    Assessment ||--o{ QuestionBank : "contains"
    QuestionBank ||--o{ QuestionOption : "has choices"

    Lesson {
        string id PK
        string title
        string topic_id
        string content_status "DRAFT or PUBLISHED"
    }

    LessonVersion {
        string id PK
        string lesson_id FK
        string status "draft or published"
    }

    LessonBlock {
        string id PK
        string lesson_version_id FK
        string block_type
        json payload
        string status "draft"
    }

    Assessment {
        string id PK
        string lesson_version_id FK
        string lesson_id FK
        string workflow_status "DRAFT"
    }

    QuestionBank {
        string id PK
        string assessment_id FK
        string lesson_version_id FK
    }

    QuestionOption {
        string id PK
        string question_id FK
        boolean is_correct
    }
```

## Graph Verification Evidence

The `generateModularLessonContent` endpoint natively enforces this hierarchy during creation (Lines 225-480):
1. **Lesson**: Creates base `Lesson` record.
2. **LessonVersion**: Immediately creates a Draft `LessonVersion` pointing to the `Lesson`.
3. **LessonBlock**: Loops through generated blocks and creates `LessonBlock` rows associated with the `lesson_version_id`.
4. **Assessment**: Creates an `Assessment` tied to both `lesson_version_id` and `lesson_id`, initialized to `DRAFT`.
5. **QuestionBank**: Iterates through AI-generated questions, saving them tied to the `assessment_id` and `lesson_version_id`.
6. **QuestionOption**: For each question, parses the options array to create individual `QuestionOption` records, correctly tagging `is_correct`.

This strict persistence model allows `getLearningPackage` and `getLessonContent` to securely filter drafts from students, satisfying the invariants without exposing answer keys (which are filtered in `getLessonContent`).
