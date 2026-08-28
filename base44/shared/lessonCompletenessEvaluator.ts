// base44/shared/lessonCompletenessEvaluator.ts
// Shared evaluator for LessonVersion completeness metrics and publishing readiness.
// Enforces strict version isolation: content belonging to another LessonVersion is NEVER counted.

export const MIN_FLASHCARDS = 5;
export const MIN_QUESTIONS = 10;
export const MIN_ACTIVITIES = 1;

// Canonical 7-block lesson model (v2.0). Versions assembled from the Content
// Library are validated against these blocks instead of the legacy package
// (notes + 5 flashcards + 10 questions + activity + teacher guide).
export const CANONICAL_BLOCK_TYPES = [
  "STORY_HOOK",
  "LEARNING_OBJECTIVE",
  "CONCEPT_CPA",
  "WORKED_EXAMPLE",
  "INTERACTIVE_PRACTICE",
  "KEY_TAKEAWAY",
];

const CANONICAL_BLOCK_LABELS: Record<string, string> = {
  STORY_HOOK: "Kisah Pembuka",
  LEARNING_OBJECTIVE: "Objektif Pembelajaran",
  CONCEPT_CPA: "Konsep (CPA)",
  WORKED_EXAMPLE: "Contoh Berpandu",
  INTERACTIVE_PRACTICE: "Latihan Interaktif",
  KEY_TAKEAWAY: "Rumusan & Ingatan",
};

export interface CompletenessEvaluationResult {
  lessonVersion: any;
  lessonId: string;
  completionPercentage: number;
  checks: Record<string, boolean>;
  counts: Record<string, number>;
  publishingReadiness: {
    isReadyToPublish: boolean;
    missingRequirements: string[];
    mandatoryChecks: {
      notes: boolean;
      flashcards: boolean;
      questions: boolean;
      activities: boolean;
      teacher_guide: boolean;
    };
  };
  aiRequestsSummary: {
    total: number;
    pending_review: number;
    approved: number;
    rejected: number;
    list: any[];
  };
}

/**
 * Filter helper enforcing strict version isolation:
 * - Includes item if item.lesson_version_id === currentVersionId
 * - Includes item if !item.lesson_version_id (legacy unassigned content)
 * - Excludes item if item.lesson_version_id belongs to another version
 */
