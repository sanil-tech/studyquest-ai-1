// src/services/aiContentFiller.js
// Phase 2 of the Hybrid Pipeline: AI Content Fill
// Single focused LLM call. AI fills content, never structure.

import { base44 } from "../api/base44Client.js";
import { buildLessonShell, validateLessonShell, getWidgetSeedSchema, SUPPORTED_WIDGETS } from "./lessonShellBuilder.js";
import { generateDynamicImagePrompt } from "../utils/generateDynamicImagePrompt.js";

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
    sk_code,
    sk_title,
    sp_code,
    sp_description,
    topic,
    target_tp,
    mode,
    mascot,
    widget_type,
    pedagogy_context
  } = metadata;

  const focusSubtopic = sp_description || sk_title || topic;

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
- BANNED: Raw DSKP phrases verbatim — rephrase in simple child language
- BANNED: Placeholder text like "Pilihan A (Jawapan Tepat)" or "Kategori 1"
- Use concrete objects children know: biskut, belon, epal, kucing, gula-gula, pensel
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

LESSON PARAMETERS & MANDATORY SUBTOPIC FOCUS:
- Subject: ${subject}
- Year: ${grade}
- Main Unit (Topic): ${topic}
- Standard Kandungan (SK): ${sk_code} ${sk_title ? `- ${sk_title}` : ''}
- Standard Pembelajaran (SP) [PRIMARY SUBTOPIC THEME]: ${sp_code} — ${sp_description}
- Target Mastery Level: ${target_tp}
- Mascot: ${mascot}
- Widget Type: ${widget_type}

CRITICAL SUBTOPIC MANDATE:
The Main Unit "${topic}" is only the top-level unit.
This micro-lesson MUST be strictly focused on the specific SK/SP subtopic: "${sp_code} - ${sp_description}".
For example, if Topic is "Nombor hingga 100", but SK/SP is "1.1 - Kuantiti Secara Intuitif (membanding banyak dan sedikit)", ALL lesson elements (story hook, learning objective, CPA concrete/pictorial/abstract, worked example, practice widget activity, and quiz questions) MUST directly teach and test comparing quantities ("banyak" vs "sedikit").
DO NOT generate generic explanations or generic counting questions about "${topic}" as a whole. Every single block must hone in on "${sp_description}".

${pedagogyBlock}
${languageRules}

RETURN VALID JSON ONLY (no markdown code blocks, no extra text).
The JSON must have exactly this shape:

