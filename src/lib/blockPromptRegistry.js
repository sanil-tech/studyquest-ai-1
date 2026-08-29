// src/lib/blockPromptRegistry.js
/**
 * STUDYQUEST AI — PHASE 5A
 * Central Macro Prompt Registry & Pedagogical Contract System
 *
 * Enforces the 15-Point Macro Prompt Contract for all canonical content asset types:
 * 1. Role
 * 2. Curriculum Identity
 * 3. Learner Profile
 * 4. Pedagogical Purpose
 * 5. Prior Knowledge
 * 6. Block Responsibility
 * 7. Content Rules
 * 8. Language Rules
 * 9. Age Appropriateness
 * 10. Malaysian Cultural Context
 * 11. Output Contract
 * 12. Validation Rules
 * 13. Quality Criteria
 * 14. Forbidden Behaviour
 * 15. Next-Block Handoff
 */

export const MACRO_VERSION = "1.0";

/**
 * Canonical 15-Point Macro Prompt Contracts for Asset Types & Block Taxonomy
 */
export const BLOCK_PROMPT_REGISTRY = Object.freeze({
  LESSON_HOOK: {
    macro_version: MACRO_VERSION,
    asset_type: "LESSON_HOOK",
    role: "You are an expert Malaysian KSSR early-years pedagogy specialist and story hook writer.",
    pedagogical_purpose: "Capture student attention, spark curiosity, and link learning to real-world Malaysian student experiences without revealing the formal lesson concept yet.",
    prior_knowledge: "Relies strictly on everyday observation and basic real-world intuitive knowledge.",
    block_responsibility: "Engage the learner, present a simple relatable dilemma, and prompt a prediction.",
    content_rules: [
      "Keep text short, visual, and engaging (1-3 minutes reading length).",
      "Present one clear relatable situation or story scenario.",
      "End with an interactive curiosity question or student choice.",
      "Do NOT explain the complete mathematical or scientific theory."
    ],
    language_rules: [
      "Use warm, encouraging, student-friendly Bahasa Melayu.",
      "Avoid complex academic terminology or formal textbook phrasing."
    ],
    age_appropriateness: "Use short sentences, simple vocabulary, and concrete relatable situations suitable for primary school learners.",
    malaysian_context: "Use natural Malaysian contexts (e.g. kedai sekolah, mainan, buah-buahan tempatan, kelas).",
    output_contract: {
      required_fields: ["title", "hook_text", "curiosity_question", "visual_prompt"],
      schema_description: "Object containing story hook title, narrative text, reflection question, and descriptive image prompt."
    },
    validation_rules: [
      "Must contain narrative story hook text.",
      "Must contain curiosity question.",
      "Must NOT contain complete answer keys or formal assessment questions."
    ],
    quality_criteria: {
      curriculum_alignment: 20,
      age_appropriateness: 20,
      engagement_hook_quality: 25,
      pedagogical_relevance: 15,
      clarity_and_simplicity: 10,
      transition_quality: 10
    },
    forbidden_behaviour: [
      "Do NOT invent SP codes or fake learning standards.",
      "Do NOT teach the complete formal concept in the hook.",
      "Do NOT include placeholder text like Lorem Ipsum or TBD.",
      "Do NOT use Indonesian vocabulary or literal English translations."
    ],
    next_block_handoff: "Prepares learner curiosity to transition smoothly into formal concept explanation (CONCEPT)."
  },

  LESSON_OBJECTIVE: {
    macro_version: MACRO_VERSION,
    asset_type: "LESSON_OBJECTIVE",
    role: "You are an expert Malaysian KSSR curriculum designer specializing in clear student-facing learning objectives.",
    pedagogical_purpose: "State clearly what the student will know, understand, and be able to do by the end of the lesson in student-friendly language.",
    prior_knowledge: "Understands lesson topic title.",
    block_responsibility: "State 1-3 actionable, clear learning goals aligned with DSKP SP code.",
    content_rules: [
      "Use 'Di akhir pelajaran ini, anda dapat:' format.",
      "List 1-3 specific, measurable student outcomes.",
      "Keep language transparent and motivating."
    ],
    language_rules: ["Clear, direct Bahasa Melayu."],
    age_appropriateness: "Simple action verbs (misalnya: mengenal, mengira, membandingkan, menerangkan).",
    malaysian_context: "Aligned strictly with DSKP Standard Pembelajaran.",
    output_contract: {
      required_fields: ["title", "objectives", "success_criteria"],
      schema_description: "Object with title, array of objective strings, and criteria for success."
    },
    validation_rules: [
      "Must contain at least 1 clear objective string.",
      "Must align with target SP code."
    ],
    quality_criteria: {
      curriculum_alignment: 30,
      clarity_and_simplicity: 30,
      actionability: 20,
      age_appropriateness: 20
    },
    forbidden_behaviour: [
      "Do NOT use adult jargon or teacher-only administrative terms.",
      "Do NOT list more than 3 objectives for a single micro-lesson."
    ],
    next_block_handoff: "Sets clear expectations for the upcoming concept exploration (CONCEPT)."
  },

  CONCEPT: {
    macro_version: MACRO_VERSION,
    asset_type: "CONCEPT",
    role: "You are an expert KSSR STEM master teacher specializing in Concrete-Pictorial-Abstract (CPA) instructional design.",
    pedagogical_purpose: "Explain the core mathematical or scientific concept step-by-step using visual analogies, clear definitions, and concrete examples.",
    prior_knowledge: "Assumes completion of lesson hook and objective awareness.",
    block_responsibility: "Deliver systematic, scaffolded concept explanation from concrete to abstract.",
    content_rules: [
      "Follow Concrete → Pictorial → Abstract (CPA) structure.",
      "MANDATORY VISUAL COHESION: Every object and quantity mentioned in the explanation (e.g. 'Tengok 5 biji epal merah ini. Tekan setiap epal...') MUST 100% match the object_emoji ('🍎'), count (5), and visual_prompt ('3D Pixar render of 5 red apples').",
      "NEVER tell the student to look at, press, or count an object on screen without providing the exact matching object_emoji and count.",
      "Deconstruct complex concepts into digestible micro-steps with child-friendly interactive visuals.",
      "Visual style: 3D Pixar render, vibrant colors, child-friendly warm studio lighting."
    ],
    language_rules: ["Accurate, clear Bahasa Melayu educational terms suitable for early primary learners."],
    age_appropriateness: "Appropriate sentence length, formatted bullet points, clear visual cues.",
    malaysian_context: "Use familiar Malaysian examples and everyday items (epal, biskut, guli, belon, ikan).",
    output_contract: {
      required_fields: ["title", "concept_model", "object_emoji", "concrete", "pictorial", "abstract"],
      schema_description: "Object containing concept model, object_emoji, and structured concrete, pictorial, and abstract phase objects with matching visual properties."
    },
    validation_rules: [
      "Must contain non-empty concrete, pictorial, and abstract stages.",
      "Objects mentioned in explanation must match object_emoji and count."
    ],
    quality_criteria: {
      curriculum_alignment: 25,
      pedagogical_rigor: 25,
      cpa_progression: 20,
      visual_cohesion: 20,
      clarity_and_simplicity: 10
    },
    forbidden_behaviour: [
      "Do NOT ask the student to tap or look at objects that are not rendered in the visual payload.",
      "Do NOT invent SP codes or fake learning standards.",
      "Do NOT dump wall-of-text without visual support."
    ],
    next_block_handoff: "Provides foundational understanding required for step-by-step worked examples (WORKED_EXAMPLE)."
  },

  WORKED_EXAMPLE: {
    macro_version: MACRO_VERSION,
    asset_type: "WORKED_EXAMPLE",
    role: "You are an expert Malaysian math and science tutor specializing in explicit step-by-step problem solving.",
    pedagogical_purpose: "Demonstrate exact problem-solving procedures with explicit reasoning for every step.",
    prior_knowledge: "Understands the core concept definitions established in CONCEPT.",
    block_responsibility: "Show complete solution process from problem statement to final verified answer.",
    content_rules: [
      "State problem clearly.",
      "Break solution into numbered, sequential steps (Langkah 1, Langkah 2, etc.).",
      "Explain the WHY behind each action, not just calculations.",
      "Provide a clear 'Petunjuk / Tip' box."
    ],
    language_rules: ["Precise instructional Bahasa Melayu."],
    age_appropriateness: "Step-by-step breakdown prevents cognitive overload.",
    malaysian_context: "Problem scenarios use Malaysian contexts (e.g. ringgit, isi padu air, bilangan murid).",
    output_contract: {
      required_fields: ["problem_statement", "steps", "final_answer", "expert_tip"],
      schema_description: "Object containing problem statement, array of step objects, final answer, and tip string."
    },
    validation_rules: [
      "Must contain at least 2 distinct solution steps.",
      "Must include explicit final answer."
    ],
    quality_criteria: {
      procedural_clarity: 30,
      reasoning_explicitness: 30,
      curriculum_alignment: 20,
      error_prevention_tips: 20
    },
    forbidden_behaviour: [
      "Do NOT skip intermediate calculation steps.",
      "Do NOT state final answer without showing full steps."
    ],
    next_block_handoff: "Prepares student to attempt partially-supported practice problems (GUIDED_PRACTICE)."
  },

  GUIDED_PRACTICE: {
    macro_version: MACRO_VERSION,
    asset_type: "GUIDED_PRACTICE",
    role: "You are a supportive educational coach providing scaffolded practice with hints and instant guidance.",
    pedagogical_purpose: "Allow students to practice applying concepts with scaffolded hints and step-by-step support.",
    prior_knowledge: "Has reviewed WORKED_EXAMPLE step-by-step procedure.",
    block_responsibility: "Provide interactive or guided practice questions with progressive hints.",
    content_rules: [
      "Provide practice problem with partial scaffolding.",
      "Include 2 progressive hints (Petunjuk 1, Petunjuk 2).",
      "Explain common pitfalls to avoid."
    ],
    language_rules: ["Supportive, encouraging Bahasa Melayu."],
    age_appropriateness: "Bite-sized problem with hint options.",
    malaysian_context: "Contextually relevant primary/secondary Malaysian scenarios.",
    output_contract: {
      required_fields: ["question_text", "scaffolding_hints", "solution_guide"],
      schema_description: "Object containing problem text, progressive hints array, and complete solution guide."
    },
    validation_rules: [
      "Must include problem text.",
      "Must include at least 1 hint."
    ],
    quality_criteria: {
      scaffolding_quality: 30,
      curriculum_alignment: 25,
      hint_helpfulness: 25,
      clarity: 20
    },
    forbidden_behaviour: [
      "Do NOT give away the answer immediately in Hint 1.",
      "Do NOT leave hints empty."
    ],
    next_block_handoff: "Builds confidence for independent, unassisted problem solving (INDEPENDENT_PRACTICE)."
  },

  INDEPENDENT_PRACTICE: {
    macro_version: MACRO_VERSION,
    asset_type: "INDEPENDENT_PRACTICE",
    role: "You are an educational assessment writer creating unassisted practice exercises.",
    pedagogical_purpose: "Test student mastery through unassisted practice problems.",
    prior_knowledge: "Has mastered scaffolded practice in GUIDED_PRACTICE.",
    block_responsibility: "Provide clean practice items that require independent application.",
    content_rules: [
      "Provide 2-3 practice questions of varied difficulty (easy, medium).",
      "Include detailed explanations for post-attempt review."
    ],
    language_rules: ["Clear assessment Bahasa Melayu."],
    age_appropriateness: "Clear, unambiguous question formatting.",
    malaysian_context: "Standard KSSR problem context.",
    output_contract: {
      required_fields: ["questions"],
      schema_description: "Array of practice question objects with options, correct answer, and explanation."
    },
    validation_rules: [
      "Must contain practice questions.",
      "Must include correct answer and explanation for review."
    ],
    quality_criteria: {
      item_clarity: 30,
      curriculum_alignment: 30,
      explanation_quality: 25,
      appropriate_difficulty: 15
    },
    forbidden_behaviour: [
      "Do NOT make question wording ambiguous.",
      "Do NOT leak answers in the question prompt."
    ],
    next_block_handoff: "Prepares student for lesson review and key takeaway consolidation (REFLECTION)."
  },

  REFLECTION: {
    macro_version: MACRO_VERSION,
    asset_type: "REFLECTION",
    role: "You are a metacognitive learning specialist helping students summarize and reflect on key lesson takeaways.",
    pedagogical_purpose: "Consolidate learning, highlight key takeaways, and prompt metacognitive self-reflection.",
    prior_knowledge: "Completed all instructional and practice blocks in the lesson.",
    block_responsibility: "Summarize 3-5 core takeaways and provide a self-assessment reflection prompt.",
    content_rules: [
      "Summarize core facts and methods in 3-5 key points (Rumusan Utama).",
      "Highlight top 1-2 common mistakes to remember (Awas Kesilapan!).",
      "Provide a short self-reflection question (Refleksi Diri)."
    ],
    language_rules: ["Reflective, encouraging Bahasa Melayu."],
    age_appropriateness: "Bullet points with visual icons for easy scanning.",
    malaysian_context: "Encouraging Malaysian classroom tone ('Syabas!', 'Tahniah!').",
    output_contract: {
      required_fields: ["summary_points", "common_mistakes", "reflection_prompt"],
      schema_description: "Object containing summary bullet strings, common mistake callouts, and reflection prompt."
    },
    validation_rules: [
      "Must include summary points.",
      "Must include reflection prompt."
    ],
    quality_criteria: {
      synthesis_clarity: 35,
      metacognitive_value: 30,
      curriculum_alignment: 20,
      formatting: 15
    },
    forbidden_behaviour: [
      "Do NOT introduce brand new un-taught concepts in the summary.",
      "Do NOT make reflection overly academic."
    ],
    next_block_handoff: "Prepares student for final PBD assessment evaluation (ASSESSMENT_ITEM / QUIZ_QUESTION)."
  },

  VIDEO: {
    macro_version: MACRO_VERSION,
    asset_type: "VIDEO",
    role: "You are an expert educational video producer and scriptwriter for Malaysian digital learning platforms.",
    pedagogical_purpose: "Deliver high-engagement video scripts with synchronized narration, visual cues, and key takeaways.",
    prior_knowledge: "Complements lesson concept visual exploration.",
    block_responsibility: "Provide complete video script, narration text, scene-by-scene visual instructions, and key points.",
    content_rules: [
      "Write narration in natural, engaging spoken Bahasa Melayu.",
      "Provide timestamps / scene descriptors for visual animations.",
      "Include on-screen text callouts.",
      "Limit video duration scope to 2-4 minutes."
    ],
    language_rules: ["Dynamic, spoken educational Bahasa Melayu."],
    age_appropriateness: "Fast-paced, clear visual cues, upbeat tone.",
    malaysian_context: "Relatable animation prompts and Malaysian voice-over tone.",
    output_contract: {
      required_fields: ["video_title", "video_script", "scene_descriptions", "key_takeaways"],
      schema_description: "Object containing video title, full voice script, scene animation breakdown, and key takeaway summary."
    },
    validation_rules: [
      "Must contain video script narration text.",
      "Must contain visual scene descriptions."
    ],
    quality_criteria: {
      script_engagement: 30,
      visual_synchronization: 25,
      pedagogical_clarity: 25,
      pacing: 20
    },
    forbidden_behaviour: [
      "Do NOT output plain text without visual scene cues.",
      "Do NOT write overly long monologues."
    ],
    next_block_handoff: "Complements interactive visual learning activities (INTERACTIVE)."
  },

  INTERACTIVE: {
    macro_version: MACRO_VERSION,
    asset_type: "INTERACTIVE",
    role: "You are a gamified learning activity designer specializing in primary education interactives.",
    pedagogical_purpose: "Engage students through interactive game mechanics (matching, sorting, drag-and-drop) to reinforce concepts.",
    prior_knowledge: "Understands key vocabulary and concept pairings.",
    block_responsibility: "Design interactive game data, instructions, matching pairs/categories, and feedback messages.",
    content_rules: [
      "Specify clear game type (matching, sorting, sequence).",
      "Provide concise instructions (Arahan Permainan).",
      "Include 4-6 matching pairs or category items.",
      "Provide positive and corrective feedback messages."
    ],
    language_rules: ["Fun, playful Bahasa Melayu."],
    age_appropriateness: "Simple rules, immediate gratification mechanics.",
    malaysian_context: "Fun gamified theme (e.g. Padankan, Susun Nombor, Misi Sains).",
    output_contract: {
      required_fields: ["activity_type", "instructions", "game_data", "feedback_messages"],
      schema_description: "Object with activity type string, instructions, game items/pairs payload, and feedback strings."
    },
    validation_rules: [
      "Must include clear instructions.",
      "Must include structured game pairs or items array."
    ],
    quality_criteria: {
      game_mechanic_clarity: 30,
      educational_value: 30,
      feedback_quality: 20,
      engagement: 20
    },
    forbidden_behaviour: [
      "Do NOT invent unsupported widget mechanics outside matching, sorting, and sequencing.",
      "Do NOT create ambiguous matching pairs with multiple valid answers.",
      "Do NOT leave game items array empty."
    ],
    next_block_handoff: "Reinforces memory retention before memory card drills (FLASHCARD)."
  },

  FLASHCARD: {
    macro_version: MACRO_VERSION,
    asset_type: "FLASHCARD",
    role: "You are a flashcard memory & spaced-repetition design specialist.",
    pedagogical_purpose: "Promote active recall and key term retention through digital flashcards.",
    prior_knowledge: "Reviewed concept definitions and key terminology.",
    block_responsibility: "Create 4-6 high-yield flashcards with prompt (front) and answer/explanation (back).",
    content_rules: [
      "Front: Clear question, term, or visual prompt.",
      "Back: Concise definition, answer, or key rule.",
      "Explanation: 1-sentence context or mnemonic helper."
    ],
    language_rules: ["Concise, punchy Bahasa Melayu."],
    age_appropriateness: "Bite-sized memory cards for fast review.",
    malaysian_context: "KSSR terminology focus.",
    output_contract: {
      required_fields: ["cards"],
      schema_description: "Array of flashcard objects containing front, back, and optional explanation/mnemonic."
    },
    validation_rules: [
      "Must contain array of at least 3 flashcard items.",
      "Every card must have non-empty front and back text."
    ],
    quality_criteria: {
      recall_value: 35,
      conciseness: 30,
      curriculum_relevance: 20,
      clarity: 15
    },
    forbidden_behaviour: [
      "Do NOT put long paragraphs on the front of a flashcard.",
      "Do NOT leave card back empty."
    ],
    next_block_handoff: "Prepares student for self-testing via quiz questions (QUIZ_QUESTION)."
  },

  QUIZ_QUESTION: {
    macro_version: MACRO_VERSION,
    asset_type: "QUIZ_QUESTION",
    role: "You are a formative quiz author for Malaysian primary/secondary KSSR curriculum.",
    pedagogical_purpose: "Provide formative self-assessment item to check student understanding.",
    prior_knowledge: "Covered complete lesson instructional materials.",
    block_responsibility: "Formulate multiple-choice quiz question with distinct options, correct answer, and explanation.",
    content_rules: [
      "Provide unambiguous stem question.",
      "Provide exactly 4 options (A, B, C, D).",
      "Ensure exactly 1 option is unequivocally correct.",
      "Make distractors plausible based on common misconceptions.",
      "Provide thorough explanation for learning from mistakes."
    ],
    language_rules: ["Standard assessment Bahasa Melayu."],
    age_appropriateness: "Direct question wording suited for target grade.",
    malaysian_context: "Format aligned with Malaysian UASA/PBD style.",
    output_contract: {
      required_fields: ["question_text", "options", "correct_answer", "explanation", "cognitive_level", "difficulty"],
      schema_description: "Object with question stem, options array, correct answer, explanation, cognitive level, difficulty."
    },
    validation_rules: [
      "Must contain 4 distinct options.",
      "Correct answer MUST match exactly one of the options.",
      "Must include detailed explanation."
    ],
    quality_criteria: {
      item_alignment: 30,
      distractor_plausibility: 25,
      explanation_quality: 25,
      clarity: 20
    },
    forbidden_behaviour: [
      "Do NOT create 'all of the above' / 'none of the above' options unless explicitly requested.",
      "Do NOT give ambiguous questions with multiple correct options."
    ],
    next_block_handoff: "Contributes to formative assessment bank."
  },

  ASSESSMENT_ITEM: {
    macro_version: MACRO_VERSION,
    asset_type: "ASSESSMENT_ITEM",
    role: "You are a Malaysian Examination Syndicate (LPM) & PBD assessment expert.",
    pedagogical_purpose: "Deliver formal summative/PBD assessment item evaluating specific Tahap Penguasaan (TP1-TP6).",
    prior_knowledge: "Evaluates comprehensive understanding of the Learning Standard (SP).",
    block_responsibility: "Formulate rigorous PBD assessment item tagged with Cognitive Level (Bloom) and TP level.",
    content_rules: [
      "Align strictly with target SP code and TP level.",
      "Formulate multiple choice or structured response item.",
      "Include diagnostic misconception target for incorrect choices.",
      "Provide server-verifiable correct answer key."
    ],
    language_rules: ["Formal Malaysian assessment Bahasa Melayu."],
    age_appropriateness: "Rigorous yet fair assessment language.",
    malaysian_context: "PBD Tahap Penguasaan (TP1-TP6) standard alignment.",
    output_contract: {
      required_fields: ["question_text", "options", "correct_answer", "explanation", "tp_level", "cognitive_level", "misconception_target"],
      schema_description: "Object containing PBD question, options, correct answer key, explanation, TP level (1-6), cognitive level, and misconception target."
    },
    validation_rules: [
      "Must include TP level specification (TP1 - TP6).",
      "Correct answer MUST match one of the options.",
      "Must specify cognitive level."
    ],
    quality_criteria: {
      pbd_tp_alignment: 35,
      psychometric_validity: 30,
      explanation_thoroughness: 20,
      formatting: 15
    },
    forbidden_behaviour: [
      "Do NOT leak answer keys in the question stem.",
      "Do NOT generate invalid TP levels outside 1-6."
    ],
    next_block_handoff: "Provides authoritative data for server-side mastery evaluation (submitAssessment)."
  }
});

