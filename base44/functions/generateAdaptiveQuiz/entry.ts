// base44/functions/generateAdaptiveQuiz/entry.ts
// StudyQuest Adaptive Tutor - Generates targeted 10-question adaptive quizzes
// 70% Weakness Targeting, 30% Revision, DSKP KSSR/KSSM aligned with misconception distractors.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface AdaptiveQuizRequest {
  student_id?: string;
  subject?: string;
  topic_name?: string;
  mastery?: string;
  weakness?: string;
  recommended_level?: string;
  form_level?: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: AdaptiveQuizRequest = await req.json().catch(() => ({}));

    // 1. Auth Check
    let authUser: any = null;
    try {
      authUser = await base44.auth.me();
    } catch {
      /* fallback session */
    }

    const studentId = body.student_id || authUser?.id;
    if (!studentId) {
      return Response.json(
        { success: false, error: "Sesi pelajar tidak disahkan." },
        { status: 401 }
      );
    }

    // 2. Resolve Profile & Context
    const subject = body.subject || "Matematik";
    const topicName = body.topic_name || "Pembelajaran Adaptif";
    const recommendedLevel = body.recommended_level || body.form_level || "Tahun 4";
    const mastery = body.mastery || "Konsep Asas & Pengiraan Asas";
    const weakness = body.weakness || "Penyelesaian Masalah Berayat & Pecahan";

    // 3. Build StudyQuest Adaptive Tutor Prompt
    const promptText = `Anda ialah StudyQuest Adaptive Tutor, pakar tutor pembelajaran adaptif untuk kurikulum KSSR/KSSM Malaysia.

PROFIL PELAJAR STUDYQUEST:
- Subjek: ${subject}
- Topik / Modul: ${topicName}
- Tahap / Kesukaran Disyorkan: ${recommendedLevel}
- Tahap Penguasaan / Mastery (Kekuatan): ${mastery}
- Kelemahan Utama / Conceptual Weakness: ${weakness}

================================================
ATURAN AGIHAN 10 SOALAN (70% WEAKNESS / 30% REVISION):
1. 70% (7 Soalan): MESTI memfokuskan secara spesifik kepada kelemahan pelajar: "${weakness}". Bimbing pelajar mengatasi kesilapan miskonsepsi dalam domain ini.
2. 30% (3 Soalan): Memfokuskan kepada pengukuhan / semakan semula (revision) bagi kekuatan pelajar: "${mastery}".

================================================
PERATURAN PILIHAN JAWAPAN (MCQ & DISTRACTORS):
1. SETIAP jawapan salah (distractor) MESTI mewakili kesilapan lazim (realistic Malaysian student misconception) yang spesifik kepada tajuk ini.
2. Tiada jawapan jenaka atau terlalu mudah diteka.
3. Sertakan penjelasan terperinci (explanation) dan sasaran miskonsepsi (misconception_target) untuk setiap soalan.

Jana JSON mengikut format persis berikut:
{
  "title": "Kuiz Adaptif: ${topicName}",
  "target_weakness": "${weakness}",
  "questions": [
    {
      "question_text": "Soalan adaptif yang jelas...",
      "options": [
        { "label": "A", "text": "Jawapan A" },
        { "label": "B", "text": "Jawapan B" },
        { "label": "C", "text": "Jawapan C" },
        { "label": "D", "text": "Jawapan D" }
      ],
      "correct_answer": "A",
      "explanation": "Penjelasan terperinci mengapa jawapan ini betul dan cara membetulkan kefahaman...",
      "cognitive_level": "understand",
      "misconception_target": "Kesilapan lazim yang dikenal pasti",
      "difficulty": "${recommendedLevel}"
    }
  ]
}`;

    // 4. Invoke LLM via Core integration
    const aiRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: promptText,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          target_weakness: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question_text: { type: "string" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      text: { type: "string" },
                    },
                    required: ["label", "text"],
                  },
                },
                correct_answer: { type: "string" },
                explanation: { type: "string" },
                cognitive_level: { type: "string" },
                misconception_target: { type: "string" },
                difficulty: { type: "string" },
              },
              required: [
                "question_text",
                "options",
                "correct_answer",
                "explanation",
                "cognitive_level",
                "misconception_target",
              ],
            },
          },
        },
        required: ["title", "questions"],
      },
    });

    return Response.json({
      success: true,
      quiz: aiRes,
      student_id: studentId,
      recommended_level: recommendedLevel,
    });
  } catch (error: any) {
    console.error("generateAdaptiveQuiz error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat pelayan semasa menjana kuiz adaptif." },
      { status: 500 }
    );
  }
}
