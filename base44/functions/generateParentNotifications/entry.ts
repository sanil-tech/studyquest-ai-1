// base44/functions/generateParentNotifications/entry.ts
// Phase 7.4: AI Parent Notification Engine Edge Function
// Analyzes child learning events and synthesizes parent notifications across 5 core categories.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface NotificationGenInput {
  student_id?: string;
  parent_id?: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: NotificationGenInput = await req.json().catch(() => ({}));

    // 1. Authenticate Parent User
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
    const studentId = body.student_id;

    if (!parentId || !studentId) {
      return Response.json(
        { success: false, error: "ID anak atau ibu bapa tidak lengkap." },
        { status: 400 }
      );
    }

    // 2. Security Check: Validate Active Parent-Child Relationship (Unless Admin)
    const isAdmin = authUser?.role === "admin" || authUser?.app_role === "admin";
    if (!isAdmin) {
      const rels = await base44.asServiceRole.entities.ParentChildRelationship.filter({
        parent_id: parentId,
        child_id: studentId,
        status: "active",
      }).catch(() => []);

      const altRels = await base44.asServiceRole.entities.ParentChildRelationship.filter({
        parent_id: parentId,
        student_id: studentId,
        status: "active",
      }).catch(() => []);

      if (rels.length === 0 && altRels.length === 0) {
        return Response.json(
          { success: false, error: "Capaian ditolak. Akaun anak tidak terhubung secara sah." },
          { status: 403 }
        );
      }
    }

    // 3. Batch Query Entities (No N+1 Queries)
    const [
      userList,
      skillProfiles,
      recommendations,
      completedAdaptiveQueue,
      progressList,
      pendingRewardRequests
    ] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ id: studentId }).catch(() => []),
      base44.asServiceRole.entities.StudentSkillProfile.filter({ student_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.LearningRecommendation.filter({ student_id: studentId, status: "active" }).catch(() => []),
      base44.asServiceRole.entities.AdaptiveQuizQueue.filter({ student_id: studentId, status: "completed" }).catch(() => []),
      base44.asServiceRole.entities.Progress.filter({ student_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.RewardRequest.filter({ student_id: studentId, status: "pending" }).catch(() => [])
    ]);

    const childUser = userList[0] || null;
    const childName = childUser?.nickname || childUser?.full_name || "Anak";
    const childProg = progressList[0] || null;
    const streakDays = childProg?.streak_days || 0;
    const now = new Date().toISOString();

    const notificationsToCreate: any[] = [];

    // CASE 1: Mastery Growth Notifications
    skillProfiles.forEach((profile: any) => {
      const score = profile.score ?? profile.ewma_score ?? 0;
      if (score >= 75) {
        notificationsToCreate.push({
          parent_id: parentId,
          student_id: studentId,
          notification_type: "mastery_growth",
          title: `Tahniah! Kemajuan ${profile.subject || "Subjek"}`,
          message: `${childName} meningkat kepada Tahap TP${profile.tp_level || 4} dalam ${profile.skill || "pembelajaran"}.`,
          priority: "low",
          status: "unread",
          metadata_json: JSON.stringify({ score, tp_level: profile.tp_level }),
          created_at: now,
        });
      }
    });

    // CASE 2: Weakness Detected (High Priority Alert)
    recommendations.forEach((rec: any) => {
      notificationsToCreate.push({
        parent_id: parentId,
        student_id: studentId,
        notification_type: "weakness_detected",
        title: `Perhatian: Perlu Bimbingan ${rec.subject || "Pembelajaran"}`,
        message: `Suku mengesan ${childName} memerlukan bantuan dalam ${rec.learning_standard_id || "tajuk ini"}.`,
        priority: "high",
        status: "unread",
        metadata_json: JSON.stringify({ diagnosis: rec.diagnosis }),
        created_at: now,
      });
    });

    // CASE 3: Completed Adaptive Missions
    if (completedAdaptiveQueue.length > 0) {
      notificationsToCreate.push({
        parent_id: parentId,
        student_id: studentId,
        notification_type: "mission_completed",
        title: "Misi Adaptif Selesai 🚀",
        message: `${childName} berjaya menyelesaikan ${completedAdaptiveQueue.length} Misi Adaptif Suku.`,
        priority: "medium",
        status: "unread",
        metadata_json: JSON.stringify({ total_completed: completedAdaptiveQueue.length }),
        created_at: now,
      });
    }

    // CASE 4: Streak Milestone Notifications
    if (streakDays >= 3) {
      notificationsToCreate.push({
        parent_id: parentId,
        student_id: studentId,
        notification_type: "streak_milestone",
        title: "Pencapaian Streak Pembelajaran 🔥",
        message: `${childName} mencapai ${streakDays} hari pembelajaran berturut-turut!`,
        priority: "medium",
        status: "unread",
        metadata_json: JSON.stringify({ streak_days: streakDays }),
        created_at: now,
      });
    }

    // CASE 5: Pending Reward Requests
    if (pendingRewardRequests.length > 0) {
      notificationsToCreate.push({
        parent_id: parentId,
        student_id: studentId,
        notification_type: "reward_request",
        title: "Permohonan Tebus Ganjaran 🎁",
        message: `${childName} ingin menebus ganjaran syiling. Sila semak kelulusan.`,
        priority: "high",
        status: "unread",
        metadata_json: JSON.stringify({ count: pendingRewardRequests.length }),
        created_at: now,
      });
    }

    // 4. Save Notifications (Avoid Duplicate Duplication)
    const existingNotifs = await base44.asServiceRole.entities.ParentNotification.filter({
      parent_id: parentId,
      student_id: studentId,
      status: "unread",
    }).catch(() => []);

    const createdNotifs: any[] = [];
    for (const notif of notificationsToCreate) {
      const isDup = existingNotifs.some(
        (ex: any) => ex.notification_type === notif.notification_type && ex.title === notif.title
      );
      if (!isDup) {
        const saved = await base44.asServiceRole.entities.ParentNotification.create(notif).catch(() => null);
        if (saved) createdNotifs.push(saved);
      }
    }

    // Fetch All Current Parent Notifications
    const allNotifs = await base44.asServiceRole.entities.ParentNotification.filter({
      parent_id: parentId,
      student_id: studentId,
    }).catch(() => []);

    return Response.json({
      success: true,
      new_generated_count: createdNotifs.length,
      notifications: allNotifs.length > 0 ? allNotifs : existingNotifs,
    });
  } catch (error: any) {
    console.error("generateParentNotifications error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa menjana notifikasi ibu bapa." },
      { status: 500 }
    );
  }
}
