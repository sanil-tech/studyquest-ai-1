// src/services/aiContentFiller.js
// Phase 2 of the Hybrid Pipeline: AI Content Fill
// Single focused LLM call. AI fills content, never structure.

import { base44 } from "../api/base44Client.js";
import { buildLessonShell, validateLessonShell, getWidgetSeedSchema, SUPPORTED_WIDGETS } from "./lessonShellBuilder.js";

/**
 * Builds the AI prompt that fills content for a pre-built lesson shell.
 * The prompt is hyper-focused: AI receives the exact JSON shape it must return,
 * with clear instructions for each field. No structural decisions.
 *
 * @param {object} metadata - shell.metadata
 * @returns {string} The system prompt for the LLM
 */
function buildContentFillPrompt(metadata) {
  const {
    subject,
    grade,
    sp_code,
    sp_description,
    topic,
    target_tp,
    mode,
    mascot,
    widget_type,
    pedagogy_context
  } = metadata;

  const widgetSeedSchema = getWidgetSeedSchema(widget_type);
  const widgetSchemaStr = widgetSeedSchema
    ? JSON.stringify(widgetSeedSchema, null, 2)
    : '{ "instruction_context": "string" }';

  const pedagogyBlock = pedagogy_context
    ? `
PEDAGOGY CONTEXT (use this to guide your content):
- Teaching Strategy: ${pedagogy_context.teaching_strategy?.join(", ") || "General"}
- Real-World Anchor: ${pedagogy_context.real_world_context?.join(", ") || "Daily life situations"}
- Visual Method: ${pedagogy_context.visual_method?.join(", ") || "Visual diagrams"}
- Common Misconception to Address: ${pedagogy_context.common_misconception || "None specified"}
- Suggested Activity: ${pedagogy_context.suggested_activity || "Interactive exercise"}`
    : "";

  const languageRules = mode === "JUNIOR"
    ? `
CHILD-FRIENDLY LANGUAGE RULES (CRITICAL — ages 7-9):
- Use short sentences (maximum 8-10 words per sentence)
- BANNED: Academic terms like "Perwakilan Visual", "Analisis Konsep", "Aplikasi Kehidupan Harian"
- BANNED: Raw DSKP phrases like "${sp_description}" verbatim — rephrase in child language
- BANNED: Placeholder text like "Pilihan A (Jawapan Tepat)" or "Kategori 1"
- Use concrete objects children know: biskut, belon, epal, kucing, gula-gula
- Mascot ${mascot} speaks warmly, like a fun older friend
- All quiz options must be REAL, SPECIFIC answers — never generic labels`
    : `
STUDENT LANGUAGE RULES (ages 10-12):
- Clear, age-appropriate language with proper terminology introduced gradually
- BANNED: Raw DSKP code references in student-facing text
- BANNED: Placeholder text — all content must be real and specific
- Mascot ${mascot} is a clever problem-solving companion
- Use KBAT (Higher Order Thinking Skills) question stems`;

  return `You are an expert ${subject} curriculum content writer for Malaysian KSSR primary students (${grade}).

YOUR ONLY TASK: Generate lesson content to fill an 8-block lesson shell.
You do NOT decide the lesson structure — it is already fixed.
You do NOT choose the widget type — it is already "${widget_type}".
You do NOT set reward amounts — they are already calculated.

LESSON PARAMETERS:
- Subject: ${subject}
- Year: ${grade}
- Topic: ${topic}
- SK Code: ${sp_code.split(".").slice(0, 2).join(".")}
- SP Code: ${sp_code} — ${sp_description}
- Target Mastery Level: ${target_tp}
- Mascot: ${mascot}
- Widget Type: ${widget_type}
${pedagogyBlock}
${languageRules}

RETURN VALID JSON ONLY (no markdown code blocks, no extra text).
The JSON must have exactly this shape:

{
  "story_hook": {
    "story_text": "A 2-3 sentence story hook that introduces the topic through ${mascot}'s adventure. Must be specific to '${topic}', NOT generic.",
    "mascot_dialogue": "A warm 1-sentence greeting from ${mascot} to the student. Use {student_name} placeholder.",
    "tts_script": "Clean version of mascot_dialogue for text-to-speech (no emojis, no special chars)"
  },
  "learning_objective": {
    "i_can_statement": "A child-friendly 'Saya boleh...' statement. Example: 'Saya boleh membandingkan kuantiti banyak dan sedikit.'"
  },
  "concept_cpa": {
    "concrete": {
      "title": "Short title for the Concrete phase",
      "explanation": "Explain the concept using REAL physical objects children can touch/see. Minimum 2 sentences.",
      "visual_prompt": "Image generation prompt: describe a child-friendly illustration for this concept"
    },
    "pictorial": {
      "title": "Short title for the Pictorial phase",
      "explanation": "Explain using drawings, diagrams, or visual representations. Minimum 2 sentences.",
      "visual_prompt": "Image generation prompt for a diagram/visual aid"
    },
    "abstract": {
      "title": "Short title for the Abstract phase",
      "explanation": "State the rule, formula, or principle in simple terms. Minimum 2 sentences.",
      "key_term": "One key vocabulary word for this topic",
      "key_definition": "Child-friendly definition of the key term"
    }
  },
  "worked_example": {
    "problem_statement": "A specific, realistic math/science/language problem. NOT generic.",
    "solution_steps": [
      "Step 1: ...",
      "Step 2: ...",
      "Step 3: ..."
    ],
    "common_mistake": "What students commonly get wrong, and why",
    "correct_reasoning": "Why the correct approach works"
  },
  "practice": {
    "instruction": "A 1-sentence instruction for the ${widget_type} widget activity, specific to ${topic}",
    "seed_data": ${widgetSchemaStr}
  },
  "quiz": {
    "questions": [
      {
        "stem": "Question 1 specific to ${topic}",
        "options": ["Correct answer", "Plausible wrong answer 1", "Plausible wrong answer 2"],
        "correct_index": 0,
        "explanation": "Why this is correct — educational, not just 'correct!'",
        "misconception_tag": "What misconception the wrong answers test"
      },
      {
        "stem": "Question 2 ...",
        "options": ["...", "...", "..."],
        "correct_index": 0,
        "explanation": "...",
        "misconception_tag": "..."
      },
      {
        "stem": "Question 3 ...",
        "options": ["...", "...", "..."],
        "correct_index": 0,
        "explanation": "...",
        "misconception_tag": "..."
      }
    ]
  },
  "key_takeaway": {
    "summary_points": [
      "Key point 1 — what students must remember",
      "Key point 2 — the most important rule/concept",
      "Key point 3 — how to apply this in daily life"
    ],
    "memory_tip": "A memorable tip, mnemonic, or rhyme to help remember the concept",
    "flashcards": [
      { "term": "Key term 1", "definition": "Definition 1" },
      { "term": "Key term 2", "definition": "Definition 2" }
    ]
  },
  "celebration": {
    "celebration_message": "A personalized congratulation using {student_name}. Warm, enthusiastic, specific to ${topic}.",
    "badge_name": "A fun badge name like 'Wira Nombor' or 'Pakar Wang'"
  }
}

CRITICAL RULES:
1. Every answer, option, and example MUST be specific to "${topic}" — zero generic placeholders.
2. Quiz questions must test REAL understanding, not recognition of "correct" labels.
3. Worked example must show a COMPLETE step-by-step solution a teacher would use.
4. CPA phases must follow Concrete → Pictorial → Abstract progression with REAL content at each level.
5. The seed_data for the "${widget_type}" widget must match the schema exactly.
6. Minimum 3 quiz questions, each with 3 options.`;
}

