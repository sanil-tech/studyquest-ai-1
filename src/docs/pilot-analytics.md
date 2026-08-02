# Pilot Analytics & Learning Measurement

## Overview
The Pilot Analytics layer is designed to scientifically measure the efficacy of StudyQuest during the initial 100-student pilot in Malaysia. Instead of just tracking "logins," this engine evaluates actual cognitive improvement, AI effectiveness, and curriculum health.

## Core Metrics Calculated

### 1. Learning Improvement (Mastery Gain)
This is the most critical metric. We calculate the Delta (Δ) between the student's initial Diagnostic Assessment score and their current Mastery Engine percentage.
- **Formula**: `Current Mastery % - Diagnostic % = Mastery Gain`
- **Goal**: Prove that using StudyQuest directly increases student understanding of DSKP Standards.

### 2. AI Tutor Effectiveness
When a student struggles, the AI Tutor provides scaffolding. We measure if that scaffolding actually works.
- **Metric**: How often a student successfully resolves a mistake *after* requesting a hint.
- **Threshold**: We aim for an >80% success rate. If it drops, our AI prompt engineering for the tutor needs adjustment.

### 3. Content Quality Detection
By aggregating failures across the cohort, the analytics engine identifies specific `sp_codes` (e.g., SP 2.1.2) where multiple students are failing. This flags the Admin Content Studio to revise or regenerate the lesson blocks for that topic.

### 4. Engagement Velocity
We track not just total missions, but the speed of completion and streak retention, determining if the Gamified Mission UI is successfully keeping 7-year-olds engaged.

## Architecture
- **Data Entity**: `PilotAnalytics` (Base44 Cloud). Stores aggregated snapshots of student cohorts.
- **Service Layer**: `learningAnalyticsService.js`. Reads from existing repositories (Mastery, Progress, Tutor) and synthesizes the data according to `analyticsRules.json`.
- **Admin Dashboard**: `PilotAnalyticsDashboard.jsx`. Visualizes the telemetry for administrators, providing real-time alerts on struggling topics and overall cohort health.
