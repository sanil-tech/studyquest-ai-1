// base44/functions/getStudentLearningInsights/entry.ts
// Phase 4: Student Learning Intelligence Dashboard Backend Edge Function
// Provides a unified, student-facing AI learning summary, mastery breakdown, adaptive missions, and mascot encouragement.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface InsightsRequestBody {
  student_id?: string;
}

interface StudentSummary {
  total_xp: number;
  level: number;
  coins: number;
}

interface MasteryItem {
  subject: string;
  skill: string;
  mastery_score: number;
  mastery_level: string;
  tp_level: number;
}

interface LearningAlert {
  type: "weakness" | "challenge" | "info";
  title: string;
  description: string;
  action: string;
}

interface AdaptiveMissionItem {
  id: string;
  assessment_id?: string;
  subject: string;
  quiz_tier: string;
  title: string;
  description: string;
  question_count: number;
  status: string;
}

interface AIMessage {
  mascot: "Suku";
  message: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: InsightsRequestBody = await req.json().catch(() => ({}));

    // 1. Resolve Student Identity
    let studentId = body.student_id;
    let authUser: any = null;

    try {
      authUser = await base44.auth.me();
    } catch {
      /* Session check fallback */
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

    // 2. Fetch Data in Parallel (No N+1 Queries)
    const [
      skillProfiles,
      recommendations,
      adaptiveQueue,
      progressList,
      wallets
    ] = await Promise.all([
      base44.asServiceRole.entities.StudentSkillProfile.filter({ student_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.LearningRecommendation.filter({ student_id: studentId, status: "active" }).catch(() => []),
      base44.asServiceRole.entities.AdaptiveQuizQueue.filter({ student_id: studentId, status: "pending" }).catch(() => []),
      base44.asServiceRole.entities.Progress.filter({ student_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.Wallet.filter({ student_id: studentId }).catch(() => [])
    ]);

    // 3. Format Student Summary (XP, Level, Coins)
    const studentProg = progressList[0] || null;
    const studentWallet = wallets[0] || null;

    const studentSummary: StudentSummary = {
      total_xp: studentProg?.total_xp ?? studentProg?.xp ?? 0,
      level: studentProg?.level ?? (Math.floor((studentProg?.total_xp || 0) / 100) + 1),
      coins: studentWallet?.coins ?? studentWallet?.balance ?? 0,
    };

    // 4. Format Mastery Summary (Safely Map Profiles)
    const masterySummary: MasteryItem[] = (skillProfiles || []).map((p: any) => ({
      subject: p.subject || "Matematik",
      skill: p.skill || "Kemahiran Utama",
      mastery_score: p.score ?? p.ewma_score ?? 0,
      mastery_level: p.mastery_level || "developing",
      tp_level: p.tp_level ?? 3,
    }));

    // Calculate Average Mastery for Mascot Speech Logic
    const avgMasteryScore =
      masterySummary.length > 0
        ? Math.round(
            masterySummary.reduce((sum, item) => sum + item.mastery_score, 0) /
              masterySummary.length
          )
        : 70;

    // 5. Format Learning Alerts from Active Recommendations
    const learningAlerts: LearningAlert[] = (recommendations || []).map((r: any) => ({
      type: r.recommendation_type === "remediation" ? "weakness" : r.recommendation_type === "challenge" ? "challenge" : "info",
      title: `Cadangan Adaptif: ${r.subject || "Pelajaran"}`,
      description: r.diagnosis || "Suku mendapati anda mempunyai ruang untuk peningkatan.",
      action: r.recommended_action || "Ambil Misi Adaptif",
    }));

    // 6. Format Pending Adaptive Missions (Shielding Security Fields)
    const adaptiveMissions: AdaptiveMissionItem[] = (adaptiveQueue || []).map((m: any) => {
      let qIds: string[] = [];
      try {
        qIds = typeof m.question_ids_json === "string" ? JSON.parse(m.question_ids_json) : (m.question_ids_json || []);
      } catch {
        qIds = [];
      }

      return {
        id: m.id,
        assessment_id: m.assessment_id || "",
        subject: m.subject || "Pelajaran",
        quiz_tier: m.quiz_tier || "remediation",
        title: `Misi Adaptif (${(m.quiz_tier || "Latihan").toUpperCase()})`,
        description: `Misi sasaran untuk kemahiran ${m.learning_standard_id || "utama"}.`,
        question_count: qIds.length > 0 ? qIds.length : 10,
        status: m.status || "pending",
      };
    });

    // 7. Dynamic Mascot Message ("Suku")
    let sukuMessage = "";
    if (avgMasteryScore < 60) {
      sukuMessage = "Suku nampak kamu hampir menguasai topik ini. Mari cuba misi kecil untuk jadi lebih hebat! 🚀";
    } else if (avgMasteryScore < 85) {
      sukuMessage = "Hebat! Kamu semakin dekat untuk menguasai tajuk ini. Teruskan usaha! 💪";
    } else {
      sukuMessage = "Wah! Kamu semakin pakar. Suku ada cabaran baharu untuk kamu! 🌟";
    }

    const aiMessage: AIMessage = {
      mascot: "Suku",
      message: sukuMessage,
    };

    // 8. Return Clean Security-Shielded Response
    return Response.json({
      success: true,
      student_summary: studentSummary,
      mastery_summary: masterySummary,
      learning_alerts: learningAlerts,
      adaptive_missions: adaptiveMissions,
      ai_message: aiMessage,
    });
  } catch (error: any) {
    console.error("getStudentLearningInsights error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa mengambil maklumat pembelajaran." },
      { status: 500 }
    );
  }
}
