// base44/functions/generateContentAsset/entry.ts
// Single Content Asset Generator Endpoint (Phase 3C-2A)
// Generates exactly ONE curriculum-bound Content Asset in DRAFT/UNDER_REVIEW status.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildMacroPrompt } from "../../shared/blockPromptRegistry.ts";

// Canonical asset types registry
const CANONICAL_ASSET_TYPES = [
  "LESSON_HOOK",
  "LESSON_OBJECTIVE",
  "CONCEPT",
  "WORKED_EXAMPLE",
  "GUIDED_PRACTICE",
  "INDEPENDENT_PRACTICE",
  "REFLECTION",
  "VIDEO",
  "INTERACTIVE",
  "FLASHCARD",
  "QUIZ_QUESTION",
  "ASSESSMENT_ITEM",
];

// Per-asset LLM output schema — field names EXACTLY match what each block component reads.
// This forces the AI to return structured content the renderer can consume directly.
const ASSET_OUTPUT_SCHEMAS: Record<string, any> = {
  LESSON_HOOK: {
    type: "object",
    properties: {
      title: { type: "string" },
      story_text: { type: "string", description: "Naratif cerita ringkas (2-4 ayat) dalam Bahasa Melayu" },
      mascot_dialogue: { type: "string", description: "Dialog maskot Suku Penyu kepada murid" },
      visual_prompt: { type: "string", description: "Deskripsi visual untuk gambar kisah" },
      help_continuation: { type: "string", description: "Cara murid boleh membantu maskot" },
    },
    required: ["title", "story_text", "mascot_dialogue"],
  },
  LESSON_OBJECTIVE: {
    type: "object",
    properties: {
      title: { type: "string" },
      i_can_statement: { type: "string", description: "Pernyataan 'Saya boleh...' dalam Bahasa Melayu" },
      tp_badge: { type: "string", description: "Tahap Penguasaan sasaran: TP1, TP2, atau TP3" },
    },
    required: ["title", "i_can_statement", "tp_badge"],
  },
  CONCEPT: {
    type: "object",
    properties: {
      title: { type: "string" },
      concrete: {
        type: "object",
        properties: {
          title: { type: "string" },
          explanation: { type: "string", description: "Penerangan peringkat Konkrit dengan objek sebenar" },
        },
        required: ["title", "explanation"],
      },
      pictorial: {
        type: "object",
        properties: {
          title: { type: "string" },
          explanation: { type: "string", description: "Penerangan peringkat Bergambar dengan rajah/lukisan" },
        },
        required: ["title", "explanation"],
      },
      abstract: {
        type: "object",
        properties: {
          title: { type: "string" },
          explanation: { type: "string", description: "Penerangan peringkat Abstrak dengan simbol/aturan" },
          key_term: { type: "string" },
          key_definition: { type: "string" },
        },
        required: ["title", "explanation"],
      },
    },
    required: ["title", "concrete", "pictorial", "abstract"],
  },
  WORKED_EXAMPLE: {
    type: "object",
    properties: {
      title: { type: "string" },
      problem_statement: { type: "string", description: "Penyataan soalan dalam konteks Malaysia" },
      solution_steps: {
        type: "array",
        items: { type: "string" },
        description: "Langkah-langkah penyelesaian berurutan (minimum 2)",
      },
      common_mistake: { type: "string", description: "Kesilapan lazim murid" },
      correct_reasoning: { type: "string", description: "Penalaran betul mengapa jawapan itu benar" },
    },
    required: ["title", "problem_statement", "solution_steps", "correct_reasoning"],
  },
  GUIDED_PRACTICE: {
    type: "object",
    properties: {
      title: { type: "string" },
      widget_type: { type: "string", description: "Jenis widget: matching, drag_and_drop, atau number_scale" },
      instruction: { type: "string", description: "Satu ayat pendek arahan kepada kanak-kanak (max 12 patah)" },
      seed_data: {
        type: "object",
        description: "MESTI tidak kosong. matching: {pairs:[{image,label}]}. drag_and_drop: {items:[],categories:[]}. number_scale: {left_val,right_val,correct_relation}. sentence_builder: {target_sentence,word_bank}. base_ten_blocks: {target_number}. fraction_slicer: {target_fraction,total_parts,shaded_parts}. quiz_wheel: {question,options,correct_index}.",
        properties: {
          pairs: { type: "array", items: { type: "object", properties: { image: { type: "string" }, label: { type: "string" } } } },
          items: { type: "array", items: { type: "string" } },
          categories: { type: "array", items: { type: "string" } },
          left_val: { type: "number" },
          right_val: { type: "number" },
          correct_relation: { type: "string", description: "MORE_THAN, LESS_THAN, atau EQUAL" },
          target_sentence: { type: "string" },
          word_bank: { type: "array", items: { type: "string" } },
          target_number: { type: "number" },
          target_fraction: { type: "string" },
          total_parts: { type: "number" },
          shaded_parts: { type: "number" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_index: { type: "number" },
        },
      },
    },
    required: ["title", "widget_type", "instruction", "seed_data"],
  },
  REFLECTION: {
    type: "object",
    properties: {
      title: { type: "string" },
      summary_points: {
        type: "array",
        items: { type: "string" },
        description: "3-5 rumusan utama pelajaran (tentang topik sebenar, bukan topik lain)",
      },
      memory_tip: { type: "string", description: "Petua ingatan ringkas" },
      common_mistakes: {
        type: "array",
        items: { type: "string" },
        description: "1-2 kesilapan lazim berkaitan topik sebenar",
      },
      reflection_prompt: { type: "string", description: "Soalan refleksi diri" },
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            term: { type: "string" },
            definition: { type: "string" },
          },
          required: ["term", "definition"],
        },
        description: "2-4 kad kilat istilah penting",
      },
    },
    required: ["title", "summary_points", "reflection_prompt"],
  },
  QUIZ_QUESTION: {
    type: "object",
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            stem: { type: "string", description: "Teks soalan" },
            options: {
              type: "array",
              items: { type: "string" },
              description: "Tepat 4 pilihan jawapan",
            },
            correct_index: { type: "number", description: "Indeks pilihan betul (0-3)" },
            explanation: { type: "string" },
            tp_level: { type: "string" },
            misconception_tag: { type: "string" },
          },
          required: ["stem", "options", "correct_index", "explanation"],
        },
      },
    },
    required: ["title", "questions"],
  },
  FLASHCARD: {
    type: "object",
    properties: {
      title: { type: "string" },
      cards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            front: { type: "string" },
            back: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["front", "back"],
        },
      },
    },
    required: ["title", "cards"],
  },
};

