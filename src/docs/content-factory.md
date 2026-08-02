# Content Factory Pipeline

## Overview
StudyQuest's "Content Factory" is an automated pipeline that manages the massive scale of curriculum generation required for the platform. Instead of curriculum designers writing lessons manually, they act as pipeline managers—identifying missing SPs, auto-generating content via the AI Content Engine, and approving it for production.

## Pipeline Architecture
The Content Factory consists of 3 integrated stages:

### 1. Gap Analysis
The `CurriculumGapReport.jsx` continuously compares the Master KSSR Taxonomy (`kssr_matematik_tahun_1.json`) against the active Resource Library. Any Standard Pembelajaran (SP) that lacks a live lesson is flagged as "Missing".

### 2. Auto-Generation (`LessonGenerationQueue.jsx`)
Missing SPs fall into the Generation Queue.
- Administrators can trigger `Auto-Generate`.
- The system feeds the target `sp_code` to the `AI Content Engine`.
- The engine guarantees the inclusion of 8 core structural elements (as defined in `contentFactoryRules.json`): Objective, Induction, Concept, Widget, Practice, Assessment, Mistakes, AI Hints, and Parent Summary.

### 3. Quality Assurance (`LessonApprovalQueue.jsx`)
Once generated, lessons do *not* go live immediately. They enter the `QUALITY_CHECK` state.
- The `contentQualityService` automatically grades the lesson on Alignment, Pedagogy, and Assessment coverage.
- If it passes the thresholds (`>85` alignment, `>80` pedagogy), it appears in the Human QA Queue.
- An administrator provides the final "Approve to Library" sign-off, which finally publishes the lesson to live students.

## Automation and Scale
This pipeline ensures StudyQuest can scale its curriculum from Tahun 1 to Tahun 6 without a linear increase in content writing staff, while mathematically guaranteeing that no sub-topic in the national syllabus is skipped.
