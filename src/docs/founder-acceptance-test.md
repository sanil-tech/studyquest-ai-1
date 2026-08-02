# Founder Acceptance Test (FAT) Protocol

The Founder Acceptance Test is the final hard gate before the closed Alpha launch. It guarantees that the production deployment matches the staging environment's integrity.

## Objective
To manually verify that real-world network latency, production database rules, and live Edge Functions do not break the core StudyQuest learning loop.

## Execution via Dashboard
The `AlphaLaunchDashboard` contains the `FounderAcceptanceRunner`. The founding team must manually sign off on the 5 critical pipeline handoffs:

1. **Authentication Flow**:
   - Create a real parent account.
   - Verify the email OTP delivers within 60 seconds.
   - Create a child profile and verify the Base44 RLS policies allow read/write access for that specific parent ID.

2. **Diagnostic Routing**:
   - Take the diagnostic assessment.
   - Verify the payload maps correctly to a valid `sp_code` in the production KSSR Taxonomy table.

3. **Content Retrieval**:
   - Load the recommended lesson.
   - Ensure the React components fetch the interactive widget configuration payload without triggering a 500 server error.

4. **AI Tutor Logic**:
   - Purposefully fail the widget 3 times.
   - Verify the production OpenAI key successfully triggers the Cikgu AI edge function, returning a conceptual hint rather than a timeout or a direct answer.

5. **Parent Telemetry**:
   - Complete the lesson and fail the assessment.
   - Verify the Mastery Engine updates the student's status to `REVIEW_REQUIRED`.
   - Log out, log back in as the Parent, and verify this exact status appears on the Parent Dashboard timeline.

## Launch Authorization
Once all 5 tests are checked in the `FounderAcceptanceRunner`, the `Launch Readiness Score` will hit 100%, and the system will explicitly authorize the mass onboarding of the 5 Alpha families.
