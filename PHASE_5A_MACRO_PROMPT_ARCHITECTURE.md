# PHASE 5A: BLOCK PROMPT MACRO ARCHITECTURE REPORT

This document details the Macro Prompt Architecture implemented in Phase 5A to elevate AI Content Generation Intelligence across StudyQuest AI.

---

## 1. MACRO GENERATION MODEL & CORE PRINCIPLES

Instead of relying on a single generic AI prompt for every content block, Phase 5A establishes a **15-Point Macro Prompt Contract**. Each canonical asset type receives specialized pedagogical instructions, structural contracts, age appropriateness constraints, and quality rubrics.

```text
CURRICULUM CONTEXT (sp_code, topic_id, subject, learning_standard)
        │
        ▼
LEARNER PROFILE (year_level, age, language, reading_ability)
        │
        ▼
BLOCK PROMPT REGISTRY (src/lib/blockPromptRegistry.js & base44/shared/blockPromptRegistry.ts)
        │
        ▼
15-POINT MACRO PROMPT BUILDER (buildMacroPrompt)
        │
        ▼
CANONICAL GENERATOR (base44/functions/generateContentAsset/entry.ts)
        │
        ▼
QUALITY SHIELD & ADMIN APPROVAL GATE
```

---

## 2. THE 15-POINT MACRO PROMPT STRUCTURE

Every prompt assembled by `buildMacroPrompt` contains 15 explicit sections:

1. **MACRO 1 — ROLE**: Specialized AI persona (e.g. KSSR story hook specialist, CPA master teacher, PBD assessment expert).
2. **MACRO 2 — CURRICULUM IDENTITY**: Structured `subject`, `year_level`, `topic`, `sp_code`, and `learning_standard`.
3. **MACRO 3 — LEARNER PROFILE**: Target student age, grade, language (Bahasa Melayu), and reading ability.
4. **MACRO 4 — PEDAGOGICAL PURPOSE**: Explicit pedagogical intention (what student should experience and what should NOT happen yet).
5. **MACRO 5 — PRIOR KNOWLEDGE**: Prerequisites assumed before entering this block.
6. **MACRO 6 — BLOCK RESPONSIBILITY**: Actionable student outcomes required by this block.
7. **MACRO 7 — CONTENT RULES**: Specific formatting, micro-step breakdowns, and scaffolding rules.
8. **MACRO 8 — LANGUAGE RULES**: Pure, natural Bahasa Melayu educational terms (preventing literal translations or Indonesian terms).
9. **MACRO 9 — AGE APPROPRIATENESS**: Sentence length, visual formatting, and step complexity controls.
10. **MACRO 10 — MALAYSIAN CULTURAL CONTEXT**: Contextually authentic Malaysian scenarios (e.g., kedai sekolah, ringgit, buah-buahan).
11. **MACRO 11 — OUTPUT CONTRACT**: Strict JSON payload field specifications.
12. **MACRO 12 — VALIDATION RULES**: Server-side verification rules.
13. **MACRO 13 — QUALITY CRITERIA RUBRIC**: Custom quality scoring breakdown per asset type.
14. **MACRO 14 — FORBIDDEN BEHAVIOUR**: Explicit prohibitions (no invented SP codes, no answer key leakage, no placeholders).
15. **MACRO 15 — NEXT-BLOCK HANDOFF**: Pedagogical continuity link to the subsequent learning stage.

---

## 3. TEST SUITE RESULTS ([tests/phase5a.test.js](file:///c:/Users/sanil/OneDrive/Desktop/studyquest-ai-1/tests/phase5a.test.js))

```text
✔ TEST 1: Every canonical block has a prompt contract (2.8ms)
✔ TEST 2: Every canonical block has unique pedagogical instructions (0.5ms)
✔ TEST 3: Every prompt requires curriculum identity (1.4ms)
✔ TEST 4: Every prompt requires learner context (0.7ms)
✔ TEST 5: Every prompt has output schema requirements (0.7ms)
✔ TEST 6: Every prompt has forbidden behaviour rules (2.4ms)
✔ TEST 7: Engagement prompt differs from Concept prompt (1.3ms)
✔ TEST 8: Video prompt differs from Interactive prompt (0.6ms)
✔ TEST 9: Quiz prompt differs from Assessment prompt (0.6ms)
✔ TEST 10: AI cannot select/change block ordering (0.6ms)
✔ TEST 11: AI cannot invent curriculum identity (0.4ms)
✔ TEST 12: Invalid asset_type cannot select a prompt (0.4ms)
✔ TEST 13: Macro version is present on all prompt contracts (0.3ms)
✔ TEST 14: generateContentAsset uses the registry (0.4ms)
✔ TEST 15: Legacy generation paths cannot bypass macro registry for single asset generation (0.2ms)

Phase 5A Tests: 15 / 15 PASS
```