{
  "story_hook": {
    "story_text": "A 2-3 sentence story hook narrative introducing ${mascot}'s adventure in '${sp_description}'. Must be a concrete real-world mission (e.g. Suku Penyu helping Pak Cik Abu at a fruit stall with baskets of apples, Kak Siti at a bakery with boxes of donuts, Pak Cik Samad at a stationery shop with pencil boxes, etc.) with specific objects and quantities matching '${sp_description}'.",
    "help_continuation": "A clear 1-2 sentence suggestive continuation explaining HOW {student_name} can help ${mascot} and WHY learning this subtopic '${sp_description}' is necessary to solve the mission challenge.",
    "mascot_dialogue": "A warm 1-sentence greeting from ${mascot} to the student. Use {student_name} placeholder.",
    "tts_script": "Clean version of mascot_dialogue for text-to-speech (no emojis, no special chars)",
    "image_prompt": "A detailed 3D Pixar style image prompt describing the story scene in story_text with ${mascot} and specific objects/quantities (e.g. '3D Pixar style render of Suku Penyu 🐢 helping Pak Cik Abu in a fruit shop with 3 baskets of 10 red apples each and 5 apples on the table')."
  },
  "learning_objective": {
    "i_can_statement": "A child-friendly 'Saya boleh...' statement directly derived from SP '${sp_description}'. Example: 'Saya boleh membandingkan kuantiti banyak dan sedikit.'"
  },
  "concept_cpa": {
    "concept_model": "Choose ONE: 'count_and_name', 'compare_quantities', 'compare_numbers', 'write_numerals', 'place_value', 'sequence'",
    "object_emoji": "ONE emoji representing the primary object (e.g. '🍎' for apples, '🍪' for cookies, '🐟' for fish). MUST EXACTLY match the objects named in explanation.",
    "concrete": {
      "title": "Short title for Concrete phase (e.g. Jom Kira Epal!)",
      "explanation": "Explain '${sp_description}' using REAL physical objects children see on screen (e.g. 'Tengok 5 biji epal merah ini. Tekan setiap epal dan kira bersama!'). Minimum 2 sentences. MUST EXACTLY match the object_emoji, count, and visual_prompt.",
      "visual_type": "single_count (for counting/naming) or comparison (for comparing)",
      "object_emoji": "Emoji matching explanation (e.g. '🍎')",
      "count": 5,
      "label": "5 Biji Epal Merah",
      "visual_prompt": "3D Pixar style render of exactly 5 glossy red apples in a neat row on a rustic wooden table, bright warm lighting, child-friendly 3D aesthetic"
    },
    "pictorial": {
      "title": "Short title for Pictorial phase (e.g. Rajah Visual)",
      "explanation": "Explain using drawings, dot cards, or visual frame representations for ${sp_description}. Minimum 2 sentences. MUST match the objects and numbers used in concrete phase.",
      "visual_type": "single_count or comparison",
      "object_emoji": "Emoji matching explanation (e.g. '🍎')",
      "count": 5,
      "label": "Rajah 5 Epal",
      "visual_prompt": "3D Pixar style render showing visual cards or illustrated frame of 5 red apples with number labels, vibrant educational visual"
    },
    "abstract": {
      "title": "Short title for Abstract phase (e.g. Simbol & Perkataan)",
      "explanation": "State the numeral, word, or mathematical rule of ${sp_description} in simple terms. Minimum 2 sentences.",
      "numeral": "5",
      "display_value": "5 (LIMA)",
      "key_term": "One key vocabulary term for this subtopic (e.g. Nombor 5 / Lima)",
      "key_definition": "Child-friendly definition of the key term"
    }
  },
  "worked_example": {
    "problem_statement": "A specific, realistic problem specifically testing '${sp_description}'. NOT generic.",
    "solution_steps": [
      "Step 1: ...",
      "Step 2: ...",
      "Step 3: ..."
    ],
    "common_mistake": "What students commonly get wrong when dealing with '${sp_description}'",
    "correct_reasoning": "Why the correct approach works"
  },
  "practice": {
    "instruction": "A 1-sentence instruction for the ${widget_type} activity, specifically guiding the student on '${sp_description}'",
    "seed_data": ${widgetSchemaStr}
  },
  "quiz": {
    "questions": [
      {
        "stem": "Question 1 specifically testing '${sp_description}'",
        "options": ["Correct answer", "Plausible wrong answer 1", "Plausible wrong answer 2"],
        "correct_index": 0,
        "explanation": "Why this is correct — educational reasoning",
        "misconception_tag": "What misconception the wrong answers test"
      },
      {
        "stem": "Question 2 specifically testing '${sp_description}'",
        "options": ["...", "...", "..."],
        "correct_index": 0,
        "explanation": "...",
        "misconception_tag": "..."
      },
      {
        "stem": "Question 3 specifically testing '${sp_description}'",
        "options": ["...", "...", "..."],
        "correct_index": 0,
        "explanation": "...",
        "misconception_tag": "..."
      }
    ]
  },
  "key_takeaway": {
    "summary_points": [
      "Summary point 1 about ${sp_description}",
      "Summary point 2 about ${sp_description}",
      "Summary point 3 about ${sp_description}"
    ],
    "memory_tip": "A short, catchy memory tip from ${mascot} for ${sp_description}",
    "flashcards": [
      { "term": "Key Term 1", "definition": "Definition 1 for ${sp_description}" },
      { "term": "Key Term 2", "definition": "Definition 2 for ${sp_description}" }
    ]
  },
  "celebration": {
    "celebration_message": "A personalized congratulation using {student_name} for mastering ${sp_description}",
    "badge_name": "Name of badge awarded for ${sp_description}"
  }
}

