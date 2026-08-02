// base44/functions/createParentMissionRequest/entry.ts
// Phase 7.3: Parent Action Center Edge Function to trigger extra practice missions for linked children

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface MissionRequestInput {
  student_id?: string;
  subject?: string;
  learning_standard_id?: string;
  form_level?: string;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: MissionRequestInput = await req.json().catch(() => ({}));

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
    const subject = body.subject || "Matematik";
    const skillCode = body.learning_standard_id || "Pecahan & Perpuluhan";
    const formLevel = body.form_level || "Tahun 4";

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

    // 3. Delegate to createAdaptiveLearningMission Edge Function logic
    const missionRes = await base44.asServiceRole.functions.invoke("createAdaptiveLearningMission", {
      student_id: studentId,
      subject: subject,
      learning_standard_id: skillCode,
      form_level: formLevel,
    });

    return Response.json({
      success: true,
      message: "Misi latihan tambahan berjaya diberikan kepada anak anda.",
      data: missionRes?.data || missionRes,
    });
  } catch (error: any) {
    console.error("createParentMissionRequest error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa menugaskan misi latihan." },
      { status: 500 }
    );
  }
}
