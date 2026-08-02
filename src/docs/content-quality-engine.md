# Content Quality Engine (Admin Studio 2.0)

StudyQuest's Admin Content Studio is responsible for safely generating thousands of DSKP-aligned modular lessons using AI.
To prevent hallucinations or pedagogically unsound materials from reaching students, every AI generation must pass through the **Content Quality Engine (CQE)**.

## Core Validation Checks
When an admin generates a lesson (Step 3), the result is intercepted at Step 5 (Audit Kualiti) by `validateLessonQuality()`. 

This service checks four major pillars:
1. **Curriculum Alignment (40%)**: Ensures the lesson title exists, content blocks align with the SP code, and there are no missing metadata elements.
2. **Pedagogy (30%)**: Enforces Bloom's Taxonomy. It prevents overly vague learning objectives like "Understand fractions" and flags them. 
3. **Assessment Coverage (20%)**: Rejects lessons that don't have a clear flow of Concept -> Practice -> Assessment.
4. **Engagement (10%)**: Ensures interactive widgets (e.g. `fraction_slicer`) are used where appropriate based on `contentQualityRules.json`.

## AI Approval Workflow
- If the `overall.score` >= 80, the lesson passes. The admin can click **Approve AI Quality** and proceed to Publish.
- If it fails, the system blocks the `Approve` button. The admin is forced to click **Reject & Edit Manually**, sending them back to the block editor (Step 4) to fix missing components (e.g., adding a practice block or editing the learning objective).

## Base44 Persistence
Every time an evaluation is run, a `LessonReview` record is saved to the Base44 Cloud Database. This creates an auditable trail of all generated content and its automated quality score.
