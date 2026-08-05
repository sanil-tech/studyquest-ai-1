# StudyQuest AI — Comprehensive Architectural Audit

**Author:** Principal Architect  
**Date:** August 2026  
**System:** StudyQuest AI (React + Base44 Backend + Gemini AI + KSSR/KSSM Curriculum Engine)

---

## 1. Current Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      FRONTEND LAYER (React SPA)                                   |
+---------------------------------------------------------------------------------------------------+
|  [Admin Content Studio / Batch Runner / LessonResources]        [Student Interface / LessonPage]  |
|          |                                                                   ^                    |
|          v                                                                   |                    |
|  Direct SDK Writes (Legacy) / Backend RPC Functions                Backend RPC: getLearningPackage |
+----------------------------------+-------------------------------------------+--------------------+
                                   |                                           |
                                   v                                           |
+------------------------------------------------------------------------------+--------------------+
|                                    BASE44 BACKEND LAYER                                           |
+---------------------------------------------------------------------------------------------------+
|  Backend RPC Functions:                                                                           |
|   - generateModularLessonContent (Server-side Gemini AI content creation & draft storage)         |
|   - publishLessonVersion (Completeness audit, quality shield check >=80%, version archiving)      |
|   - getLearningPackage (Student runtime delivery: prefers published LessonVersion -> draft -> legacy)|
|   - submitAssessment (Grades responses, updates MasteryEngine, logs DailyXP/Coins)                |
+----------------------------------+----------------------------------------------------------------+
                                   |
                                   v
+---------------------------------------------------------------------------------------------------+
|                                  DATABASE ENTITIES (Base44 Data Store)                           |
+---------------------------------------------------------------------------------------------------+
|  [Lesson] -------------------> [LessonVersion] (Source of Truth v1/v2/v3...)                    |
|    - published_version_id        - status: "published" | "draft" | "archived"                      |
|                                  - content_completion_percentage                                 |
|                                  - preview_status: "APPROVED"                                    |
|                                         |                                                         |
|  +--------------------------------------+-------------------------------------------------------+  |
|  | Sub-Entities tied via lesson_version_id (Modular Arch):                                     |  |
|  |  - LessonBlock (Structured UI blocks: story_hook, CPA, knowledge_check, worked_example)       |  |
|  |  - LessonContent (Markdown text & structured notes)                                          |  |
|  |  - QuestionBank (Quiz & Diagnostic questions, DSKP aligned)                                  |  |
|  |  - Flashcard (Vocabulary & term cards)                                                        |  |
|  |  - LearningActivity (Interactive game & practice specs)                                      |  |
|  |  - TeacherGuide (Pedagogical guidelines & lesson flow)                                       |  |
|  |  - AIExplanation & CommonMistake                                                             |  |
|  +-----------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  [Legacy Direct Entity Relations] (Dual-Schema Risk):                                            |
|   - Quiz / QuizAttempt (Parallel standalone quiz tables)                                          |
|   - Standalone LessonContent / Flashcards without lesson_version_id (legacy fallback)            |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Data Flow: AI Generation → Database → Student Lesson

### Step 1: Trigger & Generation
1. Admin triggers generation via `AdminContentStudio.jsx` or `BatchGenerationRunner.jsx`.
2. Frontend calls `base44.functions.generateModularLessonContent({ lesson_id, subject, topic, year })`.
3. Server-side Gemini API invokes DSKP prompt templates to generate 8 learning asset types:
   - Pedagogy Blocks (`LessonBlock`: Story Hook, CPA, Worked Example, Knowledge Check)
   - Detailed Notes (`LessonContent`)
   - Practice Questions (`QuestionBank`)
   - Vocabulary (`Flashcard`)
   - Gamified Activities (`LearningActivity`)
   - Teacher Guides (`TeacherGuide`)
   - Micro-explanations (`AIExplanation`) and Misconceptions (`CommonMistake`)

### Step 2: Draft Persistence & Quality Audit
1. `generateModularLessonContent` creates a new `LessonVersion` with `status: "draft"` and stores all generated sub-entities with `lesson_version_id`.
2. Quality score calculation evaluates DSKP compliance, Bloom taxonomy coverage, and completeness.
3. Admin previews content in `UniversalLessonPreview` and clicks **Approve & Publish**.

### Step 3: Publishing & Safety Shield (`publishLessonVersion`)
1. Quality Shield verification: checks `quality_score >= 80%` and `preview_status === "APPROVED"`.
2. Archives existing published `LessonVersion` (and its child items) to `status: "archived"`.
3. Promotes new `LessonVersion` draft items to `status: "published"`.
4. Updates parent `Lesson` record pointer (`published_version_id`).

### Step 4: Student Runtime Delivery (`getLearningPackage`)
1. Student enters `LessonPage.jsx` for a given `lesson_id`.
2. `getLearningPackage` fetches published assets matching `lesson_version_id`.
3. Falls back gracefully if no version exists: draft `LessonVersion` → unassigned legacy entities (`lesson_id` only).
4. `BlockRenderer.jsx` renders modular `LessonBlock` items (CPA blocks, interactive widgets, quiz questions).
5. Student quiz submissions call `submitAssessment`, updating student mastery, daily XP, and coin wallets.

