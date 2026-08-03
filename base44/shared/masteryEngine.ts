// base44/shared/masteryEngine.ts
import { z } from "npm:zod";

// StudyQuest Mastery Engine - Evaluates student performance using 4-tier weighted mastery calculation
// (Quiz Accuracy 50%, Bloom Taxonomy 20%, Recent Performance 20%, Practice Consistency 10%)

export interface QuestionResultInput {
  question_id: string;
  is_correct: boolean;
  selected_option_id?: string;
  explanation?: string;
  cognitive_level?: string;
  concept?: string;
  misconception_target?: string;
}

export interface MasteryAnalysisResult {
  mastery_score: number;
  mastery_level: "mastered" | "developing" | "needs_foundation";
  tp_level: number;
  ewma_score: number;
  bloom_weighted_score: number;
  weaknesses: string[];
  misconceptions: string[];
  recommended_level: string;
  recommendation_type: "remediation" | "reinforcement" | "challenge";
}

const BLOOM_WEIGHTS: Record<string, number> = {
  remember: 0.6,
  understand: 0.8,
  apply: 1.0,
  analyze: 1.2,
  evaluate: 1.4,
  create: 1.5,
};

/**
 * Calculates student mastery score using 4-part weighted formula:
 * 1. Quiz Accuracy (50%)
 * 2. Bloom Cognitive Level Weighting (20%)
 * 3. Recent Performance Trend (20%)
 * 4. Practice Consistency (10%)
 */
export function analysePerformance(
  scorePercentage: number,
  questionResults: QuestionResultInput[],
  previousAttempts: any[] = [],
  formLevel: string = "Tahun 4"
): MasteryAnalysisResult {
  const totalQuestions = Math.max(1, questionResults.length);
  const correctResults = questionResults.filter((q) => q.is_correct);

  // 1. Quiz Accuracy Score (50%)
  const accuracyScore = Math.min(100, Math.max(0, scorePercentage));

  // 2. Bloom Cognitive Level Score (20%)
  let totalBloomWeight = 0;
  correctResults.forEach((q) => {
    const levelKey = (q.cognitive_level || "understand").toLowerCase();
    totalBloomWeight += BLOOM_WEIGHTS[levelKey] || 0.8;
  });
  const maxPossibleWeight = totalQuestions * 1.0;
  const bloomScore = Math.min(100, Math.round((totalBloomWeight / maxPossibleWeight) * 100));

  // 3. Recent Performance Trend / EWMA (20%)
  let recentTrendScore = accuracyScore;
  if (previousAttempts.length > 0) {
    const pastScores = previousAttempts.map(
      (att) => att.score ?? att.score_percentage ?? 0
    );
    const avgPastScore =
      pastScores.reduce((sum, val) => sum + val, 0) / pastScores.length;
    // Exponentially Weighted Moving Average (60% current, 40% historical)
    recentTrendScore = Math.round(0.6 * accuracyScore + 0.4 * avgPastScore);
  }

  // 4. Practice Consistency Score (10%)
  const attemptCount = previousAttempts.length + 1;
  const consistencyScore =
    attemptCount >= 5 ? 100 : attemptCount >= 3 ? 85 : attemptCount >= 2 ? 70 : 50;

  // Composite Mastery Score
  const masteryScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        accuracyScore * 0.5 +
          bloomScore * 0.2 +
          recentTrendScore * 0.2 +
          consistencyScore * 0.1
      )
    )
  );

  // Determine Mastery Level & Tahap Penguasaan (TP1 - TP6)
  let masteryLevel: "mastered" | "developing" | "needs_foundation" = "developing";
  let tpLevel = 3;
  let recommendationType: "remediation" | "reinforcement" | "challenge" = "reinforcement";

  if (masteryScore >= 85) {
    masteryLevel = "mastered";
    tpLevel = masteryScore >= 95 ? 6 : 5;
    recommendationType = "challenge";
  } else if (masteryScore >= 60) {
    masteryLevel = "developing";
    tpLevel = masteryScore >= 75 ? 4 : 3;
    recommendationType = "reinforcement";
  } else {
    masteryLevel = "needs_foundation";
    tpLevel = masteryScore >= 40 ? 2 : 1;
    recommendationType = "remediation";
  }

  // Extract Weaknesses & Misconceptions from wrong questions
  const wrongResults = questionResults.filter((q) => !q.is_correct);
  const weaknessSet = new Set<string>();
  const misconceptionSet = new Set<string>();

  wrongResults.forEach((q) => {
    if (q.concept) {
      weaknessSet.add(q.concept);
    }
    if (q.misconception_target) {
      misconceptionSet.add(q.misconception_target);
    } else if (q.explanation) {
      misconceptionSet.add(q.explanation.slice(0, 80));
    }
  });

  const weaknesses = Array.from(weaknessSet);
  const misconceptions = Array.from(misconceptionSet);

  // Recommended Difficulty Level
  let recommendedLevel = formLevel;
  if (masteryLevel === "needs_foundation") {
    recommendedLevel = `${formLevel} (Asas Bimbingan)`;
  } else if (masteryLevel === "mastered") {
    recommendedLevel = `${formLevel} (Misi Cabaran KBAT)`;
  }

  return {
    mastery_score: masteryScore,
    mastery_level: masteryLevel,
    tp_level: tpLevel,
    ewma_score: recentTrendScore,
    bloom_weighted_score: bloomScore,
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Pilihan Jawapan Objektif"],
    misconceptions: misconceptions.length > 0 ? misconceptions : ["Miskonsepsi Asas Topik"],
    recommended_level: recommendedLevel,
    recommendation_type: recommendationType,
  };
}

