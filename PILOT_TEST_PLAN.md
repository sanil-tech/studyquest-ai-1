# StudyQuest Alpha Pilot Test Plan

This document outlines the operational workflow for testing the StudyQuest RC1 Release Candidate with live users.

## Phase 1: Internal Founder Test (T-Minus 3 Days)
Before inviting external families, the system must be validated in production by the founding team.
1. Deploy the platform following `DEPLOYMENT.md`.
2. Register a test Parent Account on the live server.
3. Create a test Child Profile (Tahun 1).
4. Run through the Diagnostic Assessment without skipping.
5. Complete 3 full lessons, intentionally making mistakes to trigger the AI Tutor.
6. Verify the Parent Dashboard correctly aggregates the mastery data.

## Phase 2: Closed Alpha (5 Malaysian Families)
We are selecting 5 families with children in Darjah 1 (Standard 1) to participate in a 7-day closed Alpha.

### Onboarding
1. Provide families with the production URL.
2. Instruct them to use the system naturally (no specific script).
3. Monitor the `PilotCommandCenter` dashboard internally to ensure no students are stuck in infinite learning loops or encountering 500 errors.

### Feedback Collection
1. **Automated**: The `PilotCommandCenter` will automatically track drop-off points, lesson completion rates, and AI Tutor invocation rates.
2. **Qualitative**: After 7 days, parents will be prompted by the `IssueTracker` to submit feedback regarding:
   - Ease of use (Parent Dashboard).
   - Child engagement (Gamification effectiveness).
   - Perceived learning value (Quality of AI explanations).

## Phase 3: Bug Triage & Release Candidate 2 (RC2)
All feedback and tracked errors will be collected.
- **Critical (P0)**: Broken routing, database failures, assessment engine crashes. Must be fixed immediately.
- **High (P1)**: Poor AI Tutor explanations, confusing UI. Must be fixed before scaling beyond 5 families.
- **Moderate (P2)**: UI polish, gamification tweaks. Can be batched for RC2.

Once P0 and P1 issues are resolved, the codebase will be tagged as RC2, clearing the path for mass curriculum generation (Batch 002) and a wider beta release.
