// tests/phase5c.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { loadFunction, invokeFunction, Base44TestServer } from "./base44Harness.js";
import { getPromptForAssetType, buildMacroPrompt, BLOCK_PROMPT_REGISTRY } from "../src/lib/blockPromptRegistry.js";

const server = new Base44TestServer();
let serverUrl = "";
let generateContentAssetHandler = null;
let approveContentAssetHandler = null;

const ALL_15_CANONICAL_BLOCKS = [
  "STORY_HOOK",
  "REAL_WORLD_CONTEXT",
  "AUDIO_HOOK",
  "MIND_MAP",
  "INFOGRAPHIC",
  "CONCEPT_CARD",
  "FLASHCARD_DECK",
  "MATCHING_GAME",
  "VIDEO_LESSON",
  "WORKED_EXAMPLE",
  "GUIDED_PRACTICE",
  "INTERACTIVE_PRACTICE",
  "KEY_TAKEAWAY",
  "INTERACTIVE_GAME",
  "LEARNING_OBJECTIVE"
];

test.before(async () => {
  serverUrl = await server.start();
  const genMod = await loadFunction("./base44/functions/generateContentAsset/entry.ts");
  generateContentAssetHandler = genMod.default;

  const appMod = await loadFunction("./base44/functions/approveContentAsset/entry.ts");
  approveContentAssetHandler = appMod.default;
});

test.after(async () => {
  await server.stop();
});

test.beforeEach(() => {
  server.resetDb();
  server.db.Topic.push({ id: "top_banyak_sedikit", title: "Banyak dan Sedikit" });
  server.db.Subtopic.push({ id: "sub_membandingkan", topic_id: "top_banyak_sedikit", title: "Membandingkan Kuantiti" });
  server.db.CurriculumStandard.push({ id: "cs_1", standard_learning_code: "SP 1.1.1", topic_id: "top_banyak_sedikit" });
});

test("Test 1: All 15 canonical blocks have Macro Prompt contracts", () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    const contract = getPromptForAssetType(blockType);
    assert.ok(contract, `Block type ${blockType} must return a prompt contract.`);
    assert.ok(contract.macro_version);
    assert.ok(contract.role);
    assert.ok(contract.pedagogical_purpose);
  }
});

test("Test 2: All 15 blocks have unique pedagogical purposes", () => {
  const purposes = new Set();
  const canonicalTypes = Object.keys(BLOCK_PROMPT_REGISTRY);

  for (const key of canonicalTypes) {
    const contract = BLOCK_PROMPT_REGISTRY[key];
    assert.ok(!purposes.has(contract.pedagogical_purpose), `Duplicate purpose for ${key}`);
    purposes.add(contract.pedagogical_purpose);
  }

  assert.equal(purposes.size, canonicalTypes.length);
});

test("Test 3: All 15 blocks have block-specific quality criteria", () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    const contract = getPromptForAssetType(blockType);
    assert.ok(contract.quality_criteria);
    const sum = Object.values(contract.quality_criteria).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100, `Quality criteria for ${blockType} must sum to 100%`);
  }
});

test("Test 4: All 15 blocks have validation rules", () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    const contract = getPromptForAssetType(blockType);
    assert.ok(Array.isArray(contract.validation_rules));
    assert.ok(contract.validation_rules.length > 0);
  }
});

test("Test 5: All 15 blocks require curriculum identity", () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    assert.throws(() => {
      buildMacroPrompt({
        asset_type: blockType,
        curriculum_context: {}, // Missing sp_code and topic_id
        learner_profile: { year_level: "Tahun 1" }
      });
    }, /Kurikulum identiti tidak lengkap/);
  }
});

test("Test 6: All 15 blocks require learner context", () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    assert.throws(() => {
      buildMacroPrompt({
        asset_type: blockType,
        curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
        learner_profile: {} // Missing year_level/grade/age
      });
    }, /Profil pelajar/);
  }
});

test("Test 7: Interactive blocks cannot invent unsupported widgets", () => {
  const interactiveContract = getPromptForAssetType("INTERACTIVE");
  assert.ok(interactiveContract.forbidden_behaviour.some(rule => rule.includes("unsupported widget")));
});

