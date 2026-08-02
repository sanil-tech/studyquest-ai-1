# Gold Standard Lesson Validation

## Overview
As StudyQuest scales curriculum production via the AI Content Engine, the risk of "AI degradation" (where generated content drifts from pedagogical standards) increases. The Gold Standard Validation phase is a human-in-the-loop feedback system designed to prevent this.

## The Review Process
1. **Batch Generation**: The Content Factory produces a batch of lessons (e.g., Batch 001).
2. **Preview Mode**: Instead of just reading JSON, human curriculum designers use `LessonPreviewMode.jsx` to experience the lesson exactly as a student would, interacting with widgets and testing the AI Tutor.
3. **Scoring**: Using the `LessonQualityScoreCard.jsx`, the designer scores the lesson across 9 strict metrics defined in `lessonQualityBenchmark.json` (e.g., DSKP Alignment, Pedagogy, Bahasa Melayu nuance). The system calculates a weighted average.

## Quality Gates
- **< 80**: `REPAIR_REQUIRED`. The lesson is rejected and sent back to the factory.
- **80 - 89**: `APPROVED`. The lesson is structurally sound and enters the live library.
- **>= 90**: `GOLD_CANDIDATE`. The lesson exhibits exceptional pedagogy and flow.

## The Template Extraction Loop
If a lesson achieves `GOLD_CANDIDATE` status, the administrator can promote it to a `GOLD_TEMPLATE`. 
When this happens, the system extracts the underlying structural JSON of that lesson and feeds it back into the `aiContentEngine.js` as a few-shot prompting reference.

This means that the *best* lessons generated today automatically become the baseline template for the lessons generated tomorrow, creating a continuous cycle of quality improvement rather than degradation.
