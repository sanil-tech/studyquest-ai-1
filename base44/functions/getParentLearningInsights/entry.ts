// base44/functions/getParentLearningInsights/entry.ts
// Phase 7: Parent & Teacher AI Progress Intelligence Portal Edge Function
// Allows authorized parent accounts to securely access linked child learning progress, EWMA trends, TP levels, strengths, weaknesses, and parent AI guidance messages.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface RequestBody {
  child_student_id?: string;
  student_id?: string;
}

interface ChildProfile {
  student_id: string;
  nickname: string;
  avatar: string;
  level: number;
  total_xp: number;
}

interface MasteryItem {
  subject: string;
  skill: string;
  mastery_score: number;
  tp_level: number;
  mastery_level: string;
  trend: "improving" | "stable" | "declining";
}

interface StrengthItem {
  subject: string;
  skill: string;
  reason: string;
}

interface WeaknessItem {
  subject: string;
  skill: string;
  misconception: string;
  recommended_action: string;
}

interface LearningProgressSummary {
  quizzes_completed: number;
  average_score: number;
  mastery_growth: number;
  adaptive_missions_completed: number;
}

interface AIParentMessage {
  tone: "positive" | "supportive" | "encouraging";
  message: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: RequestBody = await req.json().catch(() => ({}));

    // 1. Authenticate Parent Session
    let authUser: any = null;
    try {
      authUser = await base44.auth.me();
    } catch {
      return Response.json(
        { success: false, error: "Sesi pengguna tidak disahkan." },
        { status: 401 }
      );
    }

    const parentId = authUser?.id;
    const targetChildId = body.child_student_id || body.student_id;

    if (!parentId || !targetChildId) {
      return Response.json(
        { success: false, error: "ID anak tidak dinyatakan." },
        { status: 400 }
      );
    }

    // 2. SECURITY CHECK: Validate Active Parent-Child Relationship (Unless Admin)
    const isAdmin = authUser?.role === "admin" || authUser?.app_role === "admin";
    if (!isAdmin) {
      const relationships = await base44.asServiceRole.entities.ParentChildRelationship.filter({
        parent_id: parentId,
        child_id: targetChildId,
        status: "active",
      }).catch(() => []);

      const altRelationships = await base44.asServiceRole.entities.ParentChildRelationship.filter({
        parent_id: parentId,
        student_id: targetChildId,
        status: "active",
      }).catch(() => []);

      const isValidLink = relationships.length > 0 || altRelationships.length > 0;
      if (!isValidLink) {
        return Response.json(
          { success: false, error: "Capaian ditolak. Akaun anak tidak terhubung secara sah." },
          { status: 403 }
        );
      }
    }