function filterEligibleRecords(byVer: any[], byLes: any[], currentVersionId: string): any[] {
  const map = new Map<string, any>();

  // Add records explicitly tagged with target version ID
  (byVer || []).forEach((item) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  // Add legacy records from lesson_id lookup ONLY IF unassigned to any version
  (byLes || []).forEach((item) => {
    if (item && item.id) {
      const verId = item.lesson_version_id;
      if (!verId || verId === currentVersionId) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
  });

  return Array.from(map.values());
}

export async function evaluateLessonCompleteness(
  base44: any,
  lessonVersionId: string
): Promise<CompletenessEvaluationResult> {
  const lessonVersion = await base44.asServiceRole.entities.LessonVersion.get(lessonVersionId).catch(() => null);
  if (!lessonVersion) {
    throw new Error("LessonVersion tidak dijumpai.");
  }

  const lessonId = lessonVersion.lesson_id;

  // 1. Fetch entity records for target version and parent lesson fallback in parallel
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
    base44.asServiceRole.entities.LessonContent.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.LessonContent.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.Flashcard.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.Flashcard.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.QuestionBank.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.QuestionBank.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.LearningActivity.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.LearningActivity.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.TeacherGuide.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.TeacherGuide.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.AIExplanation.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.AIExplanation.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.CommonMistake.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.CommonMistake.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.LessonBlock.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.LessonBlock.filter({ lesson_id: lessonId }).catch(() => []) : [],
    base44.asServiceRole.entities.AIContentRequest.filter({ lesson_version_id: lessonVersionId }).catch(() => []),
    lessonId ? base44.asServiceRole.entities.AIContentRequest.filter({ lesson_id: lessonId }).catch(() => []) : [],
  ]);

  // 2. Enforce strict version isolation on all fetched entities
  const lessonContent = filterEligibleRecords(lessonContentByVer, lessonContentByLes, lessonVersionId);
  const flashcards = filterEligibleRecords(flashcardsByVer, flashcardsByLes, lessonVersionId);
  const questions = filterEligibleRecords(questionsByVer, questionsByLes, lessonVersionId);
  const activities = filterEligibleRecords(activitiesByVer, activitiesByLes, lessonVersionId);
  const teacherGuides = filterEligibleRecords(teacherGuidesByVer, teacherGuidesByLes, lessonVersionId);
  const aiExplanations = filterEligibleRecords(aiExplanationsByVer, aiExplanationsByLes, lessonVersionId);
  const commonMistakes = filterEligibleRecords(commonMistakesByVer, commonMistakesByLes, lessonVersionId);
  const lessonBlocks = filterEligibleRecords(lessonBlocksByVer, lessonBlocksByLes, lessonVersionId);
  const aiRequests = filterEligibleRecords(aiRequestsByVer, aiRequestsByLes, lessonVersionId);

  // Helper for checking AIContentRequests
  const hasAIReq = (types: string[]) =>
    aiRequests.some(
      (r: any) =>
        (r.status === "completed" || r.status === "approved" || !!r.generated_content) &&
        types.includes((r.content_type || "").toLowerCase())
    );

  // 3. Category Evaluation (10 Categories)
  // Notes
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

  // Flashcards
  const flashcardCount =
    flashcards.length ||
    lessonContent.filter((c: any) => ["flashcard", "flashcards"].includes((c.content_type || "").toLowerCase())).length ||
    (hasAIReq(["flashcards", "flashcard"]) ? 5 : 0);
  const hasFlashcards = flashcardCount >= MIN_FLASHCARDS || hasAIReq(["flashcards", "flashcard"]);

  // Video
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

  // Mind Map
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

  // Infographic
  const infographicCount =
    lessonContent.filter((c: any) => ["infographic", "infographics"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["INFOGRAPHIC", "INFOGRAPHICS"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["infographic", "infographics"]) ? 1 : 0);
  const hasInfographic =
    infographicCount > 0 ||
    !!lessonVersion?.infographic_url ||
    lessonBlocks.some((b: any) => ["INFOGRAPHIC", "INFOGRAPHICS"].includes((b.block_type || "").toUpperCase())) ||
    hasAIReq(["infographic", "infographics"]);

  // Questions / Quiz
  const questionCount =
    questions.length ||
    lessonContent.filter((c: any) => ["quiz", "questions", "question", "assessment"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["QUIZ", "QUESTIONS", "QUESTION", "ASSESSMENT"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["questions", "quiz"]) ? 10 : 0);
  const hasQuestions = questionCount >= MIN_QUESTIONS || hasAIReq(["questions", "quiz"]);

  // Interactive Activities
  const activityCount =
    activities.length ||
    lessonContent.filter((c: any) => ["activity", "game", "interactive", "worksheet", "matching", "sorting"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["INTERACTIVE_GAME", "GAME", "ACTIVITY", "INTERACTIVE", "WORKSHEET"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["activity", "game", "interactive", "worksheet"]) ? 1 : 0);
  const hasActivities = activityCount >= MIN_ACTIVITIES || hasAIReq(["activity", "game", "interactive", "worksheet"]);

  // AI Explanations
  const explanationCount =
    aiExplanations.length ||
    lessonContent.filter((c: any) => ["explanation", "ai_explanation", "explanations"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["AI_EXPLANATION", "EXPLANATION", "EXPLANATIONS"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["explanation", "ai_explanation", "explanations"]) ? 1 : 0);
  const hasExplanations = explanationCount >= 1 || hasAIReq(["explanation", "ai_explanation", "explanations"]);

  // Common Mistakes
  const mistakeCount =
    commonMistakes.length ||
    lessonContent.filter((c: any) => ["common_mistakes", "common_mistake", "mistakes", "mistake"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["COMMON_MISTAKES", "COMMON_MISTAKE", "MISTAKES", "MISTAKE"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["common_mistakes", "common_mistake", "mistakes"]) ? 1 : 0);
  const hasMistakes = mistakeCount >= 1 || hasAIReq(["common_mistakes", "common_mistake", "mistakes"]);

  // Teacher Guide
  const guideCount =
    teacherGuides.length ||
    lessonContent.filter((c: any) => ["teacher_guide", "teacher_guides"].includes((c.content_type || "").toLowerCase())).length ||
    lessonBlocks.filter((b: any) => ["TEACHER_GUIDE", "TEACHER_GUIDES"].includes((b.block_type || "").toUpperCase())).length ||
    (hasAIReq(["teacher_guide", "teacher_guides"]) ? 1 : 0);
  const hasTeacherGuide = guideCount >= 1 || hasAIReq(["teacher_guide", "teacher_guides"]);

  const checks: Record<string, boolean> = {
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

  const counts: Record<string, number> = {
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
  };

  // Overall Completeness Score (across 10 categories)
  const completedCount = Object.values(checks).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 10) * 100);

  // 4. Publishing Readiness Validation
  // Canonical v2.0 lessons (assembled from the Content Library) are validated on
  // their 7 canonical blocks; legacy lessons keep the original package criteria.
  const presentBlockTypes = new Set(
    lessonBlocks.map((b: any) => String(b.block_type || "").toUpperCase())
  );
  const isCanonicalVersion =
    lessonVersion?.assembled_from_library === true ||
    CANONICAL_BLOCK_TYPES.every((t) => presentBlockTypes.has(t));

  const missingRequirements: string[] = [];

  if (isCanonicalVersion) {
    for (const blockType of CANONICAL_BLOCK_TYPES) {
      if (!presentBlockTypes.has(blockType)) {
        missingRequirements.push(`Blok ${CANONICAL_BLOCK_LABELS[blockType] || blockType}`);
      }
    }
  } else {
    if (!hasNotes) missingRequirements.push("Nota Pelajaran");
    if (!hasFlashcards) missingRequirements.push(`Flashcards (minimum ${MIN_FLASHCARDS}, kini ${flashcardCount})`);
    if (!hasQuestions) missingRequirements.push(`Soalan (minimum ${MIN_QUESTIONS}, kini ${questionCount})`);
    if (!hasActivities) missingRequirements.push(`Aktiviti (minimum ${MIN_ACTIVITIES}, kini ${activityCount})`);
    if (!hasTeacherGuide) missingRequirements.push("Panduan Guru");
  }

  const isReadyToPublish = missingRequirements.length === 0;

  // AI Requests Summary
  const pendingReview = aiRequests.filter((r: any) => r.status === "completed" || r.status === "generating" || r.status === "requested");
  const approved = aiRequests.filter((r: any) => r.status === "approved");
  const rejected = aiRequests.filter((r: any) => r.status === "rejected");

  // Canonical versions report completeness based on their canonical blocks.
  const finalCompletionPercentage = isCanonicalVersion
    ? Math.round(
        (CANONICAL_BLOCK_TYPES.filter((t) => presentBlockTypes.has(t)).length /
          CANONICAL_BLOCK_TYPES.length) *
          100
      )
    : completionPercentage;

  return {
    lessonVersion,
    lessonId,
    completionPercentage: finalCompletionPercentage,
    checks,
    counts,
    publishingReadiness: {
      isReadyToPublish,
      missingRequirements,
      mandatoryChecks: {
        notes: hasNotes,
        flashcards: hasFlashcards,
        questions: hasQuestions,
        activities: hasActivities,
        teacher_guide: hasTeacherGuide,
      },
    },
    aiRequestsSummary: {
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
  };
}