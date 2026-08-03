// base44/functions/createAdaptiveLearningMission/entry.ts
// Learning Intelligence Layer Phase 3 - Closed Loop Adaptive Learning Mission Creator
// Flow: LearningRecommendation -> StudentSkillProfile -> Adaptive Quiz Generation -> QuestionBank -> AdaptiveQuizQueue

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface CreateAdaptiveMissionInput {
  recommendation_id?: string;
  student_id?: string;
  subject?: string;
  learning_standard_id?: string;
  form_level?: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: CreateAdaptiveMissionInput = await req.json().catch(() => ({}));

    // 1. Resolve Student Identity
    let studentId = body.student_id;
    let authUser: any = null;

    try {
      authUser = await base44.auth.me();
    } catch {
      /* session check fallback */
    }

    if (!studentId && authUser) {
      studentId = authUser.id;
    }

    if (!studentId) {
      return Response.json(
        { success: false, error: "Sesi pelajar tidak disahkan." },
        { status: 401 }
      );
    }

    // 2. Resolve Recommendation or Active Context
    let recommendation: any = null;
    if (body.recommendation_id) {
      recommendation = await base44.asServiceRole.entities.LearningRecommendation.get(
        body.recommendation_id
      ).catch(() => null);
    }

    if (!recommendation) {
      // Find latest active recommendation for student
      const activeRecs = await base44.asServiceRole.entities.LearningRecommendation.filter({
        student_id: studentId,
        status: "active",
      }).catch(() => []);
      if (activeRecs.length > 0) {
        recommendation = activeRecs[0];
      }
    }

    const subject = body.subject || recommendation?.subject || "Matematik";
    const skillCode =
      body.learning_standard_id || recommendation?.learning_standard_id || "KEMAHIRAN_ASAS";
    const formLevel = body.form_level || "Tahun 4";

    // 3. DUPLICATE PROTECTION: Check if student already has a PENDING adaptive mission for this skill
    const existingPendingMissions = await base44.asServiceRole.entities.AdaptiveQuizQueue.filter({
      student_id: studentId,
      learning_standard_id: skillCode,
      status: "pending",
    }).catch(() => []);

    if (existingPendingMissions.length > 0) {
      const existingMission = existingPendingMissions[0];
      return Response.json({
        success: true,
        is_existing: true,
        message: "Misi pembelajaran adaptif bagi kemahiran ini sedang aktif.",
        mission_id: existingMission.id,
        assessment_id: existingMission.assessment_id,
        quiz_tier: existingMission.quiz_tier,
        status: existingMission.status,
      });
    }

    // 4. Fetch StudentSkillProfile Context
    const skillProfiles = await base44.asServiceRole.entities.StudentSkillProfile.filter({
      student_id: studentId,
      skill: skillCode,
    }).catch(() => []);

    const profile = skillProfiles[0] || null;
    const masteryScore = profile?.ewma_score ?? recommendation?.mastery_before ?? 50;
    const weaknessSummary =
      profile?.recommendation || recommendation?.diagnosis || "Konsep Asas Topik";
    const quizTier: "remediation" | "reinforcement" | "challenge" =
      recommendation?.recommendation_type ||
      (masteryScore < 60 ? "remediation" : masteryScore < 85 ? "reinforcement" : "challenge");

    // 5. Generate 10 Targeted Adaptive Questions (70% Weakness / 30% Revision)
    const promptText = `Anda ialah StudyQuest Adaptive Tutor (KSSR/KSSM Malaysia).
Jana 10 soalan kuiz adaptif sasaran tinggi bagi pelajar berikut.

PROFIL PELAJAR:
- Subjek: ${subject}
- Kemahiran / Tajuk: ${skillCode}
- Tahap / Kesukaran: ${formLevel}
- Skor Penguasaan (EWMA): ${masteryScore}% (${quizTier.toUpperCase()})
- Kelemahan Utama: ${weaknessSummary}

================================================
AGIHAN 10 SOALAN (70% WEAKNESS / 30% REVISION):
- 7 Soalan (70%): Sasarkan terus kelemahan: "${weaknessSummary}".
- 3 Soalan (30%): Pengukuhan konsep asas.

================================================
DISTRACTOR RULES:
- Setiap pilihan salah MESTI mewakili kesilapan lazim (realistic Malaysian student misconception).
- Tiada jawapan mengarut atau jenaka.

Jana JSON:
{
  "assessment_title": "Misi Adaptif: ${skillCode}",
  "questions": [
    {
      "question_text": "Soalan...",
      "options": [
        { "label": "A", "text": "Jawapan A" },
        { "label": "B", "text": "Jawapan B" },
        { "label": "C", "text": "Jawapan C" },
        { "label": "D", "text": "Jawapan D" }
      ],
      "correct_answer": "A",
      "explanation": "Penjelasan...",
      "cognitive_level": "understand",
      "misconception_target": "Miskonsepsi lazim"
    }
  ]
}`;

    const aiRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: promptText,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          assessment_title: { type: "string" },
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
              },
              required: ["question_text", "options", "correct_answer", "explanation"],
            },
          },
        },
        required: ["assessment_title", "questions"],
      },
    });

    const now = new Date().toISOString();
    const questions = aiRes.questions || [];

    // 6. Create Adaptive Assessment Entity
    const newAssessment = await base44.asServiceRole.entities.Assessment.create({
      title: aiRes.assessment_title || `Misi Adaptif: ${skillCode}`,
      assessment_type: "ADAPTIVE",
      passing_score: 75,
      reward_xp: 60,
      reward_coins: 15,
      workflow_status: "PUBLISHED",
      created_at: now,
    });

    const questionIds: string[] = [];

    // 7. Store QuestionBank & QuestionOption Records
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = `adapt_${newAssessment.id}_${i + 1}`;
      questionIds.push(qId);

      await base44.asServiceRole.entities.QuestionBank.create({
        id: qId,
        assessment_id: newAssessment.id,
        question_text: q.question_text || "",
        question_type: "MCQ",
        correct_answer: q.correct_answer || "A",
        explanation: q.explanation || "",
        difficulty: quizTier === "remediation" ? "easy" : quizTier === "challenge" ? "hard" : "medium",
        cognitive_level: q.cognitive_level || "understand",
        status: "published",
      });

      if (Array.isArray(q.options)) {
        await base44.asServiceRole.entities.QuestionOption.bulkCreate(
          q.options.map((opt: any, optIdx: number) => ({
            question_id: qId,
            label: opt.label || String.fromCharCode(65 + optIdx),
            text: opt.text || "",
            sort_order: optIdx,
          }))
        );
      }
    }

    // 8. Create AdaptiveQuizQueue Entity Record
    const newQueueItem = await base44.asServiceRole.entities.AdaptiveQuizQueue.create({
      student_id: studentId,
      recommendation_id: recommendation?.id || null,
      assessment_id: newAssessment.id,
      subject: subject,
      learning_standard_id: skillCode,
      quiz_tier: quizTier,
      target_skills_json: JSON.stringify([weaknessSummary]),
      question_ids_json: JSON.stringify(questionIds),
      status: "pending",
      created_at: now,
    });

    return Response.json({
      success: true,
      is_existing: false,
      message: "Misi pembelajaran adaptif berjaya dijana.",
      mission_id: newQueueItem.id,
      assessment_id: newAssessment.id,
      quiz_tier: quizTier,
      total_questions: questions.length,
      status: "pending",
    });
  } catch (error: any) {
    console.error("createAdaptiveLearningMission error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa mencipta misi adaptif." },
      { status: 500 }
    );
  }
}