/**
 * Merges AI-generated content into a pre-built lesson shell.
 *
 * @param {object} shell - The empty lesson shell from buildLessonShell()
 * @param {object} aiContent - The AI-generated content object
 * @returns {object} The filled lesson shell
 */
function mergeContentIntoShell(shell, aiContent) {
  const filled = JSON.parse(JSON.stringify(shell));

  // Block 1: STORY_HOOK
  if (aiContent.story_hook) {
    filled.blocks[0].content.story_text = aiContent.story_hook.story_text || "";
    filled.blocks[0].content.mascot_dialogue = aiContent.story_hook.mascot_dialogue || "";
    filled.blocks[0].content.tts_script = aiContent.story_hook.tts_script || aiContent.story_hook.mascot_dialogue || "";
  }

  // Block 2: LEARNING_OBJECTIVE
  if (aiContent.learning_objective) {
    filled.blocks[1].content.i_can_statement = aiContent.learning_objective.i_can_statement || "";
  }

  // Block 3: CONCEPT_CPA
  if (aiContent.concept_cpa) {
    ["concrete", "pictorial", "abstract"].forEach((phase) => {
      if (aiContent.concept_cpa[phase]) {
        Object.assign(filled.blocks[2].content[phase], aiContent.concept_cpa[phase]);
      }
    });
  }

  // Block 4: WORKED_EXAMPLE
  if (aiContent.worked_example) {
    filled.blocks[3].content.problem_statement = aiContent.worked_example.problem_statement || "";
    filled.blocks[3].content.solution_steps = aiContent.worked_example.solution_steps || [];
    filled.blocks[3].content.common_mistake = aiContent.worked_example.common_mistake || "";
    filled.blocks[3].content.correct_reasoning = aiContent.worked_example.correct_reasoning || "";
  }

  // Block 5: INTERACTIVE_PRACTICE
  if (aiContent.practice) {
    filled.blocks[4].content.instruction = aiContent.practice.instruction || "";
    filled.blocks[4].content.seed_data = aiContent.practice.seed_data || {};
  }

  // Block 6: KNOWLEDGE_CHECK
  if (aiContent.quiz?.questions) {
    filled.blocks[5].content.questions = aiContent.quiz.questions.map((q) => ({
      stem: q.stem || q.question || "",
      options: Array.isArray(q.options) ? q.options : [],
      correct_index: q.correct_index ?? 0,
      explanation: q.explanation || "",
      tp_level: shell.metadata.target_tp,
      misconception_tag: q.misconception_tag || ""
    }));
  }

  // Block 7: KEY_TAKEAWAY
  if (aiContent.key_takeaway) {
    filled.blocks[6].content.summary_points = aiContent.key_takeaway.summary_points || [];
    filled.blocks[6].content.memory_tip = aiContent.key_takeaway.memory_tip || "";
    filled.blocks[6].content.flashcards = aiContent.key_takeaway.flashcards || [];
  }

  // Block 8: MISSION_COMPLETE
  if (aiContent.celebration) {
    filled.blocks[7].content.celebration_message = aiContent.celebration.celebration_message || "";
    filled.blocks[7].content.badge_name = aiContent.celebration.badge_name || "";
  }

  return filled;
}