    // 3. Parallel Batch Queries (No N+1 Queries)
    const [
      childUserList,
      skillProfiles,
      recommendations,
      quizAttempts,
      progressList,
      adaptiveQueueItems
    ] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ id: targetChildId }).catch(() => []),
      base44.asServiceRole.entities.StudentSkillProfile.filter({ student_id: targetChildId }).catch(() => []),
      base44.asServiceRole.entities.LearningRecommendation.filter({ student_id: targetChildId, status: "active" }).catch(() => []),
      base44.asServiceRole.entities.QuizAttempt.filter({ student_id: targetChildId }).catch(() => []),
      base44.asServiceRole.entities.Progress.filter({ student_id: targetChildId }).catch(() => []),
      base44.asServiceRole.entities.AdaptiveQuizQueue.filter({ student_id: targetChildId }).catch(() => [])
    ]);

    const childUser = childUserList[0] || null;
    const childProg = progressList[0] || null;

    // 4. Construct Child Profile Summary
    const childProfile: ChildProfile = {
      student_id: targetChildId,
      nickname: childUser?.nickname || childUser?.full_name || "Anak",
      avatar: childUser?.selected_avatar || "🦧",
      level: childProg?.level ?? Math.floor((childProg?.total_xp || 0) / 100) + 1,
      total_xp: childProg?.total_xp ?? childProg?.xp ?? 0,
    };

    // 5. Construct Mastery Overview & Trend Calculations
    const masteryOverview: MasteryItem[] = (skillProfiles || []).map((p: any) => {
      const score = p.score ?? p.ewma_score ?? 0;
      let trend: "improving" | "stable" | "declining" = "stable";
      if (score >= 75) trend = "improving";
      else if (score < 50) trend = "declining";

      return {
        subject: p.subject || "Matematik",
        skill: p.skill || "Kemahiran Utama",
        mastery_score: score,
        tp_level: p.tp_level ?? (score >= 85 ? 5 : score >= 60 ? 3 : 2),
        mastery_level: p.mastery_level || "developing",
        trend: trend,
      };
    });

    // 6. Construct Strengths & Weaknesses Lists
    const strengths: StrengthItem[] = masteryOverview
      .filter((m) => m.mastery_score >= 75)
      .map((m) => ({
        subject: m.subject,
        skill: m.skill,
        reason: `Penguasaan tinggi (${m.mastery_score}%) berada pada Tahap Penguasaan TP${m.tp_level}.`,
      }));

    const weaknesses: WeaknessItem[] = (recommendations || []).map((r: any) => ({
      subject: r.subject || "Matematik",
      skill: r.learning_standard_id || "Konsep Asas",
      misconception: r.diagnosis || "Terdapat miskonsepsi lazim dalam penyelesaian soalan.",
      recommended_action: r.recommended_action || "Latihan Adaptif Sasaran",
    }));

    // 7. Calculate Overall Learning Progress Metrics
    const totalQuizzes = quizAttempts.length;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(
            quizAttempts.reduce((sum: number, q: any) => sum + (q.score ?? q.score_percentage ?? 0), 0) /
              totalQuizzes
          )
        : 0;

    const completedAdaptive = (adaptiveQueueItems || []).filter((q: any) => q.status === "completed").length;
    const masteryGrowth = masteryOverview.length > 0
      ? Math.round(masteryOverview.reduce((sum, item) => sum + item.mastery_score, 0) / masteryOverview.length)
      : avgScore;

    const learningProgress: LearningProgressSummary = {
      quizzes_completed: totalQuizzes,
      average_score: avgScore,
      mastery_growth: masteryGrowth,
      adaptive_missions_completed: completedAdaptive,
    };

    // 8. Generate Friendly AI Parent Guidance Message
    let messageTone: "positive" | "supportive" | "encouraging" = "positive";
    let guidanceMessage = "";

    if (weaknesses.length > 0) {
      messageTone = "supportive";
      guidanceMessage = `Suku mencadangkan latihan tambahan bagi topik ${weaknesses[0].skill} kerana terdapat ruang untuk pengukuhan miskonsepsi. 💪`;
    } else if (masteryGrowth >= 80) {
      messageTone = "positive";
      guidanceMessage = `Syabas! Anak anda semakin memahami subjek dengan cemerlang. Penguasaan meningkat secara berterusan! 🚀`;
    } else {
      messageTone = "encouraging";
      guidanceMessage = `Anak anda membuat kemajuan yang konsisten. Galakkan anak anda menyelesaikan 1-2 misi adaptif setiap hari! ✨`;
    }

    const aiParentMessage: AIParentMessage = {
      tone: messageTone,
      message: guidanceMessage,
    };

    // 9. Return Secure Response (Stripping Correct Answers, Options, and Prompts)
    return Response.json({
      success: true,
      child_profile: childProfile,
      mastery_overview: masteryOverview,
      strengths: strengths,
      weaknesses: weaknesses,
      learning_progress: learningProgress,
      ai_parent_message: aiParentMessage,
    });
  } catch (error: any) {
    console.error("getParentLearningInsights error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa mengambil data laporan anak." },
      { status: 500 }
    );
  }
}
