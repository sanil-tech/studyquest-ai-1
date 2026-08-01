/**
 * StudyQuest Adaptive Learning Intelligence Engine (Phase 6A)
 * 
 * Provides client-side analytics to build student learning profiles,
 * track mastery per topic, analyze performance metrics, and generate
 * adaptive recommendations for KSSR StudyQuest Learning Adventures.
 */

/**
 * Standard Mastery Levels
 */
export const MASTERY_LEVELS = {
  BEGINNER: "BEGINNER",     // < 50% accuracy or just started
  DEVELOPING: "DEVELOPING", // 50% - 69% accuracy
  PROFICIENT: "PROFICIENT font-bold text-emerald-400", // 70% - 84% accuracy
  MASTER: "MASTER"          // 85%+ accuracy with high consistency
};

/**
 * Builds a standardized StudentLearningProfile object from raw lesson progress,
 * quiz attempts, and activity history.
 *
 * @param {Object} input
 * @param {string} [input.studentId] - Unique student identifier
 * @param {Array} [input.progressRecords=[]] - Raw lesson/adventure progress array
 * @param {Array} [input.quizAttempts=[]] - Array of completed quiz attempt objects
 * @param {Object} [input.existingProfile=null] - Pre-existing profile object to merge/update
 * @returns {Object} StudentLearningProfile
 */
