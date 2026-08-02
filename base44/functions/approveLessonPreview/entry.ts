import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: "Sesi tidak sah." }, { status: 401 });
    }

    const role = String(user.app_role || user.role || "").toLowerCase();
    if (role !== "admin" && role !== "teacher" && user.is_admin !== true) {
      return Response.json({ success: false, error: "Hanya pentadbir/guru dibenarkan." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { lesson_version_id, preview_status, preview_checklist_completed } = body;

    if (!lesson_version_id || !preview_status) {
      return Response.json({ success: false, error: "lesson_version_id dan preview_status diperlukan." }, { status: 400 });
    }

    const updateData: any = {
      preview_status,
    };

    if (preview_checklist_completed !== undefined) {
      updateData.preview_checklist_completed = preview_checklist_completed;
    }

    if (preview_status === "APPROVED") {
      updateData.previewed_by = user.id;
      updateData.previewed_at = new Date().toISOString();
    }

    await base44.asServiceRole.entities.LessonVersion.update(lesson_version_id, updateData);

    return Response.json({ success: true, preview_status });
  } catch (err: any) {
    console.error("approveLessonPreview error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