// Asset Type -> DB Entity mapping table
const ASSET_ENTITY_MAP: Record<string, { entity: string; block_type?: string; content_type?: string }> = {
  LESSON_HOOK: { entity: "LessonBlock", block_type: "STORY_HOOK" },
  LESSON_OBJECTIVE: { entity: "LessonBlock", block_type: "LEARNING_OBJECTIVE" },
  CONCEPT: { entity: "LessonBlock", block_type: "CONCEPT_CPA" },
  WORKED_EXAMPLE: { entity: "LessonBlock", block_type: "WORKED_EXAMPLE" },
  GUIDED_PRACTICE: { entity: "LessonBlock", block_type: "INTERACTIVE_PRACTICE" },
  INDEPENDENT_PRACTICE: { entity: "LessonBlock", block_type: "INTERACTIVE_PRACTICE" },
  REFLECTION: { entity: "LessonBlock", block_type: "KEY_TAKEAWAY" },
  VIDEO: { entity: "LessonContent", content_type: "video" },
  INTERACTIVE: { entity: "LearningActivity", content_type: "interactive" },
  FLASHCARD: { entity: "Flashcard", content_type: "flashcard" },
  QUIZ_QUESTION: { entity: "QuestionBank", content_type: "question" },
  ASSESSMENT_ITEM: { entity: "QuestionBank", content_type: "question" },
};

