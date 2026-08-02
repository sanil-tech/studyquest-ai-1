# Content Production Cycle (Batch Operations)

## Overview
While the "Content Factory" dictates the overarching workflow for missing content, the **Content Production Cycle** defines how we practically operate the factory in discrete, manageable runs known as "Batches". 

## Batch Processing (`BatchGenerationRunner.jsx`)
Curriculum is not generated one-by-one in a vacuum. It is generated in structured batches defined in JSON (e.g., `pilotContentBatch001.json`).

A batch consists of:
1. **Curriculum Target**: Specifically filtering the KSSR Taxonomy (e.g., Matematik Tahun 1).
2. **SP List**: A finite array of Standard Pembelajaran codes (e.g., the first 10 foundational topics).
3. **Constraints**: Mandatory architectural rules every single generated lesson must abide by.

## The Assessment Link Rule
The most critical constraint introduced during the Production Phase is **Assessment Linking**. 
Because StudyQuest operates on a Mastery-based learning loop, a lesson *cannot exist* without an assessment to prove the student learned it.

During the `QUALITY_CHECK` stage of the batch run, the `validateAssessmentLinking()` function strictly verifies:
- `quiz_id`: Does the generated lesson map to a quiz?
- `question_count`: Are there at least 5 questions?
- `mastery_threshold`: Is the threshold defined?

If an AI-generated lesson fails this structural test, its status instantly becomes `REJECTED`, preventing it from polluting the Resource Library with "dead-end" lessons.

## Operational Flow
1. Load `ContentProductionDashboard.jsx`.
2. Review the global Coverage Percentage.
3. Click "Start Pipeline" on the active batch.
4. Watch as SPs move from `MISSING` -> `GENERATING` -> `QUALITY_CHECK` -> `APPROVED` -> `RESOURCE_LIBRARY`.
