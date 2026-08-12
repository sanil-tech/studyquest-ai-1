# BLOCK PROMPT CONTRACTS (PHASE 5A)

This document catalogs the prompt contracts and pedagogical specifications registered in `BLOCK_PROMPT_REGISTRY` across all 12 canonical asset types.

---

## 1. CANONICAL ASSET TYPES CATALOG

### 1. `LESSON_HOOK`
- **Role**: KSSR Early-Years Pedagogy & Story Hook Specialist.
- **Pedagogical Purpose**: Capture student attention, spark curiosity, and present a relatable dilemma without revealing the complete concept yet.
- **Output Required Fields**: `title`, `hook_text`, `curiosity_question`, `visual_prompt`.

### 2. `LESSON_OBJECTIVE`
- **Role**: KSSR Curriculum Designer for Student Objectives.
- **Pedagogical Purpose**: State 1-3 actionable, clear learning goals using 'Di akhir pelajaran ini, anda dapat:' format.
- **Output Required Fields**: `title`, `objectives`, `success_criteria`.

### 3. `CONCEPT`
- **Role**: KSSR STEM Master Teacher (Concrete-Pictorial-Abstract specialist).
- **Pedagogical Purpose**: Deliver scaffolded concept explanation from concrete to abstract with key terms and visual analogies.
- **Output Required Fields**: `title`, `concept_explanation`, `key_terms`, `visual_analogy`.

### 4. `WORKED_EXAMPLE`
- **Role**: Malaysian Math & Science Step-by-Step Problem Solving Specialist.
- **Pedagogical Purpose**: Demonstrate explicit step-by-step problem-solving procedures with clear reasoning and expert tips.
- **Output Required Fields**: `problem_statement`, `steps`, `final_answer`, `expert_tip`.

### 5. `GUIDED_PRACTICE`
- **Role**: Supportive Educational Coach with Scaffolded Hints.
- **Pedagogical Purpose**: Allow students to practice applying concepts with progressive hints (Petunjuk 1 & 2) and pitfall warnings.
- **Output Required Fields**: `question_text`, `scaffolding_hints`, `solution_guide`.

### 6. `INDEPENDENT_PRACTICE`
- **Role**: Unassisted Practice Exercise Writer.
- **Pedagogical Purpose**: Test student mastery through unassisted practice problems with post-attempt review explanations.
- **Output Required Fields**: `questions`.

### 7. `REFLECTION`
- **Role**: Metacognitive Learning Specialist.
- **Pedagogical Purpose**: Summarize 3-5 core takeaways, highlight common mistakes, and prompt self-reflection.
- **Output Required Fields**: `summary_points`, `common_mistakes`, `reflection_prompt`.

### 8. `VIDEO`
- **Role**: Educational Video Script Producer.
- **Pedagogical Purpose**: Write spoken narration script with synchronized visual scene descriptors and key takeaways.
- **Output Required Fields**: `video_title`, `video_script`, `scene_descriptions`, `key_takeaways`.

### 9. `INTERACTIVE`
- **Role**: Gamified Learning Activity Designer.
- **Pedagogical Purpose**: Design matching, sorting, or sequencing game data with instructions and feedback messages.
- **Output Required Fields**: `activity_type`, `instructions`, `game_data`, `feedback_messages`.

### 10. `FLASHCARD`
- **Role**: Spaced-Repetition Memory Specialist.
- **Pedagogical Purpose**: Create 4-6 high-yield recall cards with front prompt, back definition, and optional mnemonic context.
- **Output Required Fields**: `cards`.

### 11. `QUIZ_QUESTION`
- **Role**: KSSR Formative Quiz Author.
- **Pedagogical Purpose**: Formulate multiple-choice question with 4 options (A-D), 1 correct answer, and thorough explanation.
- **Output Required Fields**: `question_text`, `options`, `correct_answer`, `explanation`, `cognitive_level`, `difficulty`.

### 12. `ASSESSMENT_ITEM`
- **Role**: Malaysian Examination Syndicate (LPM) & PBD Assessment Expert.
- **Pedagogical Purpose**: Formulate rigorous PBD assessment item tagged with Cognitive Level (Bloom), TP Level (TP1-TP6), and misconception target.
- **Output Required Fields**: `question_text`, `options`, `correct_answer`, `explanation`, `tp_level`, `cognitive_level`, `misconception_target`.