test("Test 8: Video blocks contain instructional structure", () => {
  const videoContract = getPromptForAssetType("VIDEO");
  assert.ok(videoContract.output_contract.required_fields.includes("video_script"));
  assert.ok(videoContract.output_contract.required_fields.includes("scene_descriptions"));
});

test("Test 9: Assessment blocks cannot control scoring logic", () => {
  const assessmentContract = getPromptForAssetType("ASSESSMENT_ITEM");
  assert.ok(assessmentContract.next_block_handoff.includes("submitAssessment"));
});

test("Test 10: Summary blocks cannot introduce unapproved new concepts", () => {
  const reflectionContract = getPromptForAssetType("REFLECTION");
  const hasRule = reflectionContract.forbidden_behaviour.some(r => r.includes("un-taught concepts") || r.includes("brand new")) ||
                  reflectionContract.content_rules.some(r => r.includes("previously taught"));
  assert.ok(hasRule);
});

test("Test 11: Previous approved context is passed only where appropriate", () => {
  const promptWithContext = buildMacroPrompt({
    asset_type: "CONCEPT",
    curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" },
    previous_block_summary: "Learner noticed two jars containing marbles."
  });

  assert.ok(promptWithContext.includes("[PEDAGOGICAL CONTINUITY — PREVIOUS BLOCK SUMMARY]"));

  const promptWithoutContext = buildMacroPrompt({
    asset_type: "LESSON_HOOK",
    curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
    learner_profile: { year_level: "Tahun 1" }
  });

  assert.equal(promptWithoutContext.includes("[PEDAGOGICAL CONTINUITY — PREVIOUS BLOCK SUMMARY]"), false);
});

test("Test 12: Rejected assets cannot become approved assets", async () => {
  server.db.LessonBlock.push({
    id: "block_reject_5c",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "MIND_MAP",
    title: "Draft Mind Map",
    status: "draft",
    review_status: "under_review",
    quality_score: 80,
    payload: { markdown: "Concept map" }
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_reject_5c",
    action: "reject",
    rejection_reason: "Terlalu abstrak untuk Tahun 1"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.review_status, "rejected");

  const record = server.db.LessonBlock.find(b => b.id === "block_reject_5c");
  assert.equal(record.review_status, "rejected");
});

test("Test 13: Regeneration does not overwrite approved assets", async () => {
  server.db.LessonBlock.push({
    id: "block_approved_concept",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    block_type: "CONCEPT_CPA",
    title: "Approved Concept V1",
    status: "draft",
    review_status: "approved",
    quality_score: 95
  });

  const payload = {
    topic_id: "top_banyak_sedikit",
    subtopic_id: "sub_membandingkan",
    sp_code: "SP 1.1.1",
    asset_type: "CONCEPT",
    subject_name: "Matematik",
    year_level: "Tahun 1"
  };

  const res = await invokeFunction(generateContentAssetHandler, payload, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 201);
  assert.notEqual(res.data.asset_id, "block_approved_concept");

  const approvedInDb = server.db.LessonBlock.find(b => b.id === "block_approved_concept");
  assert.equal(approvedInDb.review_status, "approved");
});

test("Test 14: Published snapshots remain immutable", async () => {
  server.db.LessonBlock.push({
    id: "block_published_5c",
    sp_code: "SP 1.1.1",
    topic_id: "top_banyak_sedikit",
    status: "published",
    review_status: "published"
  });

  const res = await invokeFunction(approveContentAssetHandler, {
    asset_id: "block_published_5c",
    action: "approve"
  }, {
    serverUrl,
    userToken: "admin-token"
  });

  assert.equal(res.status, 422);
  assert.equal(res.data.error_code, "PUBLISHED_ASSET_IMMUTABLE");
});

test("Test 15: All canonical blocks use the Macro Prompt Registry", async () => {
  for (const blockType of ALL_15_CANONICAL_BLOCKS) {
    const prompt = buildMacroPrompt({
      asset_type: blockType,
      curriculum_context: { topic_id: "top_banyak_sedikit", sp_code: "SP 1.1.1" },
      learner_profile: { year_level: "Tahun 1" }
    });
    assert.ok(prompt.includes("STUDYQUEST AI — MACRO PROMPT CONTRACT"));
  }
});
