# PRODUCTION ARCHITECTURE AUDIT: StudyQuest AI

This document outlines the findings of the architectural audit for StudyQuest AI. The audit compares the current repository against the target canonical architecture.

## 1. Non-Negotiable Principle Violations

### 1.1 Dual Generation Paths (V1 vs V2)
- **Current State**: The `AdminContentStudio.jsx` component implements two separate content generation pipelines (`V1 Generation` and `V2 Modular Generation`).
- **Target State**: There should only be one deterministic generation pipeline (`generateModularLessonContent`).
- **Issue**: V1 uses legacy shell systems that are not deterministic and do not adhere to the 15-block DSKP schema, bypassing modern validations.

## 2. P0 Security & Access Invariants

### 2.1 Student Runtime Security Flaw (`getLearningPackage/entry.ts`)
- **Current State**: The endpoint `getLearningPackage` checks for a `published` `LessonVersion`. However, if none is found, it falls back to the most recently created version **regardless of its status** (e.g., draft, under_review).
- **Target State**: Student runtime MUST NEVER load draft/unpublished content. If a published version is absent, it must return a strict 404 or an empty package.
- **Risk Level**: **CRITICAL (P0)**. Unapproved AI hallucinations or incomplete content can leak directly to students.

### 2.2 Answer Key Leakage (`getLessonContent/entry.ts`)
- **Current State**: The legacy `getLessonContent` endpoint fetches questions and returns the full `correct_answer` payload directly to the client runtime.
- **Target State**: The client should only receive distractors and the question structure. Scoring must occur securely on the server (as currently implemented correctly in `submitAssessment`).
- **Risk Level**: **HIGH (P1)**. Students can easily inspect network traffic and cheat on assessments.

### 2.3 Quality Gate Bypass (`publishLessonVersion/entry.ts`)
- **Current State**: The system implements an AI Quality Shield (Score >= 80) and a Preview Approval Shield. However, both can be entirely bypassed by passing `{ force_publish: true }` in the API payload.
- **Target State**: The `force_publish` escape hatch should be removed or strictly constrained to super-admins to prevent accidental or malicious promotion of sub-par AI content.
- **Risk Level**: **CRITICAL (P0)**. Bypassing quality gates breaks the "Deterministic Shell" invariant.

## 3. Legacy Architecture & Unused Code

### 3.1 Quiz Runner & Old Assessments
- **Current State**: `src/components/quiz/QuizRunner.jsx` and legacy APIs are present and partially referenced. The target uses `Assessment/QuestionBank/QuestionOption` schema.
- **Target State**: We need to deprecate `Quiz` in favor of the new canonical Assessment models and `assessmentEngine.js`.
- **Note**: Do not delete legacy code until we have completed migration logic or verified zero usage in production.

## 4. Discrepancies in Data Schema

- The `Assessment.jsonc` relies heavily on an `assessmentEngine.js` for dynamic generation and difficulty adjustments. The current `generateAssessment` function uses hardcoded templates (e.g., `fraction_addition`).
- The canonical path states: `Curriculum -> Deterministic Shell -> AI Filler`. The hardcoded mock logic in `assessmentEngine.js` needs to be linked dynamically to the DSKP framework to be fully deterministic.

---
**Conclusion**: The system has major security flaws in content delivery (`getLearningPackage`), publication enforcement (`publishLessonVersion`), and answer masking (`getLessonContent`). The presence of V1 legacy systems poses a structural drift risk. The immediate next step is to execute the **Production Implementation Plan**.
