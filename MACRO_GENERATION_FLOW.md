# MACRO GENERATION FLOW (PHASE 5A)

This document describes the runtime execution flow when a macro-driven single content asset is generated via `generateContentAsset`.

---

## 1. RUNTIME GENERATION FLOW

```text
1. CLIENT REQUEST (AdminContentStudio)
   ├── asset_type: "CONCEPT"
   ├── topic_id: "top_pecahan_y4"
   ├── sp_code: "SP 1.1.1"
   └── year_level: "Tahun 4"
        │
        ▼
2. CANONICAL GENERATOR (base44/functions/generateContentAsset/entry.ts)
   ├── Authenticates & authorizes Admin role
   ├── Validates curriculum identity (topic_id / subtopic_id / sp_code)
   └── Checks duplicate published/approved asset protection
        │
        ▼
3. MACRO PROMPT REGISTRY (base44/shared/blockPromptRegistry.ts)
   ├── Resolves prompt contract for asset_type (getPromptForAssetType)
   ├── Validates curriculum & learner profile context (validateMacroContext)
   └── Compiles 15-Point Macro System Prompt (buildMacroPrompt)
        │
        ▼
4. CORE LLM INTEGRATION (Gemini 3 Flash)
   ├── Receives 15-point structured macro system prompt
   └── Generates structured JSON matching asset output schema
        │
        ▼
5. QUALITY SHIELD & PERSISTENCE
   ├── Evaluates Quality Shield score (evaluateAssetQuality)
   └── Saves asset into database with review_status = "under_review", status = "draft"
```

---

## 2. PEDAGOGICAL CONTINUITY & HANDOFF

When generating sequential assets or compiling lessons, `buildMacroPrompt` accepts optional `previous_block_summary` and `next_block_purpose` options. This enables pedagogical continuity across blocks without granting the LLM authority over lesson structure or ordering.
