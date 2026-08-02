# Alpha User Onboarding Checklist

This checklist is used by the StudyQuest operations team when onboarding the first 5 test families to the Alpha environment.

## 1. Pre-Flight Checks
- [ ] Ensure the Founder Test (`FOUNDER_TEST_CHECKLIST.md`) has been completed and passed within the last 24 hours.
- [ ] Verify the Alpha Database is clean (no residual test data from founders that might mix with live family data).
- [ ] Confirm `scripts/smoke-test.js` passes.

## 2. Family Provisioning
For each of the 5 families:
- [ ] Manually create the Parent Account in the Base44 auth dashboard to ensure they don't get stuck on email verification.
- [ ] Generate a secure, temporary password.
- [ ] Add their email to the "Alpha Tester" mailing list.

## 3. Communication
- [ ] Send the "Welcome to StudyQuest Alpha" email.
  - Include the production URL.
  - Include their login credentials.
  - Set explicit expectations: *"This is an early Alpha. Expect bugs. Your feedback is critical."*
  - Provide instructions on how to use the "Report Issue" button.

## 4. Monitoring Initiation
- [ ] Open the `PilotCommandCenter` dashboard.
- [ ] Add the 5 parent accounts to the strict tracking list.
- [ ] Monitor daily for the next 7 days for P0/P1 error generation.