// Forbidden placeholder strings
const PLACEHOLDER_STRINGS = [
  "kandungan tidak tersedia",
  "kandungan tidak dapat dijanakan",
  "lorem ipsum",
  "[tbd]",
  "placeholder",
  "coming soon",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole || base44;

    // 1. Authenticate & Authorize Admin User
    let authUser: any = null;
    try {
      authUser = await base44.auth.me();
    } catch {
      /* fallback */
    }

    if (!authUser) {
      return Response.json(
        { success: false, error_code: "UNAUTHORIZED", error: "Sesi tidak disahkan." },
        { status: 401 }
      );
    }

    const role = String(authUser.role || authUser.app_role || "").toLowerCase();
    const isAdmin = role === "admin" || authUser.is_admin === true;
    if (!isAdmin) {
      return Response.json(
        { success: false, error_code: "UNAUTHORIZED", error: "Akses hanya untuk pentadbir." },
        { status: 403 }
      );
    }

    // 2. Parse Input & Validate Request Parameters
    const body = await req.json().catch(() => ({}));
    const { topic_id, subtopic_id, sp_code, asset_type, subject_name, year_level, topic_name, sp_description } = body;

    if (!topic_id || !subtopic_id || !sp_code || !asset_type) {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_CURRICULUM",
          error: "Maklumat kurikulum tidak lengkap. topic_id, subtopic_id, sp_code dan asset_type diperlukan.",
        },
        { status: 400 }
      );
    }

    // Validate Asset Type against Canonical Registry
    if (!CANONICAL_ASSET_TYPES.includes(asset_type)) {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_ASSET_TYPE",
          error: `Jenis aset '${asset_type}' tidak sah. Jenis yang dibenarkan: ${CANONICAL_ASSET_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Server-Authoritative Curriculum Validation
    if (subtopic_id) {
      const subtopics = await db.entities.Subtopic.filter({ id: subtopic_id }).catch(() => []);
      if (subtopics && subtopics.length > 0) {
        const sub = subtopics[0];
        if (sub.topic_id && sub.topic_id !== topic_id) {
          return Response.json(
            {
              success: false,
              error_code: "INVALID_CURRICULUM",
              error: `Subtopik '${subtopic_id}' tidak terikat dengan topik '${topic_id}'.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 4. Duplicate / Published Content Protection
    // Check if an APPROVED or PUBLISHED asset already exists for this exact curriculum identity
    const mapping = ASSET_ENTITY_MAP[asset_type];
    const targetEntity = mapping.entity;

    const existingApproved = await db.entities[targetEntity]
      .filter({
        topic_id,
        sp_code,
        status: "published",
      })
      .catch(() => []);

    // 5. Construct Server-Authoritative AI Generation Prompt via Macro Prompt Registry
    const subject = subject_name || "Matematik";
    const level = year_level || "Tahun 4";

    const promptText = buildMacroPrompt({
      asset_type,
      curriculum_context: {
        subject,
        topic_id,
        topic: topic_name || topic_id,
        sp_code,
        sp_description: sp_description || "Standard Pembelajaran",
        learning_standard: sp_description || "Standard Pembelajaran",
      },
      learner_profile: {
        year_level: level,
      },
    });

    // 6. Invoke LLM via Core Integration
    let aiRes: any = null;
    try {
      aiRes = await db.integrations.Core.InvokeLLM({
        prompt: promptText,
        model: "gemini_3_flash",
        response_json_schema: ASSET_OUTPUT_SCHEMAS[asset_type] || {
          type: "object",
          properties: {
            title: { type: "string" },
            markdown: { type: "string" },
          },
          required: ["title"],
        },
      });
    } catch (llmErr: any) {
      console.error("generateContentAsset LLM Error:", llmErr);
      return Response.json(
        {
          success: false,
          error_code: "AI_GENERATION_FAILED",
          error: "Gagal menjana kandungan daripada model AI.",
        },
        { status: 500 }
      );
    }

    if (!aiRes || typeof aiRes !== "object") {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_AI_OUTPUT",
          error: "Format output AI tidak sah.",
        },
        { status: 422 }
      );
    }

    // 7. Strip multi-asset fields the AI may erroneously include
    delete aiRes.extra_assets;
    delete aiRes.blocks;

    // 8. Validate "No Placeholder Content" Invariant
    const aiTextSample = JSON.stringify(aiRes).toLowerCase();
    for (const ph of PLACEHOLDER_STRINGS) {
      if (aiTextSample.includes(ph)) {
        return Response.json(
          {
            success: false,
            error_code: "INVALID_AI_OUTPUT",
            error: "Kandungan janaan AI mengandungi teks placeholder tidak sah.",
          },
          { status: 422 }
        );
      }
    }

    // 9. Execute Quality Shield Evaluation
    let qualityScore = 85; // Default baseline for valid output
    // Count meaningful content fields beyond the generic title/asset_type wrappers
    const meaningfulTopFields = Object.keys(aiRes).filter(
      (k) => !["asset_type", "title", "content", "questions", "cards"].includes(k) && aiRes[k]
    );
    const hasDetailedText =
      (aiRes.markdown && aiRes.markdown.length > 20) ||
      (aiRes.content && Object.keys(aiRes.content).length > 0) ||
      (Array.isArray(aiRes.questions) && aiRes.questions.length > 0) ||
      (Array.isArray(aiRes.cards) && aiRes.cards.length > 0) ||
      meaningfulTopFields.length > 0;

    if (!hasDetailedText) {
      qualityScore = 40;
    }

    if (qualityScore < 75) {
      return Response.json(
        {
          success: false,
          error_code: "QUALITY_GATE_FAILED",
          error: "Aset tidak melepasi penilaian kualiti AI (skor kualiti rendah).",
          quality_score: qualityScore,
        },
        { status: 422 }
      );
    }

    // 9B. Device-first structural validation for GUIDED_PRACTICE:
    // seed_data MUST be a non-empty object the widget can render.
    if (asset_type === "GUIDED_PRACTICE") {
      const sd = aiRes.seed_data;
      const isEmptySeed =
        !sd ||
        typeof sd !== "object" ||
        Array.isArray(sd) ||
        Object.keys(sd).length === 0;
      if (isEmptySeed) {
        return Response.json(
          {
            success: false,
            error_code: "INVALID_AI_OUTPUT",
            error: "seed_data kosong — widget permainan tidak boleh dipaparkan. AI mesti berisi pasulan/items/values.",
          },
          { status: 422 }
        );
      }
      const wt = String(aiRes.widget_type || "").toLowerCase();
      const validWidgets = ["matching", "drag_and_drop", "number_scale", "sentence_builder", "base_ten_blocks", "fraction_slicer", "quiz_wheel"];
      if (!validWidgets.includes(wt)) {
        return Response.json(
          {
            success: false,
            error_code: "INVALID_AI_OUTPUT",
            error: `widget_type '${aiRes.widget_type}' tidak sah. Pilih: ${validWidgets.join(", ")}.`,
          },
          { status: 422 }
        );
      }
      // Widget-specific structural check
      if (wt === "matching" && (!Array.isArray(sd.pairs) || sd.pairs.length < 2)) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "matching memerlukan seed_data.pairs (min 2 pasangan)." },
          { status: 422 }
        );
      }
      if (wt === "drag_and_drop" && (!Array.isArray(sd.items) || !Array.isArray(sd.categories))) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "drag_and_drop memerlukan seed_data.items dan seed_data.categories." },
          { status: 422 }
        );
      }
      if (wt === "number_scale" && (typeof sd.left_val !== "number" || typeof sd.right_val !== "number" || !sd.correct_relation)) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "number_scale memerlukan seed_data.left_val, right_val, correct_relation." },
          { status: 422 }
        );
      }
      if (wt === "sentence_builder" && (!sd.target_sentence || !Array.isArray(sd.word_bank) || sd.word_bank.length < 2)) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "sentence_builder memerlukan seed_data.target_sentence dan seed_data.word_bank (min 2 perkataan)." },
          { status: 422 }
        );
      }
      if (wt === "base_ten_blocks" && typeof sd.target_number !== "number") {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "base_ten_blocks memerlukan seed_data.target_number (nombor)." },
          { status: 422 }
        );
      }
      if (wt === "fraction_slicer" && (!sd.target_fraction || typeof sd.total_parts !== "number" || typeof sd.shaded_parts !== "number")) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "fraction_slicer memerlukan seed_data.target_fraction, total_parts, shaded_parts." },
          { status: 422 }
        );
      }
      if (wt === "quiz_wheel" && (!sd.question || !Array.isArray(sd.options) || sd.options.length < 2 || typeof sd.correct_index !== "number")) {
        return Response.json(
          { success: false, error_code: "INVALID_AI_OUTPUT", error: "quiz_wheel memerlukan seed_data.question, options (min 2), correct_index." },
          { status: 422 }
        );
      }
    }

    // 9C. Device-first validation: reject teacher-voice content in child-facing blocks
    if (["LESSON_HOOK", "LESSON_OBJECTIVE", "CONCEPT", "WORKED_EXAMPLE", "GUIDED_PRACTICE"].includes(asset_type)) {
      const sample = JSON.stringify(aiRes).toLowerCase();
      const teacherPhrases = [
        "guru menunjukkan",
        "guru menyuruh",
        "murid memegang",
        "murid akan",
        "gunakan objek sebenar",
        "lukiskan di kertas",
        "lukis gambar",
        "di dalam kelas",
        "setiap murid",
        "pelajar diharap",
      ];
      for (const phrase of teacherPhrases) {
        if (sample.includes(phrase)) {
          return Response.json(
            {
              success: false,
              error_code: "INVALID_AI_OUTPUT",
              error: `Kandungan mengandungi arahan guru ('${phrase}') — mesti dialamatkan terus kepada kanak-kanak untuk skrin peranti.`,
            },
            { status: 422 }
          );
        }
      }
    }

    // 9D. LESSON_HOOK: generate a dedicated English image prompt FROM the story narrative
    //     (produced AFTER the story exists, based on that exact story) so the AI image
    //     depicts the precise mission scene — two baskets of seashells, jars of marbles, etc.
    //     — instead of a generic mascot pose.
    if (asset_type === "LESSON_HOOK" && aiRes.story_text) {
      try {
        const imgRes = await db.integrations.Core.InvokeLLM({
          prompt: `You are a 3D animation art director. Read this Malaysian children's story and produce ONE vivid English image-generation prompt depicting the EXACT scene, objects, colors, counts, and setting described in the story. The image MUST include the green sea turtle mascot "Suku Penyu" wearing a blue school jacket AND the specific objects from the story (e.g. two woven baskets, seashells, jars of colorful marbles, apples). Describe the scene concretely. Output ONLY the English prompt (1-2 sentences), no quotes, no preamble, no markdown.\n\nStory: "${aiRes.story_text}"\nVisual cue: "${aiRes.visual_prompt || ""}"`,
          model: "gemini_3_flash",
        });
        const ip = typeof imgRes === "string" ? imgRes.trim() : String(imgRes?.image_prompt || imgRes?.prompt || "");
        if (ip && ip.length > 15) {
          aiRes.image_prompt = ip.replace(/^["'`]|["'`]$/g, "").trim();
        }
      } catch {
        // fallback: keep the AI's visual_prompt already in aiRes
      }

      // Generate the ACTUAL story image via Core.GenerateImage (high-quality 3D real-life
      // Pixar style) so the rendered visual matches the exact mission scene — two baskets
      // of mangosteens, jars of marbles, etc. Store the URL as image_url; StoryHookBlock
      // uses it directly when present, falling back to Pollinations from image_prompt.
      try {
        const fullImgPrompt = `3D real-life Pixar animation style digital render of Suku Penyu, a cute friendly green sea turtle mascot character wearing a blue school jacket, ${aiRes.image_prompt || aiRes.visual_prompt || aiRes.story_text}. Bright vivid colors, warm volumetric lighting, educational children book illustration, high detail, child friendly, cinematic Pixar render.`;
        const genImgRes = await db.integrations.Core.GenerateImage({ prompt: fullImgPrompt });
        if (genImgRes && genImgRes.url) {
          aiRes.image_url = genImgRes.url;
        }
      } catch {
        // fallback: StoryHookBlock builds Pollinations URL from image_prompt
      }
    }

    // 10. Prepare Server-Authoritarian Asset Payload & Force DRAFT / UNDER_REVIEW Status
    // Server strictly overrides any attempt by client to set approved/published status
    const now = new Date().toISOString();
    let createdAsset: any = null;

    if (targetEntity === "LessonBlock") {
      // The LLM schema declares `content` as a generic object with no sub-properties,
      // so the model typically returns pedagogical fields (summary_points, steps,
      // concept_explanation, hook_text, etc.) at the TOP LEVEL rather than nested.
      // Merge top-level fields into the payload to guarantee non-empty block content.
      const aiContent = (aiRes.content && typeof aiRes.content === "object" && !Array.isArray(aiRes.content))
        ? aiRes.content
        : {};
      const blockPayload: Record<string, any> = { ...aiContent, ...aiRes };
      delete blockPayload.asset_type;
      delete blockPayload.content;
      delete blockPayload.questions;
      delete blockPayload.cards;

      createdAsset = await db.entities.LessonBlock.create({
        lesson_version_id: null,
        topic_id,
        subtopic_id,
        sp_code,
        block_type: mapping.block_type || "TEXT_MARKDOWN",
        title: aiRes.title || "Aset Kandungan",
        order_number: 0,
        payload: blockPayload,
        status: "draft",
        review_status: "under_review",
        created_source: "ai_generated",
        approved_by: null,
        approved_at: null,
      });
    } else if (targetEntity === "LessonContent") {
      createdAsset = await db.entities.LessonContent.create({
        lesson_version_id: null,
        topic_id,
        subtopic_id,
        sp_code,
        content_type: mapping.content_type || "notes",
        title: aiRes.title || "Kandungan Nota/Video",
        content_markdown: aiRes.markdown || "",
        media_url: aiRes.media_url || "",
        voice_script: aiRes.voice_script || "",
        status: "draft",
        created_source: "ai_generated",
        approved_by: null,
        approved_at: null,
      });
    } else if (targetEntity === "LearningActivity") {
      createdAsset = await db.entities.LearningActivity.create({
        lesson_id: null,
        topic_id,
        subtopic_id,
        sp_code,
        widget_type: aiRes.widget_type || "drag_and_drop",
        activity_type: mapping.content_type || "interactive",
        title: aiRes.title || "Aktiviti Interaktif",
        instructions: aiRes.instructions || "Ikuti arahan aktiviti.",
        activity_data_json: JSON.stringify(aiRes.content || aiRes.seed_data || {}),
        status: "draft",
        created_source: "ai_generated",
        approved_by: null,
        approved_at: null,
      });
    } else if (targetEntity === "Flashcard") {
      const cards = Array.isArray(aiRes.cards) ? aiRes.cards : [{ front: aiRes.title, back: aiRes.markdown || "" }];
      const createdCards = [];
      for (const card of cards) {
        const fc = await db.entities.Flashcard.create({
          lesson_version_id: null,
          topic_id,
          sp_code,
          front: card.front || card.front_text || aiRes.title,
          back: card.back || card.back_text || "",
          explanation: card.explanation || "",
          status: "draft",
          created_source: "ai_generated",
          approved_by: null,
        });
        createdCards.push(fc);
      }
      createdAsset = createdCards[0];
    } else if (targetEntity === "QuestionBank") {
      const questions = Array.isArray(aiRes.questions)
        ? aiRes.questions
        : [
            {
              question_text: aiRes.title || "Soalan",
              options: [{ label: "A", text: "Pilihan A", is_correct: true }],
              explanation: aiRes.markdown || "",
            },
          ];

      const createdQuestions = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Normalize options: AI may return strings, {label,text}, {option_text}, or {text,is_correct}
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        const normalizedOptions = rawOptions.map((opt: any, optIdx: number) => {
          const label = String.fromCharCode(65 + optIdx);
          let text = "";
          if (typeof opt === "string") {
            text = opt;
          } else {
            text = String(opt.text || opt.option_text || opt.label || "").trim();
          }
          return { label, text, is_correct: !!opt.is_correct };
        });

        // Resolve correct answer to a LABEL (A/B/C/D). The per-asset schema uses
        // correct_index (0-based number); legacy inputs may use a label string,
        // option text, or an is_correct flag on one option.
        let correctLabel = "";
        if (typeof q.correct_index === "number" && q.correct_index >= 0 && q.correct_index < normalizedOptions.length) {
          correctLabel = String.fromCharCode(65 + q.correct_index);
        } else {
          const ca = String(q.correct_answer || "").trim();
          const caLabelMatch = ca.match(/^([A-D])\b/i);
          if (caLabelMatch) {
            correctLabel = caLabelMatch[1].toUpperCase();
          } else if (normalizedOptions.some((o) => o.is_correct)) {
            correctLabel = normalizedOptions.find((o) => o.is_correct)!.label;
          } else if (ca) {
            const idx = normalizedOptions.findIndex(
              (o) => o.text.toLowerCase() === ca.toLowerCase()
            );
            if (idx >= 0) correctLabel = normalizedOptions[idx].label;
          }
        }
        if (!correctLabel) correctLabel = normalizedOptions[0]?.label || "A";

        // Store options inline so consumers (preview, runtime) don't depend on
        // a separate QuestionOption fetch. Keep creating QuestionOption records
        // for structured-query compatibility, keyed by the actual record id.
        const optionsForJson = normalizedOptions.map((o) => ({
          label: o.label,
          text: o.text,
        }));

        const qId = `qb_asset_${Date.now()}_${i}`;
        const qRecord = await db.entities.QuestionBank.create({
          question_id: qId,
          topic_id,
          subtopic_id,
          sp_code,
          question: q.question_text || q.question || q.stem || aiRes.title,
          question_type: q.question_type || "mcq",
          correct_answer: correctLabel,
          options_json: JSON.stringify(optionsForJson),
          explanation: q.explanation || q.reason || "",
          difficulty: q.difficulty || "medium",
          cognitive_level: q.cognitive_level || "understand",
          status: "draft",
          created_source: "ai_generated",
          approved_by: null,
        });

        if (normalizedOptions.length > 0) {
          await db.entities.QuestionOption.bulkCreate(
            normalizedOptions.map((o, optIdx) => ({
              question_id: qRecord.id,
              label: o.label,
              text: o.text,
              sort_order: optIdx,
            }))
          );
        }
        createdQuestions.push(qRecord);
      }
      createdAsset = createdQuestions[0];
    }

    if (!createdAsset) {
      return Response.json(
        {
          success: false,
          error_code: "PERSISTENCE_FAILED",
          error: "Gagal menyimpan aset kandungan ke dalam pangkalan data.",
        },
        { status: 500 }
      );
    }

    // 11. Return Machine-Readable Success Response
    return Response.json(
      {
        success: true,
        asset_id: createdAsset.id,
        entity_type: targetEntity,
        asset_type: asset_type,
        status: "draft",
        review_status: "under_review",
        quality_score: qualityScore,
        asset_payload: aiRes,
        curriculum_tags: {
          topic_id,
          subtopic_id,
          sp_code,
        },
        has_existing_approved: existingApproved.length > 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("generateContentAsset fatal error:", error);
    return Response.json(
      {
        success: false,
        error_code: "PERSISTENCE_FAILED",
        error: error?.message || "Ralat pelayan semasa menjana aset kandungan.",
      },
      { status: 500 }
    );
  }
}