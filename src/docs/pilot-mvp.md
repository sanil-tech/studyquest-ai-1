# StudyQuest Pilot MVP (KSSR Tahun 1 Matematik)

## Overview
This document outlines the final orchestration layer for the StudyQuest Pilot MVP. We are preparing to onboard the first 100 Malaysian students. The focus is strictly on delivering a seamless, real-world learning experience without introducing new backend intelligence engines.

## Student Journey Flow
The orchestration is managed via `pilotService.js`.

1. **Onboarding**: `initializePilotStudent()` checks if a student profile exists in Base44. If not, they are created and routed to the Diagnostic Assessment.
2. **Path Generation**: Once diagnostics are complete, the `RecommendationEngine` determines the exact Standard Pembelajaran (SP) the student should start with.
3. **Daily Mission**: `getDailyMission()` presents the student with "Cabaran Hari Ini" (Today's Challenge). It connects the recommended SP code to the gamified reward system (Stars, XP, Badges).
4. **Learning & Assessment**: The student interacts with AI-generated widgets (e.g. `base_ten_blocks`, `addition_machine`), makes mistakes, and receives help from the AI Tutor.
5. **Mastery Update**: The `MasteryEngine` recalculates their percentage and confidence.
6. **Parent Reporting**: `getPilotProgressReport()` aggregates the data to give parents a clear, non-technical view of their child's progress, including specific activities to practice at home.

## Pilot Curriculum Structure
The MVP strictly adheres to **Matematik Tahun 1**. The `pilotCurriculum.json` maps 8 core topics to their respective SP codes and recommended interactive widgets:
1. Nombor Bulat
2. Nilai Tempat
3. Tambah
4. Tolak
5. Wang
6. Masa
7. Bentuk
8. Pecahan

## Test Scenarios
To ensure UI and logic resilience before launch, we created `pilotTestStudents.json` containing 3 mock profiles:
- **Student A (Ahmad)**: High mastery, moves quickly through topics. Tests the "Advanced" recommendation path.
- **Student B (Balkis)**: Average learner. Tests standard progression and occasional mistake handling.
- **Student C (Chong)**: Needs support. Tests the "Struggling" path, triggering high AI Tutor usage and specific parent intervention recommendations.

## Remaining Gaps
This MVP confirms that the core loop is functional. The following are deferred to Post-MVP phases:
- Teacher Dashboard & Class Management.
- Multi-subject scaling (Sains, Bahasa Melayu, etc.).
- Multi-year scaling (Tahun 2 - Tahun 6).
