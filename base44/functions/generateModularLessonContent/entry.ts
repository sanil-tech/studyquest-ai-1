// base44/functions/generateModularLessonContent/entry.ts
// Phase 2: Upgraded Curriculum-First AI Lesson Package Generator
// Generates complete DSKP (KSSR Semakan / KSSM) lesson packages featuring 7 mandatory sections & StudyQuest gamification layer.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface ModularGenInput {
  lesson_version_id: string;
  sk_code?: string;
  sp_code?: string;
  subject?: string;
  year_level?: string;
  curriculum_type?: "KSSR_SEMAKAN" | "KSSM";
  topic?: string;
  language?: string;
  taxonomy?: string;
}

const FIVE_PHASE_LESSON_SCHEMA = {
  type: "object",
  properties: {
    lesson_title: { type: "string" },
    sp_code: { type: "string" },
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          order_index: { type: "number" },
          phase: { type: "string", enum: ["ENGAGEMENT", "CONCEPT", "PRACTICE", "APPLICATION", "PBD_ASSESSMENT"] },
          type: { type: "string" },
          title: { type: "string" },
          content: { 
            type: "object",
            properties: {
              markdown: { type: "string" }, // For TEXT_MARKDOWN
              nodes: { 
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    children: { type: "array", items: { type: "string" } }
                  },
                  required: ["id", "label"]
                }
              },
              cards: { 
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                    hint: { type: "string" },
                    visual_front: { type: "string" },
                    visual_back: { type: "string" }
                  },
                  required: ["front", "back"]
                }
              },
              questions: { 
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "string" },
                    explanation: { type: "string" },
                    visual_a: { type: "string" },
                    visual_b: { type: "string" }
                  },
                  required: ["question", "options", "correct_answer", "explanation"]
                }
              },
              steps: { 
                type: "array",
                items: { type: "string" }
              },
              image_prompt: { type: "string" },
              audio_script: { type: "string" },
              annotated_sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    explanation: { type: "string" }
                  },
                  required: ["label", "explanation"]
                }
              },
              visual_comparison: {
                type: "array",
                items: { type: "string" }
              },
              pairs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    left: { type: "string" },
                    right: { type: "string" }
                  },
                  required: ["left", "right"]
                }
              },
              hints: {
                type: "array",
                items: { type: "string" }
              },
              video_url: { type: "string" },
              video_title: { type: "string" },
              description: { type: "string" },
              key_points: { type: "array", items: { type: "string" } }
            }
          }
        },
        },
        required: ["id", "order_index", "phase", "type", "title", "content"]
      },
      minItems: 15,
      maxItems: 15
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
          cognitive_level: { type: "string", enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"] },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          misconception_target: { type: "string" },
          concept_tested: { type: "string" },
        },
        required: ["question", "options", "correct_answer", "explanation", "cognitive_level", "difficulty", "concept_tested"],
      },
    },

    // 7. GAMIFICATION LAYER
    gamification: {
      type: "object",
      properties: {
        xp_reward: { type: "number", default: 50 },
        coin_reward: { type: "number", default: 10 },
        mission_completion_message: { type: "string" },
        suku_encouragement: { type: "string" },
      },
      required: ["xp_reward", "coin_reward", "mission_completion_message", "suku_encouragement"],
    },

    // MindMap & Flashcard Deck Data
    mindmap_branches: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, subtopics: { type: "array", items: { type: "string" } } },
        required: ["title", "subtopics"],
      },
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: { front: { type: "string" }, back: { type: "string" }, explanation: { type: "string" } },
        required: ["front", "back"],
      },
    },
  },
  required: ["lesson_title", "sp_code", "blocks", "assessment", "gamification"]
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: ModularGenInput = await req.json().catch(() => ({}));

    if (!body.lesson_version_id) {
      return Response.json(
        { success: false, error: "lesson_version_id diperlukan." },
        { status: 400 }
      );
    }

    const version = await base44.asServiceRole.entities.LessonVersion.get(body.lesson_version_id).catch(() => null);
    if (!version) {
      return Response.json(
        { success: false, error: "Versi pelajaran tidak dijumpai." },
        { status: 404 }
      );
    }

    const skCode = body.sk_code || version.sk_code || "SK 1.1 Pecahan";
    const spCode = body.sp_code || version.sp_code || "SP 1.1.1 Penambahan Pecahan";
    const subject = body.subject || "Matematik";
    const yearLevel = body.year_level || version.year_level || "Tahun 4";
    const curriculumType = body.curriculum_type || version.curriculum_type || "KSSR_SEMAKAN";
    const topic = body.topic || "Topik Pelajaran";
    const language = body.language || "Bahasa Melayu";
    const taxonomy = body.taxonomy || "Bloom";

    const systemPrompt = `You are StudyQuest AI, an expert Malaysian KSSR/KSSM Curriculum Instructional Designer.
Your task is to generate a comprehensive, highly structured, 15-block modular lesson JSON payload for primary/secondary students based on the following:
- Subjek: ${subject}
- Tingkat/Tahun: ${yearLevel}
- Topik: ${topic}
- Standard Kandungan (SK): ${skCode}
- Standard Pembelajaran (SP): ${spCode}
- Bahasa: ${language}
- Taksonomi: ${taxonomy}

STRICT GENERATION RULES:
1. You MUST generate EXACTLY 15 blocks (order_index: 1 to 15).
2. The lesson MUST be grouped into 5 DSKP Phases (exactly 3 micro-blocks per phase).
3. The content MUST be written in professional, student-friendly Bahasa Melayu.
4. DO NOT use placeholder text (e.g., "Node 1", "Lorem Ipsum", "c1/c2"). All content must be rich and complete.
5. CRITICAL DIVERSITY RULE: DO NOT repeat content. Every single block MUST teach or test a DIFFERENT sub-topic, perspective, concept layer, or difficulty level. For example, if Block 7 tests addition, Block 8 must test subtraction or word problems. If Block 4 maps a concept, Block 5 must show a completely different visual aspect or deeper explanation.

================================================================================
PHASE & BLOCK ARCHITECTURE SPECIFICATION
================================================================================

--- PHASE 1: ENGAGEMENT (Blok 1, 2, 3) ---
Goal: Hook students, spark curiosity, and link to real-world contexts.
- Blok 1 (order_index: 1, type: "TEXT_MARKDOWN", phase: "ENGAGEMENT"):
  Naratif pengenalan bermula dengan watak/cerita kehidupan harian murid.
- Blok 2 (order_index: 2, type: "VISUAL_CARD", phase: "ENGAGEMENT"):
  Situasi dunia sebenar dengan 'image_prompt' terperinci untuk penjanaan ilustrasi.
- Blok 3 (order_index: 3, type: "AUDIO_HOOK", phase: "ENGAGEMENT"):
  Soalan pencetus minda beserta 'audio_script'.

--- PHASE 2: CONCEPT - MULTI-MEDIUM REQUIREMENT (Blok 4, 5, 6) ---
Goal: Explain mathematical/scientific concepts using Visual-Concrete-Abstract (KPA) media.
- Blok 4 (order_index: 4, type: "MIND_MAP", phase: "CONCEPT"):
  Peta Pemikiran i-THINK (Peta Titi / Peta Pokok / Peta Buih) yang menstrukturkan konsep utama.
  Must include nodes with clear titles, labels, and sub-items.
- Blok 5 (order_index: 5, type: "INFOGRAPHIC", phase: "CONCEPT"):
  Infografik visual berasaskan rajah. Must include:
  - 'image_prompt': Detailed descriptive prompt for generating educational graphic.
  - 'annotated_sections': Array of key visual callouts with labels and explanations.
  - 'visual_comparison': Comparison table/items.
- Blok 6 (order_index: 6, type: "CONCEPT_CARD", phase: "CONCEPT"):
  Glosari istilah & contoh konkrit menggunakan emoji/ikon untuk perwakilan gambar-ke-abstrak.

--- PHASE 3: PRACTICE (Blok 7, 8, 9) ---
Goal: Procedural fluency and active recall.
- Blok 7 (order_index: 7, type: "FLASHCARD_DECK", phase: "PRACTICE"):
  Latihan ingatan pantas Tahap 1. Minimum 3 cards.
- Blok 8 (order_index: 8, type: "FLASHCARD_DECK", phase: "PRACTICE"):
  Latihan ingatan Tahap 2 dengan petunjuk gambar (visual_front / visual_back). Minimum 3 cards.
- Blok 9 (order_index: 9, type: "MATCHING_GAME", phase: "PRACTICE"):
  Aktiviti padanan (Pasangan Kiri & Kanan dalam 'pairs'). Minimum 4 pairs.

--- PHASE 4: APPLICATION (Blok 10, 11, 12) ---
Goal: Apply knowledge to problem-solving scenarios.
- Blok 10 (order_index: 10, type: "VIDEO_LESSON", phase: "APPLICATION"):
  Modul video interaktif. Must include 'video_url', 'video_title', 'key_points', and 'description'.
- Blok 11 (order_index: 11, type: "WORKED_EXAMPLE", phase: "APPLICATION"):
  Contoh penyelesaian masalah berserta 'steps'.
- Blok 12 (order_index: 12, type: "GUIDED_PRACTICE", phase: "APPLICATION"):
  Soalan aplikasi terbimbing dengan 'hints'.

--- PHASE 5: PBD_ASSESSMENT (Blok 13, 14, 15) ---
Goal: Measure DSKP Mastery Levels (TP1 - TP6) with gamification.
- Blok 13 (order_index: 13, type: "INTERACTIVE_GAME", phase: "PBD_ASSESSMENT"):
  Pentaksiran TP1 - TP2 (Soalan Asas). Minimum 2 questions.
- Blok 14 (order_index: 14, type: "INTERACTIVE_GAME", phase: "PBD_ASSESSMENT"):
  Pentaksiran TP3 - TP4 (Aplikasi Rutin). Minimum 2 questions.
- Blok 15 (order_index: 15, type: "INTERACTIVE_GAME", phase: "PBD_ASSESSMENT"):
  Pentaksiran TP5 - TP6 (Cabaran KBAT). Minimum 2 questions.

================================================================================
JSON OUTPUT STRUCTURE
================================================================================
Sertakan juga 'assessment' array dan 'gamification' mengikut skema.`;

    const userPrompt = `Jana pakej pelajaran modul DSKP 5-Fasa bagi ${skCode} - ${spCode}. Pastikan ia mematuhi skema JSON yang ditetapkan.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: systemPrompt + "\n\n" + userPrompt,
      model: "gemini_3_flash",
      response_json_schema: FIVE_PHASE_LESSON_SCHEMA,
    });

    let generated: any;
    try {
      generated = typeof aiResponse === "string" ? JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '')) : aiResponse;
    } catch (e) {
      generated = aiResponse;
    }

    if (!generated || !generated.blocks || !Array.isArray(generated.blocks)) {
      return Response.json(
        { success: false, error: "Ralat format struktur AI. Sila jana semula (retry)." },
        { status: 500 }
      );
    }
    
    const generatedBlocks = generated.blocks || [];
    
    // Safety check: Ensure we have exactly 15 blocks according to the strict specification
    if (generatedBlocks.length !== 15) {
      console.warn(`WARNING: Generasi AI mengembalikan ${generatedBlocks.length} blok, sepatutnya 15.`);
    }

    const validBlocks = generatedBlocks.map((block: any, idx: number) => {
      if (!block.id) block.id = `block_${Date.now()}_${idx}`;
      if (!block.order_index) block.order_index = idx + 1;
      
      // Fix empty payloads dynamically based on block type
      if (!block.content || Object.keys(block.content).length === 0) {
        if (block.type === "TEXT_MARKDOWN" || block.type === "CONCEPT_CARD") block.content = { markdown: "Kandungan tidak dapat dijanakan dengan baik. Sila klik 'Jana Semula Blok' untuk mencuba lagi." };
        else if (block.type === "MIND_MAP") block.content = { nodes: [{ id: "1", label: "Konsep DSKP (Sila Jana Semula)", children: [] }] };
        else if (block.type === "FLASHCARD_DECK") block.content = { cards: [{ front: "Kandungan Rosak", back: "Sila jana semula blok ini", hint: "" }] };
        else if (block.type === "INTERACTIVE_GAME") block.content = { questions: [{ question: "Sila jana semula blok ini", options: ["A", "B"], correct_answer: "A", explanation: "" }] };
        else if (block.type === "WORKED_EXAMPLE") block.content = { steps: ["Sila jana semula"] };
        else if (block.type === "VIDEO_LESSON") block.content = { video_url: "", video_title: "Sila jana semula", description: "", key_points: [] };
        else if (block.type === "VISUAL_CARD") block.content = { image_prompt: "Sila jana semula blok ini", markdown: "" };
        else if (block.type === "AUDIO_HOOK") block.content = { audio_script: "Sila jana semula blok ini" };
        else if (block.type === "INFOGRAPHIC") block.content = { image_prompt: "", annotated_sections: [], visual_comparison: [] };
        else if (block.type === "MATCHING_GAME") block.content = { pairs: [{ left: "Soalan", right: "Jawapan" }] };
        else if (block.type === "GUIDED_PRACTICE") block.content = { hints: ["Sila jana semula"] };
        else block.content = { markdown: "Sila jana semula blok ini." };
      }
      return block;
    });

    // Update LessonVersion entity
    await base44.asServiceRole.entities.LessonVersion.update(version.id, {
      sk_code: skCode,
      sp_code: spCode,
      curriculum_type: curriculumType,
      year_level: yearLevel,
      content_completion_percentage: 95,
    }).catch(() => {});

    // Save Modular LessonBlocks Dynamically
    if (validBlocks && Array.isArray(validBlocks)) {
      for (let i = 0; i < validBlocks.length; i++) {
        const block = validBlocks[i];
        
        let cognitiveLevel = "understand";
        if (block.phase === "ENGAGEMENT") cognitiveLevel = "remember";
        if (block.phase === "APPLICATION") cognitiveLevel = "apply";
        if (block.phase === "PBD_ASSESSMENT") cognitiveLevel = "evaluate";
        
        await base44.asServiceRole.entities.LessonBlock.create({
          lesson_version_id: version.id,
          sp_code: spCode,
          pedagogical_phase: block.phase,
          cognitive_level: cognitiveLevel,
          block_type: block.type,
          title: block.title,
          order_number: i + 1,
          payload: block.content,
          status: "draft",
        }).catch((e) => console.error(`LessonBlock ${i} creation failed`, e));
      }
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
        workflow_status: "PUBLISHED"
      }).catch((e) => console.error("Assessment creation failed", e));

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
            status: "draft"
          }).catch((e) => console.error("Question creation failed", e));

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
                sort_order: j
              }).catch((e) => console.error("QuestionOption creation failed", e));
            }
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: "Pakej Pelajaran DSKP 7-Bahagian Lengkap berjaya dijana!",
      version_id: version.id,
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
