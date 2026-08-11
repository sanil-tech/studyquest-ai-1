// base44/functions/approveContentAsset/entry.ts
// Content Asset Approval Endpoint (Phase 3C-2B)
// Server-authoritative state transition of Content Assets from DRAFT/UNDER_REVIEW to APPROVED.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Candidate entity names for Content Library assets
const ASSET_ENTITIES = [
  "LessonBlock",
  "LessonContent",
  "LearningActivity",
  "Flashcard",
  "QuestionBank",
  "LessonMediaAsset",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole || base44;

    // 1. Authenticate User & Enforce Admin Authorization
    let authUser: any = null;
    try {
      authUser = await base44.auth.me();
    } catch {
      /* unauthenticated fallback */
    }

    if (!authUser) {
      return Response.json(
        { success: false, error_code: "UNAUTHENTICATED", error: "Sesi tidak disahkan." },
        { status: 401 }
      );
    }

    const role = String(authUser.role || authUser.app_role || "").toLowerCase();
    const isAdmin = role === "admin" || authUser.is_admin === true;
    if (!isAdmin) {
      return Response.json(
        { success: false, error_code: "FORBIDDEN", error: "Akses hanya untuk pentadbir berdaftar." },
        { status: 403 }
      );
    }

    // 2. Parse & Validate Request Body
    const body = await req.json().catch(() => ({}));
    const { asset_id, entity_type, action = "approve", rejection_reason = "" } = body;

    if (!asset_id || typeof asset_id !== "string" || !asset_id.trim()) {
      return Response.json(
        { success: false, error_code: "INVALID_ASSET", error: "ID aset (asset_id) diperlukan." },
        { status: 422 }
      );
    }

    // 3. Retrieve Asset Server-Side
    let foundAsset: any = null;
    let foundEntityName: string = "";

    const candidateEntities = entity_type && ASSET_ENTITIES.includes(entity_type)
      ? [entity_type]
      : ASSET_ENTITIES;

    for (const entityName of candidateEntities) {
      try {
        const records = await db.entities[entityName].filter({ id: asset_id });
        if (records && records.length > 0) {
          foundAsset = records[0];
          foundEntityName = entityName;
          break;
        }
      } catch {
        /* try next entity */
      }
    }

    if (!foundAsset) {
      return Response.json(
        { success: false, error_code: "ASSET_NOT_FOUND", error: `Aset dengan ID '${asset_id}' tidak ditemui.` },
        { status: 404 }
      );
    }

    // 4. Validate Current Asset Lifecycle State
    const currentStatus = String(foundAsset.status || "").toLowerCase();
    const currentReviewStatus = String(foundAsset.review_status || "").toLowerCase();

    // Published content is IMMUTABLE
    if (currentStatus === "published" || currentReviewStatus === "published") {
      return Response.json(
        {
          success: false,
          error_code: "PUBLISHED_ASSET_IMMUTABLE",
          error: "Aset yang telah diterbitkan adalah tidak boleh diubah.",
        },
        { status: 422 }
      );
    }

    // Archived content cannot be approved
    if (currentStatus === "archived" || currentReviewStatus === "archived") {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_ASSET_STATE",
          error: "Aset yang telah diarkibkan tidak boleh diluluskan.",
        },
        { status: 422 }
      );
    }

    // Idempotent check for already approved assets
    if (currentReviewStatus === "approved") {
      return Response.json(
        {
          success: true,
          asset_id: foundAsset.id,
          entity_type: foundEntityName,
          status: foundAsset.status || "draft",
          review_status: "approved",
          approved_by: foundAsset.approved_by || authUser.id,
          approved_at: foundAsset.approved_at || new Date().toISOString(),
          message: "ALREADY_APPROVED",
        },
        { status: 200 }
      );
    }

    // 5. Validate Curriculum Integrity & Asset Malformation
    const hasCurriculumTag = Boolean(
      foundAsset.sp_code || foundAsset.topic_id || foundAsset.subtopic_id
    );
    if (!hasCurriculumTag) {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_ASSET",
          error: "Aset rosak atau tidak mempunyai metadata kurikulum (sp_code/topic_id) yang sah.",
        },
        { status: 422 }
      );
    }

    // Validate payload presence depending on entity
    if (foundEntityName === "LessonBlock" && !foundAsset.payload) {
      return Response.json(
        {
          success: false,
          error_code: "INVALID_ASSET",
          error: "Aset LessonBlock tidak mempunyai muatan (payload) yang sah.",
        },
        { status: 422 }
      );
    }

    // 6. Quality Gate Check (Server-Persisted Score)
    const qualityScore =
      typeof foundAsset.quality_score === "number"
        ? foundAsset.quality_score
        : typeof foundAsset.payload?.quality_score === "number"
        ? foundAsset.payload.quality_score
        : 85; // Default baseline if score not stored

    if (qualityScore < 75) {
      return Response.json(
        {
          success: false,
          error_code: "QUALITY_GATE_FAILED",
          error: `Skor kualiti aset (${qualityScore}) adalah di bawah ambang minimum 75. Kelulusan ditolak.`,
          quality_score: qualityScore,
        },
        { status: 422 }
      );
    }

    // 7. Execute Server-Authoritative State Transition (Content Payload Unmodified)
    const now = new Date().toISOString();
    const actorById = authUser.id || "usr_admin";

    const isReject = action === "reject";
    const updateFields: Record<string, any> = isReject
      ? {
          review_status: "rejected",
          rejection_reason: String(rejection_reason || "Ditolak oleh pentadbir semasa semakan.").trim(),
          rejected_by: actorById,
          rejected_at: now,
        }
      : {
          review_status: "approved",
          approved_by: actorById,
          approved_at: now,
        };

    const updatedRecord = await db.entities[foundEntityName].update(foundAsset.id, updateFields);

    // 8. Server-Authoritative Response (Sanitized, Answer Key Protected)
    return Response.json(
      {
        success: true,
        asset_id: updatedRecord.id || foundAsset.id,
        entity_type: foundEntityName,
        status: updatedRecord.status || foundAsset.status || "draft",
        review_status: isReject ? "rejected" : "approved",
        quality_score: qualityScore,
        rejection_reason: isReject ? updateFields.rejection_reason : undefined,
        actor_by: actorById,
        processed_at: now,
        curriculum_tags: {
          topic_id: updatedRecord.topic_id || foundAsset.topic_id || null,
          subtopic_id: updatedRecord.subtopic_id || foundAsset.subtopic_id || null,
          sp_code: updatedRecord.sp_code || foundAsset.sp_code || null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("approveContentAsset error:", error);
    return Response.json(
      {
        success: false,
        error_code: "INVALID_ASSET_STATE",
        error: error?.message || "Ralat pelayan semasa meluluskan aset.",
      },
      { status: 500 }
    );
  }
}