---

## 3. Source of Truth Recommendation

### Primary Source of Truth: **Modular `LessonVersion` Entity Architecture**

- **Root Container:** `Lesson` (Metadata, curriculum hierarchy reference: Subject/Topic/Subtopic).
- **Versioned Container:** `LessonVersion` (Holds publication state, quality score, version number, approval status).
- **Content Sub-Entities:** All content MUST explicitly reference `lesson_version_id`.
  - `LessonBlock` (Strict block order & interactive UI state)
  - `LessonContent`
  - `QuestionBank`
  - `Flashcard`
  - `LearningActivity`
  - `TeacherGuide`
  - `AIExplanation`
  - `CommonMistake`

### Why `LessonVersion` MUST Be Sole Source of Truth:
1. **Immutability & Safety:** Modifying drafts or regenerating AI content will never corrupt live student learning sessions.
2. **Deterministic Delivery:** `getLearningPackage` fetches a single frozen snapshot of learning assets by `lesson_version_id`.
3. **Auditability:** Complete historical tracking of versions, author approvals, and quality scores.

---

## 4. Identified Duplicate Systems

During repository analysis, the following duplicate or dual-path mechanisms were identified:

1. **Dual Quiz Data Models (`QuestionBank` vs `Quiz`/`QuizAttempt`):**
   - **Path A:** `QuestionBank` + `AssessmentQuestion` (Integrated modular system linked to `LessonVersion`).
   - **Path B:** Standalone `Quiz` and `QuizAttempt` entities created by client-side legacy generators (`generateKSSRContent.js` & `aiContentEngine.js`).

2. **Dual AI Content Generation Engines:**
   - **Engine A (Production RPC):** `base44/functions/generateModularLessonContent` (Server-side, schema-validated, version-aware).
   - **Engine B (Legacy Frontend):** `src/services/generateKSSRContent.js` & `src/services/aiContentEngine.js` (Client-side Gemini calls creating un-versioned entities directly via SDK writes).

3. **Dual Lesson Rendering Paths:**
   - **Path A:** `BlockRenderer.jsx` + `LessonShellRenderer.jsx` (Modular block-based rendering from `LessonBlock`).
   - **Path B:** `ClassicLessonView.jsx` (Legacy single-blob Markdown/html content string parser).

---

## 5. Key Migration Risks

1. **Orphaned Content Without `lesson_version_id`:**
   - Legacy lessons generated prior to modular architecture contain records with `lesson_id` set but `lesson_version_id` set to `null`.
   - *Risk:* If fallback logic in `getLearningPackage` or `publishLessonVersion` is abruptly deleted, legacy lessons will fail to load for students.

2. **Schema Drift Between Client & Server AI Generators:**
   - Frontend `generateKSSRContent.js` creates different payload formats compared to backend `generateModularLessonContent`.
   - *Risk:* Inconsistent structure in `LessonBlock` payloads can crash frontend block renderers.

3. **Client-Side Secret & API Key Exposure:**
   - `aiContentEngine.js` and `generateKSSRContent.js` invoke direct client-side Gemini calls if configured.
   - *Risk:* Breaches API key security guidelines. All AI generation MUST execute in server-side Base44 RPC functions.

---

## 6. Recommended Final Architecture

### Architecture Refinement Roadmap

```
+-----------------------------------------------------------------------------------+
|                            TARGET ARCHITECTURE                                    |
+-----------------------------------------------------------------------------------+
|  [Admin UI / Batch Studio]                                                       |
|        |                                                                          |
|        v (RPC Call Only)                                                          |
|  [base44/functions/generateModularLessonContent]                                 |
|        |                                                                          |
|        v (Draft creation with quality audit)                                      |
|  [LessonVersion (draft)] ---> [Admin Preview & Approval]                          |
|                                       |                                           |
|                                       v (RPC: publishLessonVersion)               |
|  [LessonVersion (published)] <--------+                                           |
|        |                                                                          |
|        v (Strict query: lesson_version_id = published_id)                        |
|  [base44/functions/getLearningPackage]                                            |
|        |                                                                          |
|        v                                                                          |
|  [Student LessonPage / BlockRenderer]                                             |
+-----------------------------------------------------------------------------------+
```

### Strategic Action Items:

1. **Deprecate Client-Side AI Content Generators:**
   - Replace all frontend SDK direct writes in `generateKSSRContent.js` and `aiContentEngine.js` with calls to `base44.functions.generateModularLessonContent`.

2. **Consolidate Assessment Data Model:**
   - Standardize all quizzes and assessments on `QuestionBank` + `AssessmentQuestion`.
   - Deprecate standalone `Quiz` entity in favor of version-bound `QuestionBank` items.

3. **Automate Legacy Content Migration:**
   - Run a one-time migration script (or leverage `publishLessonVersion` auto-attach) to assign all un-versioned `lesson_id` records into an initial `LessonVersion` v1.0.

4. **Enforce Single Server-Side Entry Point for Student Lessons:**
   - Ensure `LessonPage.jsx` strictly consumes data from `base44.functions.getLearningPackage`, enforcing zero client-side assembly fallback once migration is complete.
