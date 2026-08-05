// base44/functions/publishLessonVersion/entry.ts
// Validates lesson completeness using modular architecture and publishes a LessonVersion.
// Students can ONLY access published LessonVersions.
//
// AI CONTENT SAFETY RULE:
//   Publishing a new version NEVER overwrites existing published content.
//   The previously published LessonVersion is preserved as "archived".
//   Example: v1 published → generate v2 draft → approve → publish v2 → v1 archived.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { evaluateLessonCompleteness } from "../../shared/lessonCompletenessEvaluator.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Authenticate — allow admin or teacher or service role
    const user = await base44.auth.me().catch(() => null);
    if (user) {
      const role = String(user.app_role || user.role || "").toLowerCase();
      if (role !== "admin" && role !== "teacher" && user.is_admin !== true) {
        return Response.json({ success: false, error: "Hanya pentadbir/guru dibenarkan." }, { status: 403 });
      }
    } else {
      console.warn("publishLessonVersion: Unauthenticated user or service invocation");
    }

    const body = await req.json().catch(() => ({}));
    const { lesson_version_id } = body;

    if (!lesson_version_id) {
      return Response.json({ success: false, error: "lesson_version_id diperlukan." }, { status: 400 });
    }

    // 2. Evaluate completeness metrics and publishing readiness for target LessonVersion ONLY
    const evaluation = await evaluateLessonCompleteness(base44, lesson_version_id);
    const { lessonVersion, publishingReadiness, completionPercentage, checks, counts } = evaluation;
    const lessonId = lessonVersion?.lesson_id;

    if (!lessonVersion) {
      return Response.json({ success: false, error: "LessonVersion tidak dijumpai." }, { status: 404 });
    }

    // 3. Validate publishing readiness (mandatory minimum requirements, bypassable via force_publish)
    if (!publishingReadiness.isReadyToPublish && !body.force_publish) {
      return Response.json(
        {
          success: false,
          error: "Pakej pelajaran tidak lengkap.",
          missing: publishingReadiness.missingRequirements,
          counts: {
            notes: counts.notes,
            flashcards: counts.flashcards,
            questions: counts.questions,
            activities: counts.activities,
            teacher_guide: counts.teacher_guide,
          },
        },
        { status: 400 }
      );
    }

    // QUALITY SHIELD CHECK: Enforce Quality Score >= 80 (Good / Excellent tier) for DSKP publishing
    const qualityScore = lessonVersion.quality_score || 0;
    if (qualityScore > 0 && qualityScore < 80 && !body.force_publish) {
      return Response.json(
        {
          success: false,
          error: `Skor kualiti DSKP (${qualityScore}%) berada dalam status Perlu Semakan (<80%). Sila kemaskini atau audit semula sebelum menerbit.`,
          quality_score: qualityScore,
          publication_tier: qualityScore >= 70 ? "NEEDS_REVIEW" : "REJECTED",
        },
        { status: 400 }
      );
    }

    // PREVIEW APPROVAL SHIELD CHECK: Enforce preview approval (preview_status === APPROVED) before publishing
    const previewStatus = lessonVersion.preview_status || "NOT_VIEWED";
    if (previewStatus !== "APPROVED" && !body.force_publish) {
      return Response.json(
        {
          success: false,
          error: "Pelajaran mestilah melengkapkan audit kualiti AI (>=80%) dan kelulusan pratonton admin (APPROVED) sebelum diterbitkan.",
          preview_status: previewStatus,
        },
        { status: 400 }
      );
    }

    // 4. LEGACY RECORD HANDLING:
    //    Attach unassigned legacy content (where lesson_version_id is null/undefined, lesson_id matches, AND status is not published/archived)
    //    NEVER touch or move existing published/archived records belonging to another version!
    const legacyAttachedCounts: Record<string, number> = {
      LessonContent: 0,
      LessonBlock: 0,
      LessonMediaAsset: 0,
      Flashcard: 0,
      QuestionBank: 0,
      LearningActivity: 0,
      TeacherGuide: 0,
      AIExplanation: 0,
      CommonMistake: 0,
    };

    const entityNames = [
      "LessonContent",
      "LessonBlock",
      "LessonMediaAsset",
      "Flashcard",
      "QuestionBank",
      "LearningActivity",
      "TeacherGuide",
      "AIExplanation",
      "CommonMistake",
    ] as const;

    for (const entityName of entityNames) {
      try {
        const unassignedRecords = await base44.asServiceRole.entities[entityName].filter({ lesson_id: lessonId });
        const eligibleLegacy = unassignedRecords.filter(
          (item: any) =>
            !item.lesson_version_id &&
            item.status !== "published" &&
            item.status !== "archived"
        );

        if (eligibleLegacy.length > 0) {
          await base44.asServiceRole.entities[entityName].bulkUpdate(
            eligibleLegacy.map((item: any) => ({
              id: item.id,
              lesson_version_id,
              status: "draft",
            }))
          );
          legacyAttachedCounts[entityName] = eligibleLegacy.length;
        }
      } catch (err) {
        console.error(`Legacy attach error for ${entityName}:`, err);
      }
    }

    // 5. ARCHIVING PREVIOUS PUBLISHED VERSION (Safety Rule)
    //    AI content must never overwrite existing published content.
    //    The old published version is preserved as "archived"; the new version becomes published.
    const archivedAt = new Date().toISOString();
    const previousPublished = await base44.asServiceRole.entities.LessonVersion.filter({
      lesson_id: lessonId,
      status: "published",
    });
    const toArchive = previousPublished.filter((v: any) => v.id !== lesson_version_id);

    const archivedCounts: Record<string, number> = {
      LessonVersion: toArchive.length,
      LessonContent: 0,
      LessonBlock: 0,
      LessonMediaAsset: 0,
      Flashcard: 0,
      QuestionBank: 0,
      LearningActivity: 0,
      TeacherGuide: 0,
      AIExplanation: 0,
      CommonMistake: 0,
    };

    if (toArchive.length > 0) {
      const archivedVersionIds = toArchive.map((v: any) => v.id);

      // Archive previous LessonVersion records
      await base44.asServiceRole.entities.LessonVersion.bulkUpdate(
        toArchive.map((v: any) => ({
          id: v.id,
          status: "archived",
          review_status: "archived",
        }))
      );

      // Archive child content across ALL 8 learning entities for previously published versions
      for (const entityName of entityNames) {
        try {
          const recordsToArchive = await base44.asServiceRole.entities[entityName].filter({
            lesson_version_id: { $in: archivedVersionIds },
            status: "published",
          });
          if (recordsToArchive.length > 0) {
            await base44.asServiceRole.entities[entityName].bulkUpdate(
              recordsToArchive.map((item: any) => ({
                id: item.id,
                status: "archived",
              }))
            );
            archivedCounts[entityName] = recordsToArchive.length;
          }
        } catch (err) {
          console.error(`Archive child error for ${entityName}:`, err);
        }
      }
    }

    // 6. PUBLISH THE NEW LESSONVERSION
    await base44.asServiceRole.entities.LessonVersion.update(lesson_version_id, {
      status: "published",
      review_status: "published",
      published_at: archivedAt,
      content_completion_percentage: completionPercentage,
      last_reviewed_by: user?.id || "system_admin",
      last_reviewed_at: archivedAt,
    });

    // 7. PROMOTION: Draft → Published for ALL 8 Learning Entities
    const promotedCounts: Record<string, number> = {
      LessonContent: 0,
      LessonBlock: 0,
      LessonMediaAsset: 0,
      Flashcard: 0,
      QuestionBank: 0,
      LearningActivity: 0,
      TeacherGuide: 0,
      AIExplanation: 0,
      CommonMistake: 0,
    };

    for (const entityName of entityNames) {
      try {
        const draftRecords = await base44.asServiceRole.entities[entityName].filter({
          lesson_version_id,
        });
        const eligibleToPromote = draftRecords.filter((item: any) => item.status !== "published" && item.status !== "archived");

        if (eligibleToPromote.length > 0) {
          await base44.asServiceRole.entities[entityName].bulkUpdate(
            eligibleToPromote.map((item: any) => ({
              id: item.id,
              status: "published",
            }))
          );
          promotedCounts[entityName] = eligibleToPromote.length;
        }
      } catch (err) {
        console.error(`Promote error for ${entityName}:`, err);
      }
    }

    // 8. Update parent Lesson pointer
    if (lessonId) {
      await base44.asServiceRole.entities.Lesson.update(lessonId, {
        content_status: "published",
        published_version_id: lesson_version_id,
        published_version: lessonVersion.version_number,
        video_url: lessonVersion.video_url || "",
      }).catch((err: any) => console.warn("Error updating parent Lesson:", err));
    }

    // 9. Return structured response with defensive logging breakdown
    return Response.json({
      success: true,
      message: "LessonVersion berjaya diterbitkan!",
      lesson_version_id,
      lesson_id: lessonId,
      completion_percentage: completionPercentage,
      published_at: archivedAt,
      archived_versions: toArchive.map((v: any) => v.id),
      checks,
      counts: {
        notes: counts.notes,
        flashcards: counts.flashcards,
        questions: counts.questions,
        activities: counts.activities,
        teacher_guide: counts.teacher_guide,
      },
      promoted_counts: promotedCounts,
      archived_counts: archivedCounts,
      legacy_attached_counts: legacyAttachedCounts,
    });
  } catch (error: any) {
    console.error("publishLessonVersion error:", error);
    return Response.json({ success: false, error: error.message || "Ralat sistem." }, { status: 500 });
  }
}