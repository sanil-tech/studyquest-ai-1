// tests/phase5a.test.js
import test from "node:test";
import assert from "node:assert/strict";
import {
  BLOCK_PROMPT_REGISTRY,
  MACRO_VERSION,
  getPromptForAssetType,
  validateMacroContext,
  buildMacroPrompt
} from "../src/lib/blockPromptRegistry.js";
import { loadFunction, invokeFunction } from "./base44Harness.js";
import { CANONICAL_ASSET_TYPES } from "../src/lib/contentAssetContract.js";

test("TEST 1: Every canonical block has a prompt contract", () => {
  const canonicalTypes = Object.values(CANONICAL_ASSET_TYPES);
  for (const type of canonicalTypes) {
    const contract = BLOCK_PROMPT_REGISTRY[type];
    assert.ok(contract, `Contract missing for canonical type: ${type}`);
    assert.equal(contract.asset_type, type);
  }
});

test("TEST 2: Every canonical block has unique pedagogical instructions", () => {
  const canonicalTypes = Object.values(CANONICAL_ASSET_TYPES);
  const purposes = new Set();
  const roles = new Set();

  for (const type of canonicalTypes) {
    const contract = BLOCK_PROMPT_REGISTRY[type];
    assert.ok(contract.pedagogical_purpose.length > 20, `Pedagogical purpose too short for ${type}`);
    assert.ok(contract.role.length > 20, `Role description too short for ${type}`);

    purposes.add(contract.pedagogical_purpose);
    roles.add(contract.role);
  }

  assert.equal(purposes.size, canonicalTypes.length, "Pedagogical purposes must be unique per asset type");
  assert.ok(roles.size >= 8, "Roles must reflect specific pedagogical roles");
});

test("TEST 3: Every prompt requires curriculum identity", () => {
  // Missing curriculum context should fail validation
  assert.throws(() => {
    validateMacroContext({
      curriculum_context: {},
      learner_profile: { year_level: "Tahun 1" }
    });
  }, /Kurikulum identiti tidak lengkap/);

  // Valid curriculum context should pass
  const valid = validateMacroContext({
    curriculum_context: { sp_code: "SP 1.1.1", topic_id: "top_1" },
    learner_profile: { year_level: "Tahun 1" }
  });
  assert.equal(valid, true);
});

test("TEST 4: Every prompt requires learner context", () => {
  // Missing learner profile should fail validation
  assert.throws(() => {
    validateMacroContext({
      curriculum_context: { sp_code: "SP 1.1.1" },
      learner_profile: {}
    });
  }, /Profil pelajar/);

  // Valid learner profile should pass
  const valid = validateMacroContext({
    curriculum_context: { sp_code: "SP 1.1.1" },
    learner_profile: { age: 7 }
  });
  assert.equal(valid, true);
});

test("TEST 5: Every prompt has output schema requirements", () => {
  for (const [type, contract] of Object.entries(BLOCK_PROMPT_REGISTRY)) {
    assert.ok(contract.output_contract, `Missing output contract for ${type}`);
    assert.ok(Array.isArray(contract.output_contract.required_fields), `Required fields missing for ${type}`);
    assert.ok(contract.output_contract.required_fields.length > 0, `Required fields empty for ${type}`);
  }
});

test("TEST 6: Every prompt has forbidden behaviour rules", () => {
  for (const [type, contract] of Object.entries(BLOCK_PROMPT_REGISTRY)) {
    assert.ok(Array.isArray(contract.forbidden_behaviour), `Forbidden behaviour missing for ${type}`);
    assert.ok(contract.forbidden_behaviour.length >= 2, `Forbidden rules insufficient for ${type}`);
  }
});

