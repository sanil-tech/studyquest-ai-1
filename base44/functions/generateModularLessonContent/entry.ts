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

const SEVEN_PART_LESSON_SCHEMA = {
  type: "object",
  properties: {
    // 1. LESSON IDENTITY
    identity: {
      type: "object",
      properties: {
        subject: { type: "string" },
        year_level: { type: "string" },
        topic: { type: "string" },
        sk_code: { type: "string" },
        sp_code: { type: "string" },
        learning_objectives: { type: "array", items: { type: "string" } },
        success_criteria: { type: "array", items: { type: "string" } },
      },
      required: ["subject", "year_level", "topic", "sk_code", "sp_code", "learning_objectives", "success_criteria"],
    },

    // 2. STUDENT ENGAGEMENT HOOK (Suku Mascot Mystery)
    engagement_hook: {
      type: "object",
      properties: {
        mascot: { type: "string", default: "Suku Penyu 🐢" },
        mystery_title: { type: "string" },
        story_problem: { type: "string" },
        curiosity_question: { type: "string" },
      },
      required: ["mystery_title", "story_problem", "curiosity_question"],
    },

    // 3. CONCEPT EXPLANATION
    concept_explanation: {
      type: "object",
      properties: {
        notes_markdown: { type: "string" },
        dbp_terminology: { type: "array", items: { type: "string" } },
        visual_suggestions: { type: "array", items: { type: "string" } },
      },
      required: ["notes_markdown"],
    },

    // 4. GUIDED EXAMPLES
    guided_examples: {
      type: "array",
      items: {
        type: "object",
        properties: {
          problem: { type: "string" },
          step_by_step_solution: { type: "array", items: { type: "string" } },
          common_student_mistake: { type: "string" },
          correct_reasoning: { type: "string" },
        },
        required: ["problem", "step_by_step_solution", "common_student_mistake", "correct_reasoning"],
      },
    },

    // 5. LEARNING ACTIVITIES (MINIMUM 3)
    learning_activities: {
      type: "object",
      properties: {
        matching_game: {
          type: "object",
          properties: {
            title: { type: "string" },
            instructions: { type: "string" },
            pairs: {
              type: "array",
              items: {
                type: "object",
                properties: { left: { type: "string" }, right: { type: "string" } },
                required: ["left", "right"],
              },
            },
          },
          required: ["title", "instructions", "pairs"],
        },
        sorting_activity: {
          type: "object",
          properties: {
            title: { type: "string" },
            category_a: { type: "string" },
            category_b: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: { text: { type: "string" }, category: { type: "string" } },
                required: ["text", "category"],
              },
            },
          },
          required: ["title", "category_a", "category_b", "items"],
        },
        real_life_challenge: {
          type: "object",
          properties: {
            title: { type: "string" },
            scenario: { type: "string" },
            task: { type: "string" },
          },
          required: ["title", "scenario", "task"],
        },
      },
      required: ["matching_game", "sorting_activity", "real_life_challenge"],
    },

    // 6. BALANCED ASSESSMENT (30% Remember, 40% Understand/Apply, 30% HOTS/KBAT)
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
  required: [
    "identity",
    "engagement_hook",
    "concept_explanation",
    "guided_examples",
    "learning_activities",
    "assessment",
    "gamification",
    "mindmap_branches",
    "flashcards"
  ],
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

    const systemPrompt = `Anda ialah Pakar Penggubal Kurikulum Kementerian Pendidikan Malaysia (KPM) berikutan standard ${curriculumType} (DSKP).
Tugas anda ialah membina SATU PAKEJ PELAJARAN LENGKAP 7-BAHAGIAN DSKP bagi:
- Subjek: ${subject}
- Tingkat/Tahun: ${yearLevel}
- Topik: ${topic}
- Standard Kandungan (SK): ${skCode}
- Standard Pembelajaran (SP): ${spCode}
- Bahasa: ${language}
- Taksonomi: ${taxonomy}

SYARAT 7 BAHAGIAN WAJIB:
1. Lesson Identity: SK/SP, Objektif & Kriteria Kejayaan.
2. Student Engagement Hook: Set induksi berunsur misteri/cabaran bersama Maskot Suku Penyu 🐢 mengikut konteks kehidupan harian murid Malaysia.
3. Concept Explanation: Bahasa Melayu istilah DBP, penjelasan mesra murid tanpa menyalin buku teks.
4. Guided Examples: Contoh terbimbing langkah demi langkah TERMASUK kesilapan lazim murid & penaakulan betul.
5. Learning Activities: Minima 3 aktiviti (Suai padan, Isih Kategori, Cabaran Kehidupan Sebenar).
6. Balanced Assessment: Agihan Bloom (30% Remember, 40% Understand/Apply, 30% HOTS/KBAT).
7. Gamification Layer: Tetapkan XP Reward (50 XP), Syiling (10 Coins), Pesanan Kejayaan Misi & Kata Semangat Suku 🐢.`;

    const userPrompt = `Jana pakej pelajaran modul DSKP 7-bahagian lengkap bagi ${skCode} - ${spCode}.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: systemPrompt + "\n\n" + userPrompt,
      model: "gemini_3_flash",
      response_json_schema: SEVEN_PART_LESSON_SCHEMA,
    });

    let generated: any;
    try {
      generated = typeof aiResponse === "string" ? JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '')) : aiResponse;
    } catch (e) {
      generated = aiResponse;
    }

    // Update LessonVersion entity
    await base44.asServiceRole.entities.LessonVersion.update(version.id, {
      sk_code: skCode,
      sp_code: spCode,
      curriculum_type: curriculumType,
      year_level: yearLevel,
      notes_content: generated.concept_explanation.notes_markdown,
      mindmap_data: JSON.stringify(generated.mindmap_branches),
      content_completion_percentage: 95,
    }).catch(() => {});

    // Save Modular LessonBlocks
    await base44.asServiceRole.entities.LessonBlock.create({
      lesson_version_id: version.id,
      sp_code: spCode,
      pedagogical_phase: "INDUCTION",
      cognitive_level: "remember",
      block_type: "TEXT_MARKDOWN",
      title: generated.engagement_hook.mystery_title || "Set Induksi Bersama Suku 🐢",
      order_number: 1,
      payload: { markdown: `### 🐢 Misteri Suku\n${generated.engagement_hook.story_problem}\n\n**❓ Cabaran:** ${generated.engagement_hook.curiosity_question}` },
      status: "draft",
    }).catch(() => {});

    await base44.asServiceRole.entities.LessonBlock.create({
      lesson_version_id: version.id,
      sp_code: spCode,
      pedagogical_phase: "CONCEPT",
      cognitive_level: "understand",
      block_type: "TEXT_MARKDOWN",
      title: "Penerangan Konsep DSKP",
      order_number: 2,
      payload: { markdown: generated.concept_explanation.notes_markdown, objectives: generated.identity.learning_objectives },
      status: "draft",
    }).catch(() => {});

    await base44.asServiceRole.entities.LessonBlock.create({
      lesson_version_id: version.id,
      sp_code: spCode,
      pedagogical_phase: "CONCEPT",
      cognitive_level: "remember",
      block_type: "MIND_MAP",
      title: "Peta Minda Visual",
      order_number: 3,
      payload: { branches: generated.mindmap_branches },
      status: "draft",
    }).catch(() => {});

    await base44.asServiceRole.entities.LessonBlock.create({
      lesson_version_id: version.id,
      sp_code: spCode,
      pedagogical_phase: "WORKED_EXAMPLE",
      cognitive_level: "apply",
      block_type: "FLASHCARD_DECK",
      title: "Kad Imbasan DBP",
      order_number: 4,
      payload: { cards: generated.flashcards },
      status: "draft",
    }).catch(() => {});

    await base44.asServiceRole.entities.LessonBlock.create({
      lesson_version_id: version.id,
      sp_code: spCode,
      pedagogical_phase: "PBD_ASSESSMENT",
      cognitive_level: "apply",
      block_type: "INTERACTIVE_GAME",
      title: "Aktiviti PBD Suai Padan",
      order_number: 5,
      payload: generated.learning_activities.matching_game,
      status: "draft",
    }).catch(() => {});

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
