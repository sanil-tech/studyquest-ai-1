# Pilot Onboarding Drill

## Overview
The Pilot Onboarding Drill is an End-to-End (E2E) validation framework designed to prove the structural integrity of the entire StudyQuest architecture. Before we deploy the system to real Malaysian families, this drill programmatically injects "Virtual Learners" into the top of the funnel to ensure their data cascades flawlessly through all backend engines.

## The Journey Assessed
The `pilotOnboardingService.js` simulates the following real-time sequence:
1. **Registration**: Parent account creation.
2. **Child Profile**: Student entity initialization.
3. **Diagnostic**: Generating a baseline KSSR competency score.
4. **Recommendation**: Routing the student to the correct Standard Pembelajaran (SP).
5. **Lesson Retrieval**: Fetching the exact lesson payload from the Resource Library.
6. **AI Tutor**: Detecting mistakes and injecting conceptual hints mid-lesson.
7. **Assessment**: Generating and grading a dynamic quiz based on the lesson's `quiz_id`.
8. **Mastery Update**: Writing the new competency state back to the Mastery Engine.
9. **Parent Report**: Summarizing the journey telemetry for the Parent Dashboard.

## End-to-End Validation Rules
The `endToEndValidationService.js` strictly monitors the handoffs between these 9 stages. If an engine fails to return the required structural payload (e.g., the Recommendation Engine returns an SP that doesn't exist in the Resource Library), the validator throws an unhandled exception.

This triggers the `FailurePointReport.jsx` on the dashboard, isolating the exact broken API contract for immediate engineering repair.

## Virtual Profiles
- **Strong Learner (Ali)**: Proves the "fast-track" logic works without breaking.
- **Normal Learner (Siti)**: Proves the standard progression and minor mistake recovery loop.
- **Struggling Learner (Muthu)**: A heavy stress test on the AI Tutor, proving it can catch sequential mistakes and issue proper remedial hints without crashing the lesson flow.