// ==========================================
// NEW: ZOD SCHEMA & GATEWAY ENGINE (Fasa 1)
// ==========================================

/**
 * Strict schema validation for evaluating diagnostic quizzes and gateway attempts.
 */
export const EvaluateQuizRequestSchema = z.object({
  student_id: z.string().min(1, "Student ID cannot be empty"),
  assessment_id: z.string().min(1, "Assessment/Topic ID cannot be empty"),
  duration_seconds: z.number().nonnegative().optional().default(0),
  answers: z.array(
    z.object({
      question_id: z.string(),
      selected_option_id: z.string().optional(),
      selected_option: z.string().optional(),
      text_answer: z.string().optional(),
      is_correct: z.boolean().optional(), // In case pre-evaluated
      subtopic_id: z.string().optional(), // For gateway subtopic breakdown
      tp_level: z.number().min(1).max(6).optional()
    })
  ).min(1, "At least one answer must be provided")
});

export interface SubtopicBreakdown {
  subtopic_id: string;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  max_tp_achieved: number;
  is_passed: boolean;
}

export interface GatewayResult {
  isTopicUnlocked: boolean;
  failedSubtopicIds: string[];
  subtopics: SubtopicBreakdown[];
}

/**
 * Calculates per-subtopic accuracy and determines if the student passes the 60% gateway threshold.
 */
export function calculateSubtopicBreakdown(
  questionResults: (QuestionResultInput & { subtopic_id?: string; tp_level?: number })[]
): GatewayResult {
  if (!questionResults || questionResults.length === 0) {
    return { isTopicUnlocked: false, failedSubtopicIds: [], subtopics: [] };
  }

  const subtopicMap = new Map<string, { total: number; correct: number; maxTp: number }>();

  // Aggregate stats per subtopic
  for (const q of questionResults) {
    const subId = q.subtopic_id || "unknown";
    const tp = q.tp_level || 1;

    if (!subtopicMap.has(subId)) {
      subtopicMap.set(subId, { total: 0, correct: 0, maxTp: 0 });
    }

    const stats = subtopicMap.get(subId)!;
    stats.total += 1;
    if (q.is_correct) {
      stats.correct += 1;
      if (tp > stats.maxTp) {
        stats.maxTp = tp;
      }
    }
  }

  const subtopics: SubtopicBreakdown[] = [];
  const failedSubtopicIds: string[] = [];
  let allPassed = true;

  // Evaluate 60% threshold rule for each subtopic
  for (const [subId, stats] of subtopicMap.entries()) {
    // Avoid divide-by-zero
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isPassed = percentage >= 60;

    if (!isPassed) {
      allPassed = false;
      failedSubtopicIds.push(subId);
    }

    subtopics.push({
      subtopic_id: subId,
      total_questions: stats.total,
      correct_count: stats.correct,
      score_percentage: percentage,
      max_tp_achieved: stats.maxTp,
      is_passed: isPassed
    });
  }

  return {
    isTopicUnlocked: allPassed,
    failedSubtopicIds,
    subtopics
  };
}
