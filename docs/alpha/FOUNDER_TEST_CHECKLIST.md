# Founder Alpha Testing Checklist

Before inviting the 5 Alpha families, the founding team MUST complete this checklist on the live `alpha` environment.

## 1. Environment Verification
- [ ] Verify the URL is the correct alpha domain.
- [ ] Run `node scripts/smoke-test.js` and confirm all endpoints return `200 OK`.
- [ ] Verify `window.localStorage` contains the correct `APP_VERSION` (v1.0.0-alpha.1).

## 2. Parent Onboarding Flow
- [ ] Create a new Parent Account using a personal testing email.
- [ ] Verify the OTP or email confirmation loop completes successfully.
- [ ] Create a Child Profile set to "Tahun 1".

## 3. Student E2E Test (The "Muthu" Route)
- [ ] Log in as the Child.
- [ ] Complete the Diagnostic Assessment. **Action**: Intentionally score low (< 50%) to force remedial routing.
- [ ] Verify the Recommendation Engine assigns an introductory SP (e.g., 1.1.1).
- [ ] Start the recommended lesson.
- [ ] **Stress Test**: During the interactive widget, deliberately make 3 consecutive mistakes.
- [ ] Verify Cikgu AI intervenes with a *conceptual hint*, not a direct answer.
- [ ] Complete the lesson assessment.

## 4. Parent Dashboard Verification
- [ ] Log back in as the Parent.
- [ ] Verify the Learning Timeline correctly displays the diagnostic result and the lesson completion.
- [ ] Confirm the Weekly Report accurately reflects the "Struggling" learner telemetry.

If ANY of these steps fail, do NOT proceed to User Onboarding. Route the failure to the Bug Triage workflow.
