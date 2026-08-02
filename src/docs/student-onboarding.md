# StudyQuest Frontend Integration: Student Onboarding & Home

This documentation covers the Phase 1 frontend integration of the StudyQuest intelligence layer into the React user interface.

## 1. Flow Overview

```mermaid
graph TD
    A[/onboarding] -->|Step 1| B(Collect Info)
    B -->|Step 2| C(Intro to Diagnostic)
    C -->|Step 3| D(Diagnostic Assessment UI)
    D -->|Step 4| E(Calculate & Update Mastery)
    E -->|Redirect| F[/home]
    F -->|Renders| G[StudentHome.jsx]
    G --> H[XPHeader]
    G --> I[MasteryProgress]
    G --> J[MissionCard]
    J -->|Click 'Mula Misi'| K[/lesson]
```

## 2. Screens Implemented

### `StudentOnboarding.jsx`
The official entry point for new users. Instead of overwhelming the student with taxonomy choices or placement exams, it wraps the `diagnosticAssessmentService` into a 4-step gamified flow.
- Instantiates a diagnostic session.
- Cycles through assessment questions (MCQs and interactive WIdget placeholders).
- Resolves by saving data to the global `MasteryEngine` before routing to `/home`.

### `StudentHome.jsx`
The dynamic, intelligence-driven student dashboard.
- Calls `getStudentHome()` from `studentJourneyService`.
- Hides complex SP codes from the UI.
- Synthesizes state into 3 core components: XP/Streak Header, Progress Bars, and the singular "Cabaran Hari Ini" daily mission.

## 3. UI Components (`src/components/student/`)

1. **`XPHeader.jsx`**: A sticky top navigation bar rendering the child's active streak and total earned XP.
2. **`MasteryProgress.jsx`**: A rounded, friendly progress bar showing overall completion for their current subject level. 
3. **`MissionCard.jsx`**: The critical interaction point. Uses the recommendation engine's top-priority output to create an irresistible CTA ("Mula Misi").

## 4. State Hand-off to Lesson Engine

When a student clicks "Mula Misi" on the `MissionCard`, `StudentHome` triggers a route navigation:
```javascript
navigate('/lesson', { state: { mission } });
```
This passes the intelligently generated mission payload to the existing `LessonPage.jsx` infrastructure, establishing a seamless loop between AI recommendation and actual gameplay.

## 5. Future Implementation Notes

- Currently, student persistence is handled by local variables/memory in the service files. The next architectural phase will map these state updates into actual API calls for `Base44` backend database persistence.
- Interactive widgets (like `base_ten_blocks`) need their state-resolution callbacks wired directly to `completeMission()` inside `LessonPage.jsx` to complete the full feedback loop.
