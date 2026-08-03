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
                    hint: { type: "string" }
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
                    explanation: { type: "string" }
                  },
                  required: ["question", "options", "correct_answer", "explanation"]
                }
              },
              steps: { 
                type: "array",
                items: { type: "string" }
              }
            }
          }
        },
        required: ["id", "phase", "type", "title", "content"]
      },
      minItems: 5,
      maxItems: 5
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

    const systemPrompt = `Anda ialah Pakar Penggubal Kurikulum Kementerian Pendidikan Malaysia (KPM) berikutan standard ${curriculumType} (DSKP).
Tugas anda ialah membina SATU PAKEJ PELAJARAN LENGKAP 5-FASA DSKP bagi:
- Subjek: ${subject}
- Tingkat/Tahun: ${yearLevel}
- Topik: ${topic}
- Standard Kandungan (SK): ${skCode}
- Standard Pembelajaran (SP): ${spCode}
- Bahasa: ${language}
- Taksonomi: ${taxonomy}

SYARAT WAJIB OUTPUT JSON ANDA:
Anda mesti menjana struktur JSON yang mengandungi 'lesson_title' (tajuk pembelajaran berdasarkan SP), 'sp_code' yang sepadan, dan tepat 5 blok pembelajaran berikutan 5 fasa pedagogi di bawah:

1. Block 1 (phase: "ENGAGEMENT"): Hook / Set Induksi. (type: "TEXT_MARKDOWN")
2. Block 2 (phase: "CONCEPT"): Pengajaran Konsep secara visual atau nota. (type: "MIND_MAP" atau "TEXT_MARKDOWN")
3. Block 3 (phase: "PRACTICE"): Latihan Interaktif atau Kad Imbasan. (type: "FLASHCARD_DECK" atau "INTERACTIVE_GAME")
4. Block 4 (phase: "APPLICATION"): Aplikasi Kemahiran / Ujian Praktikal. (type: "TEXT_MARKDOWN")
5. Block 5 (phase: "PBD_ASSESSMENT"): Pentaksiran Akhir (type: "INTERACTIVE_GAME")

Contoh struktur untuk blocks:
[
  { "id": "b1", "phase": "ENGAGEMENT", "type": "TEXT_MARKDOWN", "title": "Misteri Suku Penyu", "content": { "markdown": "Teks cerita berserta formatting..." } },
  { "id": "b2", "phase": "CONCEPT", "type": "MIND_MAP", "title": "Peta Konsep", "content": { "nodes": [{ "id": "1", "label": "Konsep Utama", "children": [] }] } },
  { "id": "b3", "phase": "PRACTICE", "type": "FLASHCARD_DECK", "title": "Kad Imbasan", "content": { "cards": [{ "front": "Soalan", "back": "Jawapan", "hint": "Klu" }] } },
  { "id": "b4", "phase": "APPLICATION", "type": "WORKED_EXAMPLE", "title": "Contoh Terbimbing", "content": { "steps": ["Langkah 1", "Langkah 2"] } },
  { "id": "b5", "phase": "PBD_ASSESSMENT", "type": "INTERACTIVE_GAME", "title": "Ujian Akhir PBD", "content": { "questions": [{ "question": "Berapakah...", "options": ["A", "B", "C"], "correct_answer": "A", "explanation": "Kerana..." }] } }
]

Sertakan juga objektif 'gamification' (xp_reward, coin_reward) dan 'assessment' array (30% Remember, 40% Understand/Apply, 30% HOTS/KBAT).`;

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

    // Update LessonVersion entity
    await base44.asServiceRole.entities.LessonVersion.update(version.id, {
      sk_code: skCode,
      sp_code: spCode,
      curriculum_type: curriculumType,
      year_level: yearLevel,
      content_completion_percentage: 95,
    }).catch(() => {});

    // Save Modular LessonBlocks Dynamically
    if (generated.blocks && Array.isArray(generated.blocks)) {
      for (let i = 0; i < generated.blocks.length; i++) {
        const block = generated.blocks[i];
        
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
