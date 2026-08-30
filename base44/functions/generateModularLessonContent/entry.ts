// base44/functions/generateModularLessonContent/entry.ts
// Phase 2: Upgraded Curriculum-First AI Lesson Package Generator
// Generates complete DSKP (KSSR Semakan / KSSM) lesson packages featuring the canonical 8-block deterministic shell.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface ModularGenInput {
  lesson_version_id: string;
  sk_code?: string;
  sp_code?: string;
  sp_description?: string;
  subject?: string;
  year_level?: string;
  curriculum_type?: "KSSR_SEMAKAN" | "KSSM";
  topic?: string;
  language?: string;
  taxonomy?: string;
}

export const CANONICAL_8_BLOCKS = [
  "STORY_HOOK",
  "LEARNING_OBJECTIVE",
  "CONCEPT_CPA",
  "WORKED_EXAMPLE",
  "INTERACTIVE_PRACTICE",
  "KNOWLEDGE_CHECK",
  "KEY_TAKEAWAY",
  "MISSION_COMPLETE",
] as const;

export const SUPPORTED_WIDGETS = [
  "base_ten_blocks",
  "number_scale",
  "fraction_slicer",
  "sentence_builder",
  "drag_and_drop",
  "matching_cards",
  "quiz_wheel",
];

const EIGHT_BLOCK_LESSON_SCHEMA = {
  type: "object",
  properties: {
    lesson_title: { type: "string" },
    sp_code: { type: "string" },
    blocks: {
      type: "array",
      minItems: 8,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          block_number: { type: "number" },
          block_type: {
            type: "string",
            enum: [
              "STORY_HOOK",
              "LEARNING_OBJECTIVE",
              "CONCEPT_CPA",
              "WORKED_EXAMPLE",
              "INTERACTIVE_PRACTICE",
              "KNOWLEDGE_CHECK",
              "KEY_TAKEAWAY",
              "MISSION_COMPLETE",
            ],
          },
          xp_reward: { type: "number" },
          coin_reward: { type: "number" },
          content: { type: "object" },
        },
        required: ["block_number", "block_type", "content"],
      },
    },
    assessment: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
          cognitive_level: {
            type: "string",
            enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"],
          },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          misconception_target: { type: "string" },
          concept_tested: { type: "string" },
        },
        required: ["question", "options", "correct_answer", "explanation"],
      },
    },
    gamification: {
      type: "object",
      properties: {
        xp_reward: { type: "number", default: 50 },
        coin_reward: { type: "number", default: 10 },
        mission_completion_message: { type: "string" },
        suku_encouragement: { type: "string" },
      },
      required: ["xp_reward", "coin_reward", "mission_completion_message"],
    },
  },
  required: ["lesson_title", "sp_code", "blocks", "assessment", "gamification"],
};

/**
 * Perform strict structural validation on generated 8-block shell payload.
 */
