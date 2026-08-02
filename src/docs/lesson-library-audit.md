# Lesson Library Audit & Curriculum Readiness System

## Overview
Before StudyQuest can be piloted with real students, we must ensure the `AI Content Engine` has produced a complete, mathematically accurate, and pedagogically sound library of lessons. The Lesson Library Audit system acts as a strict quality control gate.

## 1. DSKP Alignment & Completeness
The `lessonAuditService` performs a comprehensive scan against all generated lessons:
- **Alignment**: It checks every lesson's `sp_code` against the master `kssr_matematik_tahun_1.json` taxonomy. If a lesson has an invalid or missing SP code, it is immediately flagged.
- **Completeness**: It verifies the internal structure of the lesson. Based on `lessonAuditRules.json`, every lesson *must* contain an induction story, concept explanation, interactive widget, and assessment questions.

## 2. Health Scoring
Lessons are assigned a Health Score (out of 100).
- **Healthy (>80)**: The lesson is complete, aligned, and ready for students.
- **Repair Required (<80)**: The lesson is missing structural elements or maps to an invalid topic.

## 3. Curriculum Coverage Matrix
The `CurriculumCoverageMatrix.jsx` provides a visual map for curriculum designers. It lists every Standard Pembelajaran (SP) for Tahun 1 Matematik and flags whether StudyQuest has a generated lesson for it, allowing the team to quickly spot gaps in the syllabus before launch.

## 4. AI Repair Workflow
When a lesson is flagged as "Repair Required", it appears in the `LessonRepairQueue.jsx`.
Instead of requiring a human developer to manually rewrite the JSON structure, the system generates a highly specific **AI Prompt Instruction** (e.g., "Missing critical structural elements: assessment_questions").
Administrators can then copy this exact instruction and feed the defective lesson back into the `AI Content Engine` for targeted regeneration.