/**
 * Calls the LLM to generate content for a lesson shell.
 *
 * @param {object} metadata - shell.metadata
 * @returns {Promise<object|null>} AI-generated content object, or null on failure
 */
async function callLLMForContent(metadata) {
  const prompt = buildContentFillPrompt(metadata);

  try {
    // Try Base44 function invoke
    if (base44?.functions?.invoke) {
      const res = await base44.functions.invoke("generateAIContent", {
        prompt,
        sp_code: metadata.sp_code,
        subject: metadata.subject,
        grade: metadata.grade,
        topic: metadata.topic,
        mode: "CONTENT_FILL_V2"
      });

      if (res?.data?.content) {
        return typeof res.data.content === "string"
          ? JSON.parse(res.data.content)
          : res.data.content;
      }

      if (res?.data?.missionPackage) {
        // Legacy response — try to extract usable content
        return null;
      }
    }

    // Try Base44 Core text generation
    if (base44?.integrations?.Core?.generateText) {
      const res = await base44.integrations.Core.generateText({ prompt });
      if (res?.text) {
        // Strip markdown code blocks if present
        let cleaned = res.text.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        }
        return JSON.parse(cleaned);
      }
    }
  } catch (err) {
    console.warn("[aiContentFiller] LLM call failed:", err.message);
  }

  return null;
}

