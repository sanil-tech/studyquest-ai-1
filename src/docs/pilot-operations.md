# Pilot Operations Command Center

## Overview
The Pilot Operations Command Center is the internal administrative tool used to run the StudyQuest Malaysian family MVP. Rather than replacing the existing AI engines or analytic pipelines, this module aggregates their telemetry into a single, actionable pane of glass for the operations team.

## 1. Pilot Operations Workflow
The operations team uses the command center to ensure the pilot cohort remains healthy and engaged:
1. **Morning Check-in**: Review `PilotOverviewMetrics` to verify Daily Active Users (DAU) and global parent satisfaction.
2. **Health Triage**: Monitor the `StudentHealthList`. Any student flagged as "Critical" (stopped learning, parent complaints) or "Needs Attention" (inactive 3+ days, high AI Tutor dependency) is investigated immediately.
3. **Activity Monitoring**: The `PilotActivityFeed` provides a real-time chronological view of system events, giving operations staff context before they reach out to a struggling family.
4. **Issue Management**: The `IssueTracker` is used to log technical bugs, content typos, or direct parent concerns, tracking them from "Open" to "Resolved".

## 2. Success Measurement Framework
The MVP pilot defines success through strict KPIs managed in `pilotOperationsRules.json`:
- **Learning Efficacy**: Average Mastery Gain must be >15%.
- **Engagement**: Daily Active Rate must be >60%.
- **Satisfaction**: Parent Satisfaction must be >4.5/5.0, and Student Enjoyment >85%.

## 3. Architecture Integration
- **`pilotOperationsService.js`**: A pure aggregation layer. It does not calculate streaks or mastery itself; it pulls from `retentionService`, `feedbackService`, and `MasteryEngine` (simulated via `demoStudents.json`).
- This clean separation ensures that if an AI engine's underlying algorithm changes, the Pilot Operations Command Center simply displays the updated results without requiring code rewrites.
