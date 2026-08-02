// base44/functions/getLessonCompleteness/entry.ts
// Returns completeness metrics for a LessonVersion — used by Admin Content Studio dashboard.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { evaluateLessonCompleteness } from "../../shared/lessonCompletenessEvaluator.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { lesson_version_id } = body;

    if (!lesson_version_id) {
      return Response.json({ error: "lesson_version_id diperlukan." }, { status: 400 });
    }

    const evaluation = await evaluateLessonCompleteness(base44, lesson_version_id);

    return Response.json({
      lesson_version_id,
      completion_percentage: evaluation.completionPercentage,
      checks: evaluation.checks,
      counts: evaluation.counts,
      content_breakdown: {
        notes: evaluation.counts.notes,
        video: evaluation.counts.video,
        infographic: evaluation.counts.infographic,
        mindmap: evaluation.counts.mindmap,
        flashcards: evaluation.counts.flashcards,
        questions: evaluation.counts.questions,
        activities: evaluation.counts.activities,
        explanations: evaluation.counts.explanations,
        common_mistakes: evaluation.counts.common_mistakes,
        teacher_guide: evaluation.counts.teacher_guide,
      },
      publishing_readiness: evaluation.publishingReadiness,
      ai_requests: evaluation.aiRequestsSummary,
    });
  } catch (error: any) {
    console.error("getLessonCompleteness error:", error);
    return Response.json({ error: error.message || "Ralat sistem." }, { status: 500 });
  }
}
