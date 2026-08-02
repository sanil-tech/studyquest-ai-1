# Parent Trust & Pilot Feedback System

## Overview
For the StudyQuest MVP pilot to be deemed successful, it is not enough that the AI engines function perfectly; parents must *trust* the system, and administrators must be able to *measure* that trust. This layer introduces Learning Evidence (translating AI data into human reassurance) and a robust feedback collection mechanism.

## 1. Learning Evidence (Building Trust)
We translate technical AI assessments into child-centric achievements:
- **LearningTimeline.jsx**: Replaces raw charts with a narrative timeline ("Before StudyQuest", "During Activity", "Current Improvement"). It highlights the exact percentage jump in a way parents understand.
- **WeeklyReport.jsx**: Instead of listing DSKP codes (e.g., "SP 2.1.2"), this component generates plain Bahasa Melayu summaries like "Kemahiran Dikuasai: Asas Nombor".
- **ProgressCertificate.jsx**: A highly polished, animated certificate that triggers when the AI detects >80% mastery in a core topic. This provides tangible proof of ROI for the parent and a massive confidence boost for the child.

## 2. Feedback Collection (Measuring Satisfaction)
To gather qualitative data during the 30-day pilot:
- **FeedbackPrompt.jsx (Student)**: Rendered at the end of a lesson. Uses simple emojis (😀 Seronok, 🙂 Ok, 😟 Susah) to gauge immediate engagement without reading comprehension barriers.
- **FeedbackForm.jsx (Parent)**: A structured survey asking about the child's confidence, the platform's utility, and open-ended text fields for bugs/complaints.

## 3. Pilot Feedback Dashboard
`PilotFeedbackDashboard.jsx` provides the StudyQuest administration team with real-time health metrics of the cohort:
- **Family / Student Counts** (Adoption rate)
- **Parent Satisfaction Score** (Target: >4.5/5)
- **Student Enjoyment Score** (Target: >85% "Seronok")
- **Active Issues List** (Surfaces common textual complaints for rapid patching).

## Integration
These components sit purely on the presentation layer. They do not calculate new learning data. They pull directly from the existing `parentInsightService` and `MasteryEngine` (simulated via `demoStudents.json` for MVP UI) to guarantee that what the parent sees is perfectly aligned with what the AI Tutor is executing.
