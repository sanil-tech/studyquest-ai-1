// base44/functions/getLessonCompleteness/entry.ts
// Returns completeness metrics for a LessonVersion — used by Admin Content Studio dashboard.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { lesson_version_id } = body;

    if (!lesson_version_id) {
      return Response.json({ error: "lesson_version_id diperlukan." }, { status: 400 });
    }

    const [
      lessonVersion,
      lessonContent,
      flashcards,
      questions,
      activities,
      teacherGuides,
      aiExplanations,
      commonMistakes,
      lessonBlocks,
      aiRequests,
    ] = await Promise.all([
      base44.asServiceRole.entities.LessonVersion.get(lesson_version_id).catch(() => null),
      base44.asServiceRole.entities.LessonContent.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.Flashcard.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.QuestionBank.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.LearningActivity.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.TeacherGuide.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.AIExplanation.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.CommonMistake.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.LessonBlock.filter({ lesson_version_id }).catch(() => []),
      base44.asServiceRole.entities.AIContentRequest.filter({ lesson_version_id }).catch(() => []),
    ]);

    // Helper to check if AIContentRequest exists with status completed/approved
    const hasAIReq = (types: string[]) =>
      aiRequests.some(
        (r: any) =>
          (r.status === "completed" || r.status === "approved") &&
          types.includes(r.content_type)
      );

    // 1. Notes
    const notesCount =
      lessonContent.filter((c: any) => c.content_type === "notes" || c.content_type === "lesson_notes").length ||
      (lessonVersion?.notes_content ? 1 : 0) ||
      (hasAIReq(["lesson_notes", "notes"]) ? 1 : 0);
    const hasNotes =
      notesCount > 0 ||
      lessonContent.some((c: any) => c.content_type === "notes" || c.content_type === "lesson_notes") ||
      !!lessonVersion?.notes_content ||
      lessonBlocks.some((b: any) => ["TEXT_MARKDOWN", "NOTES", "TEXT"].includes((b.block_type || "").toUpperCase())) ||
      hasAIReq(["lesson_notes", "notes"]);

    // 2. Flashcard
    const flashcardCount =
      flashcards.length ||
      lessonContent.filter((c: any) => c.content_type === "flashcard" || c.content_type === "flashcards").length ||
      (hasAIReq(["flashcards", "flashcard"]) ? 5 : 0);
    const hasFlashcards = flashcardCount >= 5 || hasAIReq(["flashcards", "flashcard"]);

    // 3. Video
    const videoCount =
      lessonContent.filter((c: any) => ["video", "video_script", "video_embed"].includes(c.content_type)).length ||
      (lessonVersion?.video_url || lessonVersion?.video_script ? 1 : 0) ||
      (hasAIReq(["video_script", "video"]) ? 1 : 0);
    const hasVideo =
      videoCount > 0 ||
      !!lessonVersion?.video_url ||
      !!lessonVersion?.video_script ||
      lessonBlocks.some((b: any) => ["VIDEO", "VIDEO_EMBED", "VIDEO_SCRIPT"].includes((b.block_type || "").toUpperCase())) ||
      hasAIReq(["video_script", "video"]);

    // 4. Mind Map
    const mindmapCount =
      lessonContent.filter((c: any) => c.content_type === "mindmap").length ||
      (lessonVersion?.mindmap_data || lessonVersion?.mind_map ? 1 : 0) ||
      (hasAIReq(["mindmap"]) ? 1 : 0);
    const hasMindmap =
      mindmapCount > 0 ||
      !!lessonVersion?.mindmap_data ||
      !!lessonVersion?.mind_map ||
      lessonBlocks.some((b: any) => (b.block_type || "").toUpperCase() === "MINDMAP") ||
      hasAIReq(["mindmap"]);

    // 5. Infographic
    const infographicCount =
      lessonContent.filter((c: any) => c.content_type === "infographic").length ||
      lessonBlocks.filter((b: any) => (b.block_type || "").toUpperCase() === "INFOGRAPHIC").length ||
      (hasAIReq(["infographic"]) ? 1 : 0);
    const hasInfographic =
      infographicCount > 0 ||
      !!lessonVersion?.infographic_url ||
      lessonBlocks.some((b: any) => (b.block_type || "").toUpperCase() === "INFOGRAPHIC") ||
      hasAIReq(["infographic"]);

    // 6. Quiz
    const questionCount =
      questions.length ||
      lessonContent.filter((c: any) => c.content_type === "quiz" || c.content_type === "questions").length ||
      lessonBlocks.filter((b: any) => ["QUIZ", "QUESTIONS"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["questions", "quiz"]) ? 10 : 0);
    const hasQuestions = questionCount >= 10 || hasAIReq(["questions", "quiz"]);

    // 7. Interactive Activity
    const activityCount =
      activities.length ||
      lessonContent.filter((c: any) => ["activity", "game", "interactive", "worksheet"].includes(c.content_type)).length ||
      lessonBlocks.filter((b: any) => ["INTERACTIVE_GAME", "GAME", "ACTIVITY", "INTERACTIVE", "WORKSHEET"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["activity", "game", "interactive"]) ? 1 : 0);
    const hasActivities = activityCount >= 1 || hasAIReq(["activity", "game", "interactive"]);

    // 8. AI Explanation
    const explanationCount =
      aiExplanations.length ||
      lessonContent.filter((c: any) => c.content_type === "explanation" || c.content_type === "ai_explanation").length ||
      lessonBlocks.filter((b: any) => ["AI_EXPLANATION", "EXPLANATION"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["explanation", "ai_explanation"]) ? 1 : 0);
    const hasExplanations =
      explanationCount >= 1 ||
      hasAIReq(["explanation", "ai_explanation"]);

    // 9. Common Mistakes
    const mistakeCount =
      commonMistakes.length ||
      lessonContent.filter((c: any) => c.content_type === "common_mistakes" || c.content_type === "common_mistake" || c.content_type === "mistakes").length ||
      lessonBlocks.filter((b: any) => ["COMMON_MISTAKES", "MISTAKE"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["common_mistakes", "common_mistake"]) ? 1 : 0);
    const hasMistakes =
      mistakeCount >= 1 ||
      hasAIReq(["common_mistakes", "common_mistake"]);

    // 10. Teacher Guide
    const guideCount =
      teacherGuides.length ||
      lessonContent.filter((c: any) => c.content_type === "teacher_guide").length ||
      lessonBlocks.filter((b: any) => (b.block_type || "").toUpperCase() === "TEACHER_GUIDE").length ||
      (hasAIReq(["teacher_guide"]) ? 1 : 0);
    const hasTeacherGuide = guideCount >= 1 || hasAIReq(["teacher_guide"]);

    const checks = {
      notes: hasNotes,
      flashcards: hasFlashcards,
      video: hasVideo,
      mindmap: hasMindmap,
      infographic: hasInfographic,
      questions: hasQuestions,
      activities: hasActivities,
      explanations: hasExplanations,
      common_mistakes: hasMistakes,
      teacher_guide: hasTeacherGuide,
    };

    const completedCount = Object.values(checks).filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / 10) * 100);

    const pendingReview = aiRequests.filter((r: any) => r.status === "completed" || r.status === "generating" || r.status === "requested");
    const approved = aiRequests.filter((r: any) => r.status === "approved");
    const rejected = aiRequests.filter((r: any) => r.status === "rejected");

    return Response.json({
      lesson_version_id,
      completion_percentage: completionPercentage,
      checks,
      counts: {
        notes: notesCount,
        flashcards: flashcardCount,
        video: videoCount,
        mindmap: mindmapCount,
        infographic: infographicCount,
        questions: questionCount,
        activities: activityCount,
        explanations: explanationCount,
        common_mistakes: mistakeCount,
        teacher_guide: guideCount,
        lesson_content_total: lessonContent.length,
      },
      content_breakdown: {
        notes: notesCount,
        video: videoCount,
        infographic: infographicCount,
        mindmap: mindmapCount,
        flashcards: flashcardCount,
        questions: questionCount,
        activities: activityCount,
        explanations: explanationCount,
        common_mistakes: mistakeCount,
        teacher_guide: guideCount,
      },
      ai_requests: {
        total: aiRequests.length,
        pending_review: pendingReview.length,
        approved: approved.length,
        rejected: rejected.length,
        list: aiRequests.map((r: any) => ({
          id: r.id,
          content_type: r.content_type,
          status: r.status,
          created_date: r.created_date,
        })),
      },
    });
  } catch (error: any) {
    console.error("getLessonCompleteness error:", error);
    return Response.json({ error: error.message || "Ralat sistem." }, { status: 500 });
  }
}