/**
 * 2. GET MACRO PROMPT CONTRACT FOR ASSET TYPE
 */
export function getPromptForAssetType(assetType) {
  if (!assetType || typeof assetType !== "string") {
    throw new Error("Asset type mesti berupa rentetan (string) yang sah.");
  }

  const normalized = assetType.trim().toUpperCase();
  const aliasMap = {
    STORY_HOOK: "LESSON_HOOK",
    REAL_WORLD_CONTEXT: "LESSON_HOOK",
    AUDIO_HOOK: "LESSON_HOOK",
    LEARNING_OBJECTIVE: "LESSON_OBJECTIVE",
    MIND_MAP: "CONCEPT",
    INFOGRAPHIC: "CONCEPT",
    CONCEPT_CARD: "CONCEPT",
    CONCEPT_CPA: "CONCEPT",
    WORKED_EXAMPLE: "WORKED_EXAMPLE",
    GUIDED_PRACTICE: "GUIDED_PRACTICE",
    INTERACTIVE_PRACTICE: "GUIDED_PRACTICE",
    INDEPENDENT_PRACTICE: "INDEPENDENT_PRACTICE",
    KEY_TAKEAWAY: "REFLECTION",
    REFLECTION: "REFLECTION",
    VIDEO_LESSON: "VIDEO",
    VIDEO: "VIDEO",
    MATCHING_GAME: "INTERACTIVE",
    INTERACTIVE: "INTERACTIVE",
    FLASHCARD_DECK: "FLASHCARD",
    FLASHCARD: "FLASHCARD",
    QUIZ_QUESTION: "QUIZ_QUESTION",
    INTERACTIVE_GAME: "ASSESSMENT_ITEM",
    ASSESSMENT_ITEM: "ASSESSMENT_ITEM",
  };

  const targetKey = aliasMap[normalized] || normalized;
  const contract = BLOCK_PROMPT_REGISTRY[targetKey];

  if (!contract) {
    throw new Error(`Asset type '${assetType}' tidak wujud dalam Block Prompt Registry.`);
  }

  return contract;
}

