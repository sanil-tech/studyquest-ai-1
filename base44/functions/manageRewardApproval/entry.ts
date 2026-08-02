// base44/functions/manageRewardApproval/entry.ts
// Phase 7.3: Parent Action Center Edge Function to manage child reward approval requests

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

interface ApprovalManageInput {
  request_id?: string;
  approval_id?: string;
  action?: "approve" | "reject";
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body: ApprovalManageInput = await req.json().catch(() => ({}));

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
    const targetId = body.request_id || body.approval_id;
    const action = body.action || "approve";

    if (!parentId || !targetId) {
      return Response.json(
        { success: false, error: "ID permohonan ganjaran tidak lengkap." },
        { status: 400 }
      );
    }

    // 2. Fetch RewardRequest or RewardApproval Record
    let rewardReq: any = null;
    try {
      rewardReq = await base44.asServiceRole.entities.RewardRequest.get(targetId).catch(() => null);
    } catch {
      /* fallback check */
    }

    if (!rewardReq) {
      try {
        rewardReq = await base44.asServiceRole.entities.RewardApproval.get(targetId).catch(() => null);
      } catch {
        /* fallback check */
      }
    }

    if (!rewardReq) {
      return Response.json(
        { success: false, error: "Permohonan ganjaran tidak ditemui." },
        { status: 404 }
      );
    }

    const studentId = rewardReq.student_id || rewardReq.child_id;

    // 3. Security Check: Validate Active Parent-Child Relationship (Unless Admin)
    const isAdmin = authUser?.role === "admin" || authUser?.app_role === "admin";
    if (!isAdmin && studentId) {
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

    // 4. Update Status based on Action
    const newStatus = action === "approve" ? "approved" : "rejected";
    const now = new Date().toISOString();

    // Update RewardRequest entity if present
    try {
      await base44.asServiceRole.entities.RewardRequest.update(targetId, {
        status: newStatus,
        reviewed_at: now,
        reviewed_by: parentId,
      }).catch(() => {});
    } catch {
      /* non-fatal fallback */
    }

    // Update RewardApproval entity if present
    try {
      await base44.asServiceRole.entities.RewardApproval.update(targetId, {
        status: newStatus,
        parent_id: parentId,
      }).catch(() => {});
    } catch {
      /* non-fatal fallback */
    }

    return Response.json({
      success: true,
      message: action === "approve" ? "Permohonan ganjaran berjaya diluluskan! 🎉" : "Permohonan ganjaran telah ditolak.",
      request_id: targetId,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("manageRewardApproval error:", error);
    return Response.json(
      { success: false, error: error?.message || "Ralat semasa memproses permohonan ganjaran." },
      { status: 500 }
    );
  }
}