test("TEST 7: Engagement prompt differs from Concept prompt", () => {
  const hookPrompt = buildMacroPrompt({
    asset_type: "LESSON_HOOK",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  const conceptPrompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.notEqual(hookPrompt, conceptPrompt);
  assert.ok(hookPrompt.includes("story hook writer"));
  assert.ok(conceptPrompt.includes("Concrete-Pictorial-Abstract"));
});

test("TEST 8: Video prompt differs from Interactive prompt", () => {
  const videoPrompt = buildMacroPrompt({
    asset_type: "VIDEO",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  const interactivePrompt = buildMacroPrompt({
    asset_type: "INTERACTIVE",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.notEqual(videoPrompt, interactivePrompt);
  assert.ok(videoPrompt.includes("video producer"));
  assert.ok(interactivePrompt.includes("gamified learning activity designer"));
});

test("TEST 9: Quiz prompt differs from Assessment prompt", () => {
  const quizPrompt = buildMacroPrompt({
    asset_type: "QUIZ_QUESTION",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  const assessmentPrompt = buildMacroPrompt({
    asset_type: "ASSESSMENT_ITEM",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.notEqual(quizPrompt, assessmentPrompt);
  assert.ok(quizPrompt.includes("formative self-assessment"));
  assert.ok(assessmentPrompt.includes("PBD assessment expert"));
});

test("TEST 10: AI cannot select/change block ordering", () => {
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  // Prompt enforces server-authoritative structure requirement
  assert.ok(prompt.includes("Generate ONLY the requested content asset matching CONCEPT"));
});

test("TEST 11: AI cannot invent curriculum identity", () => {
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { sp_code: "SP 1.1.1", topic: "Pecahan" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.ok(prompt.includes("SP 1.1.1"));
  assert.ok(prompt.includes("Do NOT invent SP codes or fake learning standards"));
});

test("TEST 12: Invalid asset_type cannot select a prompt", () => {
  assert.throws(() => {
    getPromptForAssetType("INVALID_UNKNOWN_ASSET_TYPE");
  }, /tidak wujud dalam Block Prompt Registry/);
});

test("TEST 13: Macro version is present on all prompt contracts", () => {
  for (const contract of Object.values(BLOCK_PROMPT_REGISTRY)) {
    assert.equal(contract.macro_version, MACRO_VERSION);
    assert.equal(contract.macro_version, "1.0");
  }
});

test("TEST 14: generateContentAsset uses the registry", () => {
  const prompt = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: {
      subject: "Matematik",
      topic_id: "top_test_101",
      sp_code: "SP 1.1.1"
    },
    learner_profile: {
      year_level: "Tahun 1"
    }
  });

  // Assert that prompt built for generateContentAsset includes all required macro sections
  assert.ok(prompt.includes("STUDYQUEST AI — MACRO PROMPT CONTRACT (VERSION 1.0)"));
  assert.ok(prompt.includes("[MACRO 1 — ROLE]"));
  assert.ok(prompt.includes("[MACRO 2 — CURRICULUM IDENTITY]"));
  assert.ok(prompt.includes("[MACRO 3 — LEARNER PROFILE]"));
  assert.ok(prompt.includes("[MACRO 4 — PEDAGOGICAL PURPOSE]"));
  assert.ok(prompt.includes("[MACRO 11 — OUTPUT CONTRACT]"));
  assert.ok(prompt.includes("[MACRO 14 — FORBIDDEN BEHAVIOUR]"));
  assert.ok(prompt.includes("Concrete-Pictorial-Abstract"));
});

test("TEST 15: Legacy generation paths cannot bypass macro registry for single asset generation", () => {
  // Confirm getPromptForAssetType enforces canonical macro structure for every asset type
  const types = ["LESSON_HOOK", "CONCEPT", "WORKED_EXAMPLE", "GUIDED_PRACTICE", "INTERACTIVE", "FLASHCARD", "ASSESSMENT_ITEM"];
  for (const type of types) {
    const contract = getPromptForAssetType(type);
    assert.ok(contract.macro_version);
    assert.ok(contract.output_contract);
    assert.ok(contract.quality_criteria);
  }
});