export function buildStudentLearningProfile({
  studentId = "anonymous_student",
  progressRecords = [],
  quizAttempts = [],
  existingProfile = null
} = {}) {
  const profile = existingProfile || {
    studentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    topics: {}, // topic_slug -> { topic, subject, accuracy, attempts, hintsUsed, repeatedMistakes, completionTimeAvg, completedMissionsCount, lastAttemptedAt }
    overallStats: {
      totalMissionsCompleted: 0,
      totalQuizzesAttempted: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      totalHintsRequested: 0,
      totalRepeatedMistakes: 0,
      averageAccuracyPercent: 0,
      averageCompletionSeconds: 0
    }
  };

  const topics = { ...(profile.topics || {}) };

  // Process Quiz Attempts
  quizAttempts.forEach((attempt) => {
    const topicKey = attempt.topic || attempt.topic_slug || "umum";
    if (!topics[topicKey]) {
      topics[topicKey] = {
        topic: attempt.topic_name || topicKey,
        subject: attempt.subject || "Matematik",
        totalQuestions: 0,
        correctQuestions: 0,
        attemptsCount: 0,
        hintsUsed: 0,
        repeatedMistakes: 0,
        totalTimeSeconds: 0,
        completedMissions: new Set(),
        lastAttemptedAt: attempt.timestamp || new Date().toISOString()
      };
    }

    const t = topics[topicKey];
    t.attemptsCount += 1;
    t.totalQuestions += attempt.totalQuestions || attempt.total || 0;
    t.correctQuestions += attempt.score || attempt.correctCount || 0;
    t.hintsUsed += attempt.hintsCount || attempt.hintsUsed || 0;
    t.repeatedMistakes += attempt.repeatedMistakes || attempt.wrongAttempts || 0;
    t.totalTimeSeconds += attempt.timeSpentSeconds || attempt.duration || 0;
    if (attempt.missionId) {
      if (t.completedMissions instanceof Set) {
        t.completedMissions.add(attempt.missionId);
      } else {
        t.completedMissions = new Set([attempt.missionId]);
      }
    }
    t.lastAttemptedAt = attempt.timestamp || new Date().toISOString();
  });

  // Process Progress Records
  progressRecords.forEach((record) => {
    const topicKey = record.topic || record.lesson_id || "umum";
    if (!topics[topicKey]) {
      topics[topicKey] = {
        topic: record.topic_name || topicKey,
        subject: record.subject || "Matematik",
        totalQuestions: 0,
        correctQuestions: 0,
        attemptsCount: 0,
        hintsUsed: 0,
        repeatedMistakes: 0,
        totalTimeSeconds: 0,
        completedMissions: new Set(),
        lastAttemptedAt: record.updated_at || new Date().toISOString()
      };
    }

    const t = topics[topicKey];
    if (record.completed_missions) {
      const missionsList = Array.isArray(record.completed_missions)
        ? record.completed_missions
        : Object.keys(record.completed_missions);
      missionsList.forEach((mId) => {
        if (t.completedMissions instanceof Set) {
          t.completedMissions.add(mId);
        } else {
          t.completedMissions = new Set(Array.from(t.completedMissions || []).concat(mId));
        }
      });
    }
    t.hintsUsed += record.hints_requested || 0;
    t.repeatedMistakes += record.wrong_attempts || 0;
  });

  // Compute aggregated stats
  let grandTotalQuestions = 0;
  let grandTotalCorrect = 0;
  let grandTotalHints = 0;
  let grandTotalMistakes = 0;
  let grandTotalMissions = 0;
  let grandTotalTime = 0;
  let topicCount = 0;

  const sanitizedTopics = {};
  Object.keys(topics).forEach((key) => {
    const raw = topics[key];
    const totalQ = raw.totalQuestions || 0;
    const correctQ = raw.correctQuestions || 0;
    const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
    const missionsSet = raw.completedMissions instanceof Set
      ? Array.from(raw.completedMissions)
      : Array.isArray(raw.completedMissions) ? raw.completedMissions : [];

    sanitizedTopics[key] = {
      topic: raw.topic,
      subject: raw.subject,
      accuracyPercent: accuracy,
      attemptsCount: raw.attemptsCount || 0,
      hintsUsed: raw.hintsUsed || 0,
      repeatedMistakes: raw.repeatedMistakes || 0,
      averageTimeSeconds: raw.attemptsCount > 0 ? Math.round(raw.totalTimeSeconds / raw.attemptsCount) : 0,
      completedMissionsCount: missionsSet.length,
      lastAttemptedAt: raw.lastAttemptedAt
    };

    grandTotalQuestions += totalQ;
    grandTotalCorrect += correctQ;
    grandTotalHints += raw.hintsUsed || 0;
    grandTotalMistakes += raw.repeatedMistakes || 0;
    grandTotalMissions += missionsSet.length;
    grandTotalTime += raw.totalTimeSeconds || 0;
    topicCount += 1;
  });

  const overallAccuracy = grandTotalQuestions > 0 ? Math.round((grandTotalCorrect / grandTotalQuestions) * 100) : 0;

  return {
    studentId,
    createdAt: profile.createdAt,
    updatedAt: new Date().toISOString(),
    topics: sanitizedTopics,
    overallStats: {
      totalMissionsCompleted: grandTotalMissions,
      totalQuizzesAttempted: quizAttempts.length,
      totalCorrectAnswers: grandTotalCorrect,
      totalQuestionsAnswered: grandTotalQuestions,
      totalHintsRequested: grandTotalHints,
      totalRepeatedMistakes: grandTotalMistakes,
      averageAccuracyPercent: overallAccuracy,
      averageCompletionSeconds: topicCount > 0 ? Math.round(grandTotalTime / Math.max(1, grandTotalMissions)) : 0
    }
  };
}

/**
 * Analyzes a StudentLearningProfile to produce adaptive recommendations,
 * mastery evaluation, strengths, weaknesses, and next steps.
 *
 * @param {Object} profile - StudentLearningProfile object
 * @returns {Object} Adaptive Intelligence Analysis
 */
