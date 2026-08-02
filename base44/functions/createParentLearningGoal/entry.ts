// base44/functions/createParentLearningGoal/entry.ts
// Phase 7.3: Parent Action Center Edge Function to create learning goals for linked children

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface GoalInput {
  student_id?: string;
  goal_type?: "quiz" | "study_time" | "adaptive_mission";
  target_value?: number;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: GoalInput = await req.json().catch(() => ({}));

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
    const goalType = body.goal_type || "quiz";
    const targetValue = Math.max(1, body.target_value || 3);

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

    // 3. Create ParentLearningGoal Record
    const newGoal = await base44.asServiceRole.entities.ParentLearningGoal.create({
      parent_id: parentId,
      student_id: studentId,
      goal_type: goalType,
      target_value: targetValue,
      current_value: 0,
      status: "active",
      created_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: "Sasaran pembelajaran berjaya dicipta.",
      goal: newGoal,
    });
  } catch (error: any) {
    console.error("createParentLearningGoal error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa mencipta sasaran pembelajaran." },
      { status: 500 }
    );
  }
}