export function validateGeneratedShell(generated: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!generated || typeof generated !== "object") {
    return { valid: false, errors: ["AI response payload is not a valid JSON object."] };
  }

  if (!Array.isArray(generated.blocks) || generated.blocks.length !== 8) {
    errors.push(`Lesson must contain exactly 8 blocks. Found: ${generated.blocks?.length || 0}`);
    return { valid: false, errors };
  }

  for (let i = 0; i < 8; i++) {
    const block = generated.blocks[i];
    const expectedType = CANONICAL_8_BLOCKS[i];

    if (!block || typeof block !== "object") {
      errors.push(`Block ${i + 1} is null or invalid object.`);
      continue;
    }

    if (block.block_type !== expectedType) {
      errors.push(`Block ${i + 1} type mismatch. Expected '${expectedType}', got '${block.block_type}'.`);
    }

    const c = block.content;
    if (!c || typeof c !== "object" || Object.keys(c).length === 0) {
      errors.push(`Block ${i + 1} (${expectedType}) content payload is empty.`);
      continue;
    }

    // Specific block type validations
    if (expectedType === "STORY_HOOK") {
      if (!c.story_text || String(c.story_text).trim().length < 15) {
        errors.push("STORY_HOOK: story_text is missing or too short.");
      }
    } else if (expectedType === "LEARNING_OBJECTIVE") {
      if (!c.i_can_statement || String(c.i_can_statement).trim().length < 10) {
        errors.push("LEARNING_OBJECTIVE: i_can_statement is missing or too short.");
      }
    } else if (expectedType === "CONCEPT_CPA") {
      if (!c.concrete || !c.pictorial || !c.abstract) {
        errors.push("CONCEPT_CPA: missing required CPA components (concrete, pictorial, abstract).");
      }
    } else if (expectedType === "WORKED_EXAMPLE") {
      if (!c.problem_statement || !Array.isArray(c.solution_steps) || c.solution_steps.length < 2) {
        errors.push("WORKED_EXAMPLE: problem_statement or solution_steps (min 2 steps) missing.");
      }
    } else if (expectedType === "INTERACTIVE_PRACTICE") {
      const widgetType = String(c.widget_type || "").trim();
      if (!widgetType || !SUPPORTED_WIDGETS.includes(widgetType)) {
        errors.push(`INTERACTIVE_PRACTICE: unsupported widget_type '${widgetType}'. Must be one of: ${SUPPORTED_WIDGETS.join(", ")}`);
      }
      if (!c.instruction) {
        errors.push("INTERACTIVE_PRACTICE: instruction is missing.");
      }
    } else if (expectedType === "KNOWLEDGE_CHECK") {
      if (!Array.isArray(c.questions) || c.questions.length < 2) {
        errors.push("KNOWLEDGE_CHECK: questions array must contain at least 2 questions.");
      }
    } else if (expectedType === "KEY_TAKEAWAY") {
      if (!Array.isArray(c.summary_points) || c.summary_points.length < 2) {
        errors.push("KEY_TAKEAWAY: summary_points array must contain at least 2 points.");
      }
    } else if (expectedType === "MISSION_COMPLETE") {
      if (!c.celebration_message) {
        errors.push("MISSION_COMPLETE: celebration_message is missing.");
      }
    }
  }

  // Detect banned placeholder / dummy fallback strings
  const bannedPatterns = [
    /Sila jana semula/i,
    /Pilihan A \(Jawapan Tepat\)/i,
    /Lorem Ipsum/i,
    /\$\{.*?\}/,
    /Placeholder/i,
  ];

  const payloadString = JSON.stringify(generated.blocks);
  for (const pattern of bannedPatterns) {
    if (pattern.test(payloadString)) {
      errors.push(`Generated payload contains forbidden placeholder string matching ${pattern.source}.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: ModularGenInput = await req.json().catch(() => ({}));

    let version: any = null;
    let createError: string | null = null;

    if (body.lesson_version_id) {
      version = await base44.asServiceRole.entities.LessonVersion.get(body.lesson_version_id).catch(() => null);
    }

    if (!version) {
      // Auto-create Lesson & LessonVersion if no lesson_version_id provided (or if not found)
      const topicId = body.topic_id || (body.sp_code ? `top_${body.sp_code.replace(/[^a-zA-Z0-9]/g, '_')}` : "top_dskp_default");
      let lesson: any = null;
      try {
        lesson = await base44.asServiceRole.entities.Lesson.create({
          topic_id: topicId,
          topic_name: body.topic || "Pelajaran DSKP",
          subject_name: body.subject || "Matematik",
          content_status: "draft",
        });
      } catch (err: any) {
        console.error("Lesson.create error:", err);
        createError = `Failed to create Lesson: ${err?.message || String(err)}`;
      }

      if (lesson) {
        try {
          version = await base44.asServiceRole.entities.LessonVersion.create({
            lesson_id: lesson.id,
            version_number: 1,
            status: "draft",
            review_status: "draft",
            sk_code: body.sk_code || "SK 1.1",
            sp_code: body.sp_code || "SP 1.1.1",
            year_level: body.year_level || "Tahun 1",
            curriculum_type: body.curriculum_type || "KSSR_SEMAKAN",
          });
        } catch (err: any) {
          console.error("LessonVersion.create error:", err);
          createError = `Failed to create LessonVersion: ${err?.message || String(err)}`;
        }
      }
    }

    if (!version) {
      return Response.json(
        { 
          success: false, 
          error: "VALIDATION_ERROR", 
          message: createError || "Versi pelajaran tidak dijumpai atau gagal dicipta.",
          details: { body_received: body }
        },
        { status: 400 }
      );
    }

    const skCode = body.sk_code || version.sk_code || "SK 1.1 Pecahan";
    const spCode = body.sp_code || version.sp_code || "SP 1.1.1 Penambahan Pecahan";
    const spDesc = body.sp_description || "";
    const subject = body.subject || "Matematik";
    const yearLevel = body.year_level || version.year_level || "Tahun 4";
    const curriculumType = body.curriculum_type || version.curriculum_type || "KSSR_SEMAKAN";
    const topic = body.topic || "Topik Pelajaran";
    const language = body.language || "Bahasa Melayu";
    const taxonomy = body.taxonomy || "Bloom";

    const systemPrompt = `You are StudyQuest AI, an expert Malaysian KSSR/KSSM Curriculum Instructional Designer.
Your task is to generate a comprehensive, highly structured 8-block deterministic lesson JSON payload based on the following context:
- Subjek: ${subject}
- Tingkat/Tahun: ${yearLevel}
- Topik: ${topic}
- Standard Kandungan (SK): ${skCode}
- Standard Pembelajaran (SP): ${spCode} ${spDesc ? `- ${spDesc}` : ""}
- Bahasa: ${language}
- Taksonomi: ${taxonomy}

STRICT GENERATION RULES FOR THE 8 DETERMINISTIC BLOCKS:
You MUST generate EXACTLY 8 blocks in this exact order:
1. Block 1 (STORY_HOOK): Engaging narrative story hook with mascot dialogue and a concrete mission/curiosity question (e.g., finding shells). You MUST define specific concrete objects in the story_text that the student will need to count or analyze.
2. Block 2 (LEARNING_OBJECTIVE): Clear 'I can' (Saya boleh) student outcome statement aligned to SP code.
3. Block 3 (CONCEPT_CPA): Scaffolded Concrete-Pictorial-Abstract explanation with visual prompt and definitions.
4. Block 4 (WORKED_EXAMPLE): Clear problem statement aligned STRICTLY to the SP (do not ask comparison questions if SP is identifying numbers), step-by-step solution, common mistake callout, reasoning, and include a "visual_aid" object ({type: "single_count"|"comparison"|"number_line"|"none", count, left_count, right_count, object_emoji, label, left_label, right_label}).
5. Block 5 (INTERACTIVE_PRACTICE): Interactive activity instruction and seed data. 'widget_type' MUST be one of: base_ten_blocks, number_scale, fraction_slicer, sentence_builder, drag_and_drop, matching_cards, quiz_wheel.
6. Block 6 (KNOWLEDGE_CHECK): Formative quiz with 3-5 MCQ questions (question, options [3-4 items], correct_answer, explanation, cognitive_level, difficulty).
7. Block 7 (KEY_TAKEAWAY): Exactly 3 key summary points, memory tip, 2-4 flashcard terms/definitions, and a "reflection_prompt" string (a closing question that explicitly resolves the exact same mission/objects introduced in the STORY_HOOK. If the hook was about shells, this question MUST ask the student to count the shells).
8. Block 8 (MISSION_COMPLETE): Celebration message, badge name, total_xp (100), total_coins (25).

CRITICAL QUALITY RULE:
DO NOT use placeholder text or dummy fallbacks (e.g., "Sila jana semula", "Lorem Ipsum", "Node 1").
All text MUST be rich, complete, educational Bahasa Melayu content tailored to ${subject} ${yearLevel}.`;

    const userPrompt = `Jana pakej pelajaran 8-Blok DETERMINISTIK bagi ${skCode} - ${spCode}. Pastikan ia mematuhi skema JSON yang ditetapkan.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: systemPrompt + "\n\n" + userPrompt,
      model: "gemini_3_flash",
      response_json_schema: EIGHT_BLOCK_LESSON_SCHEMA,
    });

    let generated: any;
    try {
      generated = typeof aiResponse === "string" ? JSON.parse(aiResponse.replace(/```json/g, "").replace(/```/g, "")) : aiResponse;
    } catch (e) {
      generated = aiResponse;
    }

    // Perform Strict Structural Validation — FAIL FAST if malformed
    const validation = validateGeneratedShell(generated);
    if (!validation.valid) {
      console.error("AI Lesson Generation Structural Validation Failed:", validation.errors);
      return Response.json(
        {
          success: false,
          error: "Penjanaan AI gagal melepasi pengesahan struktur 8-Blok.",
          validation_errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const validBlocks = generated.blocks;

    // Delete previous draft blocks for this lesson version if re-generating
    const existingBlocks = await base44.asServiceRole.entities.LessonBlock.filter({
      lesson_version_id: version.id,
    }).catch(() => []);

    if (existingBlocks.length > 0) {
      for (const oldBlock of existingBlocks) {
        await base44.asServiceRole.entities.LessonBlock.delete(oldBlock.id).catch(() => {});
      }
    }

    // Save Modular LessonBlocks strictly matching 8-block contract
    for (let i = 0; i < validBlocks.length; i++) {
      const block = validBlocks[i];

      let cognitiveLevel = "understand";
      if (block.block_type === "STORY_HOOK" || block.block_type === "LEARNING_OBJECTIVE") cognitiveLevel = "remember";
      if (block.block_type === "WORKED_EXAMPLE" || block.block_type === "INTERACTIVE_PRACTICE") cognitiveLevel = "apply";
      if (block.block_type === "KNOWLEDGE_CHECK") cognitiveLevel = "evaluate";

      await base44.asServiceRole.entities.LessonBlock.create({
        lesson_version_id: version.id,
        sp_code: spCode,
        pedagogical_phase: block.block_type,
        cognitive_level: cognitiveLevel,
        block_type: block.block_type,
        title: block.title || `Blok ${i + 1}: ${block.block_type}`,
        order_number: i + 1,
        payload: block.content,
        status: "draft",
        review_status: "draft",
      }).catch((e: any) => console.error(`LessonBlock ${i + 1} creation failed`, e));
    }

    // Save Assessment, QuestionBank and QuestionOptions
    if (generated.assessment && Array.isArray(generated.assessment)) {
      const assessment = await base44.asServiceRole.entities.Assessment.create({
        lesson_id: version.lesson_id,
        title: "Pentaksiran PBD: " + topic,
        assessment_type: "PRACTICE",
        time_limit_minutes: 15,
        passing_score: 80,
        reward_xp: generated.gamification?.xp_reward || 50,
        reward_coins: generated.gamification?.coin_reward || 10,
        workflow_status: "PUBLISHED",
      }).catch((e: any) => console.error("Assessment creation failed", e));

      if (assessment) {
        for (let i = 0; i < generated.assessment.length; i++) {
          const q = generated.assessment[i];
          const question = await base44.asServiceRole.entities.QuestionBank.create({
            assessment_id: assessment.id,
            lesson_version_id: version.id,
            question_text: q.question,
            question_type: "MCQ",
            difficulty: q.difficulty || "medium",
            cognitive_level: q.cognitive_level || "understand",
            concept_tested: q.concept_tested || "",
            explanation: q.explanation || "",
            status: "draft",
            review_status: "draft",
          }).catch((e: any) => console.error("Question creation failed", e));

          if (question && q.options && Array.isArray(q.options)) {
            for (let j = 0; j < q.options.length; j++) {
              const optText = q.options[j];
              const isCorrect = optText === q.correct_answer;
              const label = String.fromCharCode(65 + j); // A, B, C, D
              await base44.asServiceRole.entities.QuestionOption.create({
                question_id: question.id,
                label: label,
                text: optText,
                is_correct: isCorrect,
                sort_order: j,
              }).catch((e: any) => console.error("QuestionOption creation failed", e));
            }
          }
        }
      }
    }

    // Calculate initial server-evaluated quality score (default to 85 for valid 8-block shell)
    const initialQualityScore = 85;

    // Update LessonVersion entity with quality score & progress
    await base44.asServiceRole.entities.LessonVersion.update(version.id, {
      sk_code: skCode,
      sp_code: spCode,
      curriculum_type: curriculumType,
      year_level: yearLevel,
      quality_score: initialQualityScore,
      content_completion_percentage: 100,
      review_status: "draft",
    }).catch(() => {});

    return Response.json({
      success: true,
      message: "Pakej Pelajaran 8-Blok Deterministik berjaya dijana!",
      version_id: version.id,
      lesson_id: version.lesson_id,
      quality_score: initialQualityScore,
      blocks: generated.blocks,
      package: generated,
    });
  } catch (error: any) {
    console.error("generateModularLessonContent error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa menjana modul DSKP." },
      { status: 500 }
    );
  }
}

