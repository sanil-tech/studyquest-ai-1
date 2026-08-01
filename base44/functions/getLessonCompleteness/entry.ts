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

    const lessonVersion = await base44.asServiceRole.entities.LessonVersion.get(lesson_version_id).catch(() => null);
    const lessonId = lessonVersion?.lesson_id;

    const [
      lessonContentByVer,
      lessonContentByLes,
      flashcardsByVer,
      flashcardsByLes,
      questionsByVer,
      questionsByLes,
      activitiesByVer,
      activitiesByLes,
      teacherGuidesByVer,
      teacherGuidesByLes,
      aiExplanationsByVer,
      aiExplanationsByLes,
      commonMistakesByVer,
      commonMistakesByLes,
      lessonBlocksByVer,
      lessonBlocksByLes,
      aiRequestsByVer,
      aiRequestsByLes,
    ] = await Promise.all([
      base44.asServiceRole.entities.LessonContent.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.LessonContent.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.Flashcard.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.Flashcard.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.QuestionBank.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.QuestionBank.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.LearningActivity.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.LearningActivity.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.TeacherGuide.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.TeacherGuide.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.AIExplanation.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.AIExplanation.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.CommonMistake.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.CommonMistake.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.LessonBlock.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.LessonBlock.filter({ lesson_id: lessonId }).catch(() => []) : [],
      base44.asServiceRole.entities.AIContentRequest.filter({ lesson_version_id }).catch(() => []),
      lessonId ? base44.asServiceRole.entities.AIContentRequest.filter({ lesson_id: lessonId }).catch(() => []) : [],
    ]);

    const mergeUnique = (arr1: any[], arr2: any[]) => {
      const map = new Map();
      [...arr1, ...arr2].forEach((item) => {
        if (item && item.id) map.set(item.id, item);
      });
      return Array.from(map.values());
    };

    const lessonContent = mergeUnique(lessonContentByVer, lessonContentByLes);
    const flashcards = mergeUnique(flashcardsByVer, flashcardsByLes);
    const questions = mergeUnique(questionsByVer, questionsByLes);
    const activities = mergeUnique(activitiesByVer, activitiesByLes);
    const teacherGuides = mergeUnique(teacherGuidesByVer, teacherGuidesByLes);
    const aiExplanations = mergeUnique(aiExplanationsByVer, aiExplanationsByLes);
    const commonMistakes = mergeUnique(commonMistakesByVer, commonMistakesByLes);
    const lessonBlocks = mergeUnique(lessonBlocksByVer, lessonBlocksByLes);
    const aiRequests = mergeUnique(aiRequestsByVer, aiRequestsByLes);

    // Helper to check if AIContentRequest exists with status completed/approved or has generated content
    const hasAIReq = (types: string[]) =>
      aiRequests.some(
        (r: any) =>
          (r.status === "completed" || r.status === "approved" || !!r.generated_content) &&
          types.includes((r.content_type || "").toLowerCase())
      );

    // 1. Notes
    const notesCount =
      lessonContent.filter((c: any) => ["notes", "lesson_notes", "text_markdown", "text"].includes((c.content_type || "").toLowerCase())).length ||
      (lessonVersion?.notes_content ? 1 : 0) ||
      (hasAIReq(["lesson_notes", "notes"]) ? 1 : 0);
    const hasNotes =
      notesCount > 0 ||
      lessonContent.some((c: any) => ["notes", "lesson_notes", "text_markdown", "text"].includes((c.content_type || "").toLowerCase())) ||
      !!lessonVersion?.notes_content ||
      lessonBlocks.some((b: any) => ["TEXT_MARKDOWN", "NOTES", "TEXT", "LESSON_NOTES"].includes((b.block_type || "").toUpperCase())) ||
      hasAIReq(["lesson_notes", "notes"]);

    // 2. Flashcard
    const flashcardCount =
      flashcards.length ||
      lessonContent.filter((c: any) => ["flashcard", "flashcards"].includes((c.content_type || "").toLowerCase())).length ||
      (hasAIReq(["flashcards", "flashcard"]) ? 5 : 0);
    const hasFlashcards = flashcardCount >= 5 || hasAIReq(["flashcards", "flashcard"]);

    // 3. Video
    const videoCount =
      lessonContent.filter((c: any) => ["video", "video_script", "video_embed"].includes((c.content_type || "").toLowerCase())).length ||
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
      lessonContent.filter((c: any) => ["mindmap", "mind_map"].includes((c.content_type || "").toLowerCase())).length ||
      (lessonVersion?.mindmap_data || lessonVersion?.mind_map ? 1 : 0) ||
      (hasAIReq(["mindmap", "mind_map"]) ? 1 : 0);
    const hasMindmap =
      mindmapCount > 0 ||
      !!lessonVersion?.mindmap_data ||
      !!lessonVersion?.mind_map ||
      lessonBlocks.some((b: any) => ["MINDMAP", "MIND_MAP"].includes((b.block_type || "").toUpperCase())) ||
      hasAIReq(["mindmap", "mind_map"]);

    // 5. Infographic
    const infographicCount =
      lessonContent.filter((c: any) => ["infographic", "infographics"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["INFOGRAPHIC", "INFOGRAPHICS"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["infographic", "infographics"]) ? 1 : 0);
    const hasInfographic =
      infographicCount > 0 ||
      !!lessonVersion?.infographic_url ||
      lessonBlocks.some((b: any) => ["INFOGRAPHIC", "INFOGRAPHICS"].includes((b.block_type || "").toUpperCase())) ||
      hasAIReq(["infographic", "infographics"]);

    // 6. Quiz
    const questionCount =
      questions.length ||
      lessonContent.filter((c: any) => ["quiz", "questions", "question", "assessment"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["QUIZ", "QUESTIONS", "QUESTION", "ASSESSMENT"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["questions", "quiz"]) ? 10 : 0);
    const hasQuestions = questionCount >= 10 || hasAIReq(["questions", "quiz"]);

    // 7. Interactive Activity
    const activityCount =
      activities.length ||
      lessonContent.filter((c: any) => ["activity", "game", "interactive", "worksheet", "matching", "sorting"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["INTERACTIVE_GAME", "GAME", "ACTIVITY", "INTERACTIVE", "WORKSHEET"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["activity", "game", "interactive", "worksheet"]) ? 1 : 0);
    const hasActivities = activityCount >= 1 || hasAIReq(["activity", "game", "interactive", "worksheet"]);

    // 8. AI Explanation
    const explanationCount =
      aiExplanations.length ||
      lessonContent.filter((c: any) => ["explanation", "ai_explanation", "explanations"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["AI_EXPLANATION", "EXPLANATION", "EXPLANATIONS"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["explanation", "ai_explanation", "explanations"]) ? 1 : 0);
    const hasExplanations =
      explanationCount >= 1 ||
      hasAIReq(["explanation", "ai_explanation", "explanations"]);

    // 9. Common Mistakes
    const mistakeCount =
      commonMistakes.length ||
      lessonContent.filter((c: any) => ["common_mistakes", "common_mistake", "mistakes", "mistake"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["COMMON_MISTAKES", "COMMON_MISTAKE", "MISTAKES", "MISTAKE"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["common_mistakes", "common_mistake", "mistakes"]) ? 1 : 0);
    const hasMistakes =
      mistakeCount >= 1 ||
      hasAIReq(["common_mistakes", "common_mistake", "mistakes"]);

    // 10. Teacher Guide
    const guideCount =
      teacherGuides.length ||
      lessonContent.filter((c: any) => ["teacher_guide", "teacher_guides"].includes((c.content_type || "").toLowerCase())).length ||
      lessonBlocks.filter((b: any) => ["TEACHER_GUIDE", "TEACHER_GUIDES"].includes((b.block_type || "").toUpperCase())).length ||
      (hasAIReq(["teacher_guide", "teacher_guides"]) ? 1 : 0);
    const hasTeacherGuide = guideCount >= 1 || hasAIReq(["teacher_guide", "teacher_guides"]);

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