/**
 * Main entry point: Generates a complete, validated lesson.
 *
 * Pipeline:
 *   Phase 1: buildLessonShell() → deterministic structure
 *   Phase 2: callLLMForContent() → AI content fill
 *   Phase 3: validateLessonShell() → quality gate
 *
 * @param {object} params
 * @param {string} params.subject
 * @param {string} params.grade
 * @param {string} params.sk_code
 * @param {string} params.sp_code
 * @param {string} params.sp_description
 * @param {string} params.topic
 * @param {string} params.target_tp
 * @returns {Promise<object>} { success, lesson, validation, prompt_used }
 */
export async function generateLesson({
  subject = "Matematik",
  grade = "Tahun 1",
  sk_code = "1.1",
  sp_code = "1.1.1",
  sp_description = "",
  topic = "",
  target_tp = "TP3"
}) {
  // PHASE 1: Deterministic Shell Assembly
  const shell = buildLessonShell({
    subject,
    grade,
    sk_code,
    sp_code,
    sp_description,
    topic,
    target_tp
  });

  // PHASE 2: AI Content Fill
  const aiContent = await callLLMForContent(shell.metadata);

  let filledShell;
  if (aiContent) {
    filledShell = mergeContentIntoShell(shell, aiContent);
  } else {
    // AI failed — return shell with empty content
    // The UI should show a "content generation pending" state
    console.warn("[aiContentFiller] AI content generation failed. Returning empty shell.");
    filledShell = shell;
  }

  // PHASE 3: Validation
  const validation = validateLessonShell(filledShell);

  const prompt = buildContentFillPrompt(shell.metadata);

  return {
    success: validation.valid,
    lesson: filledShell,
    validation,
    prompt_used: prompt,
    ai_content_received: !!aiContent,
    metadata: shell.metadata
  };
}

/**
 * Retry-per-field: If specific blocks failed validation, regenerate ONLY those blocks.
 * Saves ~80% token cost vs full regeneration.
 *
 * @param {object} lesson - The filled lesson shell
 * @param {string[]} failedFields - e.g. ["quiz", "worked_example"]
 * @returns {Promise<object>} Updated lesson
 */
export async function retryFailedBlocks(lesson, failedFields = []) {
  if (!lesson || failedFields.length === 0) return lesson;

  // Build a targeted prompt for only the failed fields
  const metadata = lesson.metadata;
  const prompt = buildContentFillPrompt(metadata);

  // For now, retry the full content fill and merge only failed blocks
  const aiContent = await callLLMForContent(metadata);
  if (!aiContent) return lesson;

  const updated = JSON.parse(JSON.stringify(lesson));

  const fieldToBlockIndex = {
    story_hook: 0,
    learning_objective: 1,
    concept_cpa: 2,
    worked_example: 3,
    practice: 4,
    quiz: 5,
    key_takeaway: 6,
    celebration: 7
  };

  const tempFilled = mergeContentIntoShell(lesson, aiContent);

  failedFields.forEach((field) => {
    const idx = fieldToBlockIndex[field];
    if (idx !== undefined && tempFilled.blocks[idx]) {
      updated.blocks[idx].content = tempFilled.blocks[idx].content;
    }
  });

  return updated;
}

/**
 * Generates the AI prompt text without calling the LLM.
 * Useful for preview in Admin Content Studio.
 *
 * @param {object} params - Same as generateLesson
 * @returns {string} The prompt text
 */
export function previewPrompt(params) {
  const shell = buildLessonShell(params);
  return buildContentFillPrompt(shell.metadata);
}
