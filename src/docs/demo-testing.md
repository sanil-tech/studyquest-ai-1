# Founder Test Mode (Demo Simulation)

## Overview
Before we run the MVP Pilot with the first 100 Malaysian students, the Founder needs the ability to rapidly simulate and verify the entire orchestration layer. 

The **Founder Test Mode** provides a `DemoControlPanel` where the admin can select specific student archetypes and simulate their journey through the StudyQuest ecosystem, observing the exact JSON/text outputs produced by our AI engines in real-time.

## The Demo Profiles
We simulate three distinct student arcs:
1. **Adam (Strong Demo)**: Starts at an Advanced state. Verifies that the Recommendation Engine selects harder SP codes and that AI Tutor hints are rare.
2. **Bella (Average Demo)**: Verifies the "On Track" path, standard progression, and normal gamification rewards.
3. **Carl (Struggling Demo)**: Verifies the critical path for struggling students—ensuring the AI Tutor triggers frequently, the mastery engine scales down properly, and the Parent Insight report fires warning notifications and offline activity recommendations.

## The Matrix Log (Telemetry)
The Demo Control Panel features a live **Telemetry Log**. When the founder clicks an action button, the system executes the actual underlying StudyQuest service layer (e.g., `pilotService`, `learningAnalyticsService`) and dumps the resulting object into the matrix log.

### Actions Available
- **Run Diagnostic**: Invokes `initializePilotStudent` to set base mastery.
- **Generate Mission**: Tests the `RecommendationEngine` to see what SP is chosen for the daily challenge.
- **Complete Lesson**: Simulates a win, updating the mastery score upwards.
- **Simulate Mistake**: Simulates a failure, triggering the `AITutorEngine` to provide a scaffolded hint.
- **Generate Parent Report**: Dumps the actionable insight report that the parent would see.
- **Run Cohort Analytics**: Simulates the admin dashboard aggregation, testing the `learningAnalyticsService` against the current state of the demo profiles.

## Architecture Note
This module uses existing backend service logic. It strictly injects mocked frontend states to simulate user clicks and API responses, guaranteeing that if the demo panel succeeds, the real React components will succeed when connected to the live Base44 database.
