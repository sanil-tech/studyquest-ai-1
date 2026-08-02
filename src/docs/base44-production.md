# Base44 Production Persistence Architecture

## Overview
StudyQuest has transitioned from an in-memory prototyped data store (simulated via arrays and timeouts) to a real, cloud-based persistence layer using the Base44 SDK.

This architecture ensures that student progress, mastery, AI Tutor interactions, and diagnostic attempts are safely persisted across sessions and devices.

## Entity Schema Mapping
We created/updated the following Base44 Entities (`.jsonc`):
- **Student**: Core student profile tracking (`id`, `year_level`, `curriculum`).
- **StudentMastery**: Tracks percentage mastery of specific SP codes and confidence levels.
- **LessonProgress / MissionProgress**: Logs XP, Stars, and completion status of individual missions.
- **AssessmentAttempt**: Logs every interactive question answered, including specific `mistake_type` flags.
- **TutorInteraction**: Logs every time the AI Tutor was invoked, the level of hint requested, and responses.

## Architecture Flow
The React components NEVER call the Base44 SDK directly. 
All persistence flows through the Service and Repository layers:

```
[React UI] 
    ↓
[studentJourneyService / aiTutorService / assessmentEngine]
    ↓
[studentRepository / masteryRepository / progressRepository / tutorRepository / assessmentRepository]
    ↓
[base44Client SDK]
    ↓
[Base44 Cloud Database]
```

## Offline Safety and Fallbacks
The repository layer handles database failures gracefully using `try/catch` blocks.
If the database cannot be reached, the system will fall back to returning `null` or empty arrays, allowing the local React state and intelligence engines to maintain the session temporarily without crashing the application.

## Security Considerations
- Base44 `appId` and `token` are injected securely via environment variables (e.g., `VITE_APP_ID`).
- No Admin Tokens are hardcoded into the repository layer files.
- Role-Based Access Control (RBAC) should be configured on the Base44 dashboard so that clients can only update records matching their `student_id`.