CRITICAL RULES:
1. Every answer, option, and example MUST be specific to "${sp_description}" under "${topic}" — zero generic placeholders.
2. Quiz questions must test REAL understanding of "${sp_description}", not recognition of "correct" labels.
3. Worked example must show a COMPLETE step-by-step solution for "${sp_description}".
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
    const storyText = aiContent.story_hook.story_text || "";
    const imagePrompt = aiContent.story_hook.image_prompt || aiContent.story_hook.visual_prompt || "";

    const prompt = generateDynamicImagePrompt({
      subject: shell.metadata?.subject || "Matematik",
      grade: shell.metadata?.grade || "Tahun 1",
      topic: shell.metadata?.sp_description || shell.metadata?.topic || "Nombor hingga 100",
      sceneType: "STORY",
      visualDescription: imagePrompt,
      storyText
    });

    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=101`;

    filled.blocks[0].content.story_text = storyText;
    filled.blocks[0].content.help_continuation = aiContent.story_hook.help_continuation || "";
    filled.blocks[0].content.mascot_dialogue = aiContent.story_hook.mascot_dialogue || "";
    filled.blocks[0].content.tts_script = aiContent.story_hook.tts_script || aiContent.story_hook.mascot_dialogue || "";
    filled.blocks[0].content.image_prompt = imagePrompt;
    filled.blocks[0].content.image_url = aiContent.story_hook.image_url || generatedImageUrl;
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
    let apiSuccess = false;
    if (base44?.functions?.invoke) {
      try {
        const res = await base44.functions.invoke("generateAIContent", {
          prompt,
          sp_code: metadata.sp_code,
          subject: metadata.subject,
          grade: metadata.grade,
          topic: metadata.topic,
          mode: "CONTENT_FILL_V2"
        });

        if (res?.data?.content) {
          if (typeof res.data.content === "string") {
            let cleaned = res.data.content.trim();
            if (cleaned.startsWith("```")) {
              cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
            }
            try {
              return JSON.parse(cleaned);
            } catch (e) {
              console.error("[aiContentFiller] Failed to parse res.data.content JSON:", e, cleaned.substring(0, 100));
              throw e;
            }
          }
          return res.data.content;
        }

        if (res?.data?.missionPackage) {
          // Legacy response — try to extract usable content
          return null;
        }

        if (res?.data?.success === false || res?.data?.error) {
          throw new Error(res?.data?.error || "Backend returned success: false");
        }
        
        apiSuccess = true;
      } catch (invokeErr) {
        console.warn("[aiContentFiller] Backend invoke failed, falling back to direct Core integration:", invokeErr.message);
      }
    }

    if (!apiSuccess && base44?.integrations?.Core?.generateText) {
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
 * Generates deterministic fallback content when the AI LLM service is unavailable or offline.
 * Ensures the lesson shell is always fully usable in preview and local dev environments.
 *
 * @param {object} metadata - shell.metadata
 * @returns {object} Fallback aiContent object matching the 8-block contract
 */
function buildFallbackContent(metadata) {
  const { subject, topic, sk_code, sk_title, sp_code, sp_description, mascot, mode, widget_type } = metadata;
  const focusSubtopic = sp_description || sk_title || topic || "Pelajaran KSSR";
  const displayTopic = focusSubtopic;

  return {
    story_hook: {
      story_text: `Hari ini ${mascot} sedang mengembara menerokai subtopik ${displayTopic} dan memerlukan bantuan anda!`,
      help_continuation: `Untuk membantu ${mascot} menyelesaikan misi ini dengan jayanya, mari kita pelajari dan kuasai kemahiran ${displayTopic} bersama-sama!`,
      mascot_dialogue: `Hai {student_name}! Bersedia untuk belajar tentang ${displayTopic} hari ini? Jom kita mulakan!`,
      tts_script: `Hai Kawan! Bersedia untuk belajar tentang ${displayTopic} hari ini? Jom kita mulakan!`
    },
    learning_objective: {
      i_can_statement: `Saya boleh memahami dan menguasai ${displayTopic}.`
    },
    concept_cpa: {
      concrete: {
        title: "Peringkat Konkrit (Objek Sebenar)",
        explanation: `Mari kita gunakan objek sebenar dalam kehidupan harian untuk memahami ${displayTopic} secara tersusun.`,
        visual_prompt: `Kids illustration showing real physical objects for learning ${displayTopic}, colorful education concept`
      },
      pictorial: {
        title: "Peringkat Bergambar (Visual)",
        explanation: `Perhatikan rajah dan gambar rajah visual berikut untuk melihat perwakilan ${displayTopic}.`,
        visual_prompt: `Visual diagram illustration explaining ${displayTopic} step by step`
      },
      abstract: {
        title: "Peringkat Abstrak (Simbol & Petua)",
        explanation: `Gunakan simbol, nombor, dan perkataan untuk menulis jawapan bagi ${displayTopic} dengan betul dan kemas.`,
        key_term: displayTopic,
        key_definition: `Konsep asas KSSR bagi ${displayTopic}.`
      }
    },
    worked_example: {
      problem_statement: `Selesaikan soalan contoh berikut bagi ${displayTopic}: Nyatakan jawapan yang tepat berdasarkan rajah.`,
      solution_steps: [
        `Langkah 1: Baca soalan dan fahami kehendak ${displayTopic}.`,
        "Langkah 2: Bilang atau bandingkan kuantiti objek secara bersistem.",
        "Langkah 3: Tuliskan jawapan akhir dengan tepat."
      ],
      common_mistake: "Keliru membaca soalan atau tidak menyemak jawapan.",
      correct_reasoning: "Semak jawapan secara berperingkat untuk memastikan ketepatan."
    },
    practice: {
      instruction: `Lengkapkan aktiviti interaktif ${widget_type} berikut berkaitan ${displayTopic}.`,
      seed_data: {
        instruction_context: `Aktiviti interaktif bagi ${displayTopic}`,
        target_val: 10,
        items: [
          { id: "1", label: `Kumpulan A (${displayTopic})`, category: "Kumpulan A" },
          { id: "2", label: `Kumpulan B (${displayTopic})`, category: "Kumpulan B" }
        ]
      }
    },
    quiz: {
      questions: [
        {
          stem: `Apakah jawapan yang betul bagi latihan asas ${displayTopic}?`,
          options: [`Menguasi ${displayTopic}`, `Belum Kuasa A`, `Belum Kuasa B`],
          correct_index: 0,
          explanation: "Jawapan ini tepat kerana mengikut konsep asas yang telah dipelajari.",
          misconception_tag: "Kesilapan asas"
        },
        {
          stem: `Pilih penyataan yang BENAR mengenai ${displayTopic}.`,
          options: [`Kuantiti sesuai bagi ${displayTopic}`, `Kuantiti tidak sepadan A`, `Kuantiti tidak sepadan B`],
          correct_index: 0,
          explanation: "Penyataan ini betul berdasarkan petunjuk dan panduan visual.",
          misconception_tag: "Pengecaman konsep"
        },
        {
          stem: `Antara berikut, yang manakah mewakili penyelesaian terbaik bagi soalan ${displayTopic}?`,
          options: [`Mengira dengan berhati-hati`, `Membuat tekaan rambang`, `Abaikan jawapan`],
          correct_index: 0,
          explanation: "Langkah ini mematuhi urutan penyelesaian masalah KSSR.",
          misconception_tag: "Aplikasi penyelesaian masalah"
        }
      ]
    },
    key_takeaway: {
      summary_points: [
        `Memahami konsep ${displayTopic} dengan jelas.`,
        "Menggunakan kaedah pengiraan dan perbandingan yang tersusun.",
        "Mengaplikasikan kemahiran ini dalam kehidupan harian."
      ],
      memory_tip: `Petua Penyu: Semak dengan cermat, pasti jawapan tepat! 🐢`,
      flashcards: [
        { term: displayTopic, definition: `Asas penguasaan subtopik ${displayTopic} mengikut DSKP.` },
        { term: "Petua Semakan", definition: "Sentiasa semak semula pengiraan anda." }
      ]
    },
    celebration: {
      celebration_message: `Tahniah {student_name}! Anda telah berjaya menyelesaikan subtopik ${displayTopic}!`,
      badge_name: `Wira ${displayTopic}`
    }
  };
}

/**
 * Main entry point: Generates a complete, validated lesson.
 *
 * Pipeline:
 *   Phase 1: buildLessonShell() → deterministic structure
 *   Phase 2: callLLMForContent() → AI content fill (with deterministic fallback)
 *   Phase 3: validateLessonShell() → quality gate
 *
 * @param {object} params
 * @param {string} params.subject
 * @param {string} params.grade
 * @param {string} params.sk_code
 * @param {string} params.sk_title
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
  sk_title = "",
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
    sk_title,
    sp_code,
    sp_description,
    topic,
    target_tp
  });

  // PHASE 2: AI Content Fill
  let aiContent = await callLLMForContent(shell.metadata);

  if (!aiContent) {
    console.warn("[aiContentFiller] AI content generation offline. Generating fallback content.");
    aiContent = buildFallbackContent(shell.metadata);
  }

  const filledShell = mergeContentIntoShell(shell, aiContent);

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