export function analyzeLearningProfile(profile) {
  if (!profile || typeof profile !== "object") {
    return {
      mastery_level: MASTERY_LEVELS.BEGINNER,
      strengths: [],
      weaknesses: [],
      recommended_revision: [],
      recommended_next_adventure: {
        world_name: "Dunia Pembelajaran",
        adventure_title: "Pengembaraan Asas StudyQuest",
        topic_slug: "asas-pembelajaran",
        reason: "Mulakan pengembaraan pertama anda untuk membina profil pembelajaran!"
      },
      confidence_score: 50
    };
  }

  const topics = profile.topics || {};
  const topicKeys = Object.keys(topics);
  const overallStats = profile.overallStats || {};

  const strengths = [];
  const weaknesses = [];
  const revisionItems = [];

  // Evaluate per topic performance
  topicKeys.forEach((key) => {
    const t = topics[key];
    const accuracy = t.accuracyPercent || 0;
    const hints = t.hintsUsed || 0;
    const mistakes = t.repeatedMistakes || 0;
    const topicName = t.topic || key;

    // Rule for Strength: Accuracy >= 75% AND minimal mistakes
    if (accuracy >= 75 && mistakes <= 2) {
      strengths.push(topicName);
    }

    // Rule for Weakness / Revision needed: Accuracy < 65% OR high hints OR repeated mistakes
    if (accuracy < 65 || hints >= 4 || mistakes >= 3) {
      weaknesses.push(topicName);
      revisionItems.push({
        topic: topicName,
        subject: t.subject || "Matematik",
        accuracy,
        hintsUsed: hints,
        repeatedMistakes: mistakes,
        suggestedFocus: accuracy < 50
          ? "Penjelasan Asas & Visual (DISCOVER)"
          : mistakes >= 3
          ? "Latihan Pengukuhan Berpandu (PRACTICE)"
          : "Latihan Tanpa Petunjuk (INTERACT)"
      });
    }
  });

  // Determine overall Mastery Level
  const avgAccuracy = overallStats.averageAccuracyPercent || 0;
  const totalMissions = overallStats.totalMissionsCompleted || 0;
  const totalHints = overallStats.totalHintsRequested || 0;
  const totalMistakes = overallStats.totalRepeatedMistakes || 0;

  let mastery_level = MASTERY_LEVELS.BEGINNER;
  if (avgAccuracy >= 85 && totalMissions >= 3 && totalHints <= 3 && totalMistakes <= 3) {
    mastery_level = MASTERY_LEVELS.MASTER;
  } else if (avgAccuracy >= 70 && totalMissions >= 2) {
    mastery_level = "PROFICIENT";
  } else if (avgAccuracy >= 50 || totalMissions >= 1) {
    mastery_level = MASTERY_LEVELS.DEVELOPING;
  }

  // Calculate Confidence Score (0-100)
  // Base score from accuracy
  let confidence = avgAccuracy * 0.6;
  // Bonus for completed missions
  confidence += Math.min(25, totalMissions * 5);
  // Penalty for excessive hints and repeated mistakes
  confidence -= Math.min(15, totalHints * 1.5 + totalMistakes * 2);
  // Clamp between 10 and 100
  const confidence_score = Math.max(10, Math.min(100, Math.round(confidence)));

  // Generate Next Adventure Recommendation
  let recommended_next_adventure = null;
  if (weaknesses.length > 0) {
    const primaryWeakness = weaknesses[0];
    recommended_next_adventure = {
      world_name: "Rimba Pengukuhan",
      adventure_title: `Kembara Pemulihan: ${primaryWeakness}`,
      topic_slug: primaryWeakness.toLowerCase().replace(/\s+/g, "-"),
      reason: `Otan mencadangkan latihan pengukuhan bagi topik '${primaryWeakness}' untuk menguatkan kefahaman anda!`,
      isRevision: true
    };
  } else if (strengths.length > 0) {
    const primaryStrength = strengths[0];
    recommended_next_adventure = {
      world_name: "Dunia Cabaran Utama",
      adventure_title: `Cabaran Boss Lanjutan: ${primaryStrength}`,
      topic_slug: primaryStrength.toLowerCase().replace(/\s+/g, "-"),
      reason: `Tahniah! Anda telah menguasai '${primaryStrength}'. Teruskan ke cabaran aras tinggi!`,
      isRevision: false
    };
  } else {
    recommended_next_adventure = {
      world_name: "Dunia Matematik",
      adventure_title: "Rumah Puluh Adventure",
      topic_slug: "rumah-puluh",
      reason: "Terokai misi asas kembara nombor bersama Otan 🦧",
      isRevision: false
    };
  }

  return {
    mastery_level,
    strengths,
    weaknesses,
    recommended_revision: revisionItems,
    recommended_next_adventure,
    confidence_score
  };
}

export default {
  MASTERY_LEVELS,
  buildStudentLearningProfile,
  analyzeLearningProfile
};
