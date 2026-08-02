# Alpha Bug Reporting Workflow

During the 7-day closed Alpha, we expect errors. Our goal is not perfection; our goal is rapid triage and resolution.

## 1. Automated Detection
The `PilotCommandCenter` dashboard monitors all backend `endToEndValidationService` logs.
- If a pipeline handoff fails (e.g., Lesson missing assessment), an automatic ticket is created.

## 2. Qualitative Feedback
Families are instructed to use the in-app "Report Issue" button if they encounter confusing UI, freezing widgets, or unhelpful AI Tutor hints.

## 3. Triage Protocol

All incoming reports (automated and manual) must be tagged by the engineering team daily into three buckets:

### [P0] Critical 
*Definition:* The system is broken or data is being lost.
*Examples:*
- User cannot log in.
- Diagnostic assessment crashes.
- Recommendation engine routes to a null SP.
- Mastery data fails to save to Base44.
*Action:* **STOP DEVELOPMENT**. Fix immediately and deploy hotfix to Alpha.

### [P1] High
*Definition:* The system works, but the pedagogical quality is unacceptable.
*Examples:*
- Cikgu AI gives away the direct answer instead of a hint.
- A generated lesson contains factually incorrect mathematics.
- The UI is confusing enough that a parent cannot figure out how to view the report.
*Action:* Must be fixed before the Alpha period ends. Prevents promotion to RC2.

### [P2] Moderate
*Definition:* Cosmetic issues or minor friction.
*Examples:*
- Typo in a non-critical UI element.
- Gamification animation stutters on older Android devices.
- User suggests a "nice to have" feature.
*Action:* Logged to the backlog. Will be batched for the post-RC2 cleanup phase.