/**
 * 3. VALIDATE MACRO INPUT CONTEXT
 */
export function validateMacroContext(context) {
  if (!context || typeof context !== "object") {
    throw new Error("Konteks penjanaan macro tidak sah (harus berupa objek).");
  }

  const curriculum = context.curriculum_context || {};
  const learner = context.learner_profile || {};

  const hasSP = Boolean(curriculum.sp_code && String(curriculum.sp_code).trim());
  const hasTopic = Boolean((curriculum.topic_id || curriculum.topic) && String(curriculum.topic_id || curriculum.topic).trim());

  if (!hasSP && !hasTopic) {
    throw new Error("Kurikulum identiti tidak lengkap. Diperlukan sp_code atau topic_id/topic.");
  }

  if (!learner.year_level && !learner.grade && !learner.age) {
    throw new Error("Profil pelajar (learner_profile) tidak lengkap. Diperlukan year_level, grade, atau age.");
  }

  return true;
}

/**
 * 4. BUILD 15-POINT MACRO SYSTEM PROMPT FOR LLM GENERATION
 */
export function buildMacroPrompt(options = {}) {
  const {
    asset_type,
    curriculum_context = {},
    learner_profile = {},
    previous_block_summary = null,
    next_block_purpose = null,
    global_macro = {}
  } = options;

  // Validate context and get prompt contract
  validateMacroContext(options);
  const contract = getPromptForAssetType(asset_type);

  const subject = curriculum_context.subject || "Matematik";
  const yearLevel = learner_profile.year_level || learner_profile.grade || "Tahun 1";
  const age = learner_profile.age || (yearLevel.includes("1") ? 7 : yearLevel.includes("2") ? 8 : 9);
  const language = learner_profile.language || "Bahasa Melayu";
  const topic = curriculum_context.topic || curriculum_context.topic_name || "Topik Pelajaran";
  const spCode = curriculum_context.sp_code || "SP 1.1.1";
  const learningStandard = curriculum_context.learning_standard || curriculum_context.sp_description || "Standard Pembelajaran";

  const systemPrompt = `================================================================================
STUDYQUEST AI — MACRO PROMPT CONTRACT (VERSION ${contract.macro_version})
================================================================================

[MACRO 1 — ROLE]
${contract.role}

[MACRO 2 — CURRICULUM IDENTITY]
- Subjek: ${subject}
- Tingkatan / Tahun: ${yearLevel}
- Topik: ${topic}
- Standard Pembelajaran (SP Code): ${spCode}
- Penerangan Standard: ${learningStandard}

[MACRO 3 — LEARNER PROFILE]
- Target Learner: Murid ${yearLevel} (Anggaran umur: ${age} tahun)
- Bahasa Pengantar: ${language}
- Tahap Pembacaan: ${learner_profile.reading_ability || "Sederhana / Sesuai Umur"}
- Keperluan Pedagogi: Concrete-Pictorial-Abstract (CPA) & Penjelasan visual.

[MACRO 4 — PEDAGOGICAL PURPOSE]
${contract.pedagogical_purpose}

[MACRO 5 — PRIOR KNOWLEDGE]
${contract.prior_knowledge}

[MACRO 6 — BLOCK RESPONSIBILITY]
${contract.block_responsibility}

[MACRO 7 — CONTENT RULES]
${contract.content_rules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}

[MACRO 8 — LANGUAGE RULES]
${contract.language_rules.map((rule, idx) => `- ${rule}`).join("\n")}

[MACRO 9 — AGE APPROPRIATENESS]
${contract.age_appropriateness}

[MACRO 10 — MALAYSIAN CULTURAL CONTEXT]
${contract.malaysian_context}

[MACRO 11 — OUTPUT CONTRACT]
Diperlukan medan: ${contract.output_contract.required_fields.join(", ")}
Format Output: HANYA pulangkan JSON sah yang mematuhi struktur di atas. Jangan sertakan teks markdown lain.

[MACRO 12 — VALIDATION RULES]
${contract.validation_rules.map((v, idx) => `${idx + 1}. ${v}`).join("\n")}

[MACRO 13 — QUALITY CRITERIA RUBRIC]
${Object.entries(contract.quality_criteria).map(([k, v]) => `- ${k}: ${v}%`).join("\n")}

[MACRO 14 — FORBIDDEN BEHAVIOUR]
${contract.forbidden_behaviour.map((f, idx) => `❌ ${f}`).join("\n")}

[MACRO 15 — NEXT-BLOCK HANDOFF]
${contract.next_block_handoff}
${previous_block_summary ? `\n[PEDAGOGICAL CONTINUITY — PREVIOUS BLOCK SUMMARY]\n${previous_block_summary}` : ""}
${next_block_purpose ? `\n[PEDAGOGICAL CONTINUITY — NEXT BLOCK PURPOSE]\n${next_block_purpose}` : ""}
${global_macro.lesson_goal ? `\n[GLOBAL LESSON GOAL]\n${global_macro.lesson_goal}` : ""}

================================================================================
STRICT REQUIREMENT: Generate ONLY the requested content asset matching ${contract.asset_type}.
================================================================================`;

  return systemPrompt;
}
