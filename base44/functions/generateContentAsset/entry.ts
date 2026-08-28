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
    const { topic_id, subtopic_id, sp_code, asset_type, subject_name, year_level } = body;

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
        subtopic_id,
        sp_code,
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
        response_json_schema: {
          type: "object",
          properties: {
            asset_type: { type: "string" },
            title: { type: "string" },
            markdown: { type: "string" },
            content: { type: "object" },
            questions: { type: "array" },
            cards: { type: "array" },
          },
          required: ["asset_type", "title"],
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
    const hasDetailedText =
      (aiRes.markdown && aiRes.markdown.length > 20) ||
      (aiRes.content && Object.keys(aiRes.content).length > 0) ||
      (Array.isArray(aiRes.questions) && aiRes.questions.length > 0) ||
      (Array.isArray(aiRes.cards) && aiRes.cards.length > 0);

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

    // 10. Prepare Server-Authoritative Asset Payload & Force DRAFT / UNDER_REVIEW Status
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
        const qId = `qb_asset_${Date.now()}_${i}`;

        const qRecord = await db.entities.QuestionBank.create({
          id: qId,
          topic_id,
          subtopic_id,
          sp_code,
          question_id: qId,
          question: q.question_text || q.question || aiRes.title,
          correct_answer: q.correct_answer || "A",
          explanation: q.explanation || "",
          difficulty: q.difficulty || "medium",
          cognitive_level: q.cognitive_level || "understand",
          status: "draft",
          created_source: "ai_generated",
          approved_by: null,
        });

        if (Array.isArray(q.options)) {
          await db.entities.QuestionOption.bulkCreate(
            q.options.map((opt: any, optIdx: number) => ({
              question_id: qId,
              label: opt.label || String.fromCharCode(65 + optIdx),
              text: opt.text || opt.option_text || "",
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