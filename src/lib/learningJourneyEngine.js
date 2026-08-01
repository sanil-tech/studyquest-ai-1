import { analyzeLearningProfile, MASTERY_LEVELS } from "./learningProfileEngine.js";

/**
 * StudyQuest Learning Journey Intelligence Engine (Phase 6C)
 * 
 * Pure intelligence / service layer that analyzes long-term student growth across
 * multiple StudentLearningProfile snapshots over time.
 * 
 * Reusable by:
 * - Parent Dashboard
 * - Teacher Dashboard
 * - Student Dashboard
 * - Adaptive Adventure Generator
 */

/**
 * Calculates student learning momentum trend based on accuracy, mastery, and confidence trajectory.
 * 
 * @param {Array<Object>} profileHistory - Chronological array of StudentLearningProfile objects
 * @returns {"RISING" | "STABLE" | "DECLINING"} Momentum classification
 */
export function calculateMomentum(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length < 2) {
    return "STABLE";
  }

  const recent = profileHistory[profileHistory.length - 1];
  const previous = profileHistory[profileHistory.length - 2];

  const recentAccuracy = recent?.overallStats?.averageAccuracyPercent || 0;
  const previousAccuracy = previous?.overallStats?.averageAccuracyPercent || 0;

  const recentAnalysis = analyzeLearningProfile(recent);
  const previousAnalysis = analyzeLearningProfile(previous);

  const confidenceDiff = (recentAnalysis.confidence_score || 0) - (previousAnalysis.confidence_score || 0);
  const accuracyDiff = recentAccuracy - previousAccuracy;

  if (accuracyDiff >= 5 || confidenceDiff >= 10) {
    return "RISING";
  } else if (accuracyDiff <= -5 || confidenceDiff <= -10) {
    return "DECLINING";
  }

  return "STABLE";
}

/**
 * Estimates knowledge retention score (0-100) based on review frequency, time elapsed, and repeat accuracy.
 * 
 * @param {Array<Object>} profileHistory - Profile snapshots history
 * @returns {number} Retention Score (0 - 100)
 */
export function calculateRetention(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return 70; // Default baseline
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const topics = latest.topics || {};
  const topicKeys = Object.keys(topics);

  if (topicKeys.length === 0) return 70;

  let totalRetention = 0;
  const now = new Date().getTime();

  topicKeys.forEach((key) => {
    const t = topics[key];
    const accuracy = t.accuracyPercent || 0;
    const lastAttemptMs = t.lastAttemptedAt ? new Date(t.lastAttemptedAt).getTime() : now;
    const daysSince = Math.max(0, (now - lastAttemptMs) / (1000 * 60 * 60 * 24));

    // Memory decay model: Retention = Accuracy * e^(-0.03 * days)
    const decayFactor = Math.exp(-0.03 * daysSince);
    const estimatedTopicRetention = Math.round(accuracy * decayFactor);
    totalRetention += estimatedTopicRetention;
  });

  const avgRetention = Math.round(totalRetention / topicKeys.length);
  return Math.max(0, Math.min(100, avgRetention));
}

/**
 * Calculates consistency score (0-100) based on activity frequency, mission completion rate, and streaks.
 * 
 * @param {Array<Object>} profileHistory - Profile snapshots history
 * @returns {number} Consistency Score (0 - 100)
 */
export function calculateConsistency(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return 50;
  }

  const totalSnapshots = profileHistory.length;
  const latest = profileHistory[totalSnapshots - 1] || {};
  const overallStats = latest.overallStats || {};

  const totalMissions = overallStats.totalMissionsCompleted || 0;
  const totalQuizzes = overallStats.totalQuizzesAttempted || 0;

  // Consistency based on activity volume + snapshot history continuity
  let score = Math.min(60, totalSnapshots * 12);
  score += Math.min(25, totalMissions * 3);
  score += Math.min(15, totalQuizzes * 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Classifies student learning speed based on completion time, attempt count, and hint usage.
 * 
 * @param {Array<Object>} profileHistory - Profile snapshots history
 * @returns {"FAST" | "NORMAL" | "STEADY" | "NEEDS_SUPPORT"} Learning Speed classification
 */
export function calculateLearningSpeed(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return "NORMAL";
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const overallStats = latest.overallStats || {};

  const avgTime = overallStats.averageCompletionSeconds || 0;
  const hints = overallStats.totalHintsRequested || 0;
  const mistakes = overallStats.totalRepeatedMistakes || 0;
  const accuracy = overallStats.averageAccuracyPercent || 0;

  if (accuracy >= 80 && (avgTime <= 180 || hints <= 1)) {
    return "FAST";
  }
  if (accuracy >= 65 && hints <= 3 && mistakes <= 4) {
    return "NORMAL";
  }
  if (accuracy >= 50 && mistakes <= 6) {
    return "STEADY";
  }
  return "NEEDS_SUPPORT";
}

/**
 * Calculates student engagement score (0-100) based on completed missions, hint interactions, and time spent.
 * 
 * @param {Array<Object>} profileHistory - Profile snapshots history
 * @returns {number} Engagement Score (0 - 100)
 */
export function calculateEngagement(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return 50;
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const overallStats = latest.overallStats || {};

  const missions = overallStats.totalMissionsCompleted || 0;
  const questions = overallStats.totalQuestionsAnswered || 0;
  const hints = overallStats.totalHintsRequested || 0;

  let engagement = Math.min(40, missions * 8);
  engagement += Math.min(40, questions * 2);
  engagement += Math.min(20, hints * 2);

  return Math.max(10, Math.min(100, Math.round(engagement)));
}

/**
 * Generates comprehensive qualitative insights from student history.
 * 
 * @param {Array<Object>} profileHistory - Profile snapshots history
 * @returns {Object} Insights object
 */
export function generateJourneyInsights(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return {
      strengths: ["Langkah permulaan yang baik"],
      improvements: ["Lengkapkan lebih banyak misi kembara"],
      areas_to_review: ["Asas Nombor & Nilai Tempat"],
      celebrations: ["Selamat datang ke StudyQuest Learning Journey!"],
      risk_flags: []
    };
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const analysis = analyzeLearningProfile(latest);

  const strengths = analysis.strengths.length > 0
    ? analysis.strengths
    : ["Iltizam meneroka topik baharu bersama Otan"];

  const improvements = analysis.weaknesses.length > 0
    ? analysis.weaknesses.map(w => `Pengukuhan dalam ${w}`)
    : ["Kelajuan menjawab soalan aras tinggi"];

  const areas_to_review = analysis.recommended_revision.map(r => r.topic);

  const celebrations = [];
  if (analysis.confidence_score >= 80) {
    celebrations.push("Skor keyakinan murid berada pada tahap cemerlang!");
  }
  if (latest.overallStats?.totalMissionsCompleted >= 5) {
    celebrations.push(`Telah berjaya menyelesaikan ${latest.overallStats.totalMissionsCompleted} Misi Kembara!`);
  }
  if (celebrations.length === 0) {
    celebrations.push("Konsistensi pembelajaran yang amat baik!");
  }

  const risk_flags = [];
  if (latest.overallStats?.averageAccuracyPercent < 50) {
    risk_flags.push("Ketepatan purata berada di bawah 50%, memerlukan bantuan sokongan visual.");
  }
  if (latest.overallStats?.totalRepeatedMistakes >= 8) {
    risk_flags.push("Jumlah kesilapan berulang agak tinggi, disyorkan panduan Otan secara terarah.");
  }

  return {
    strengths,
    improvements,
    areas_to_review,
    celebrations,
    risk_flags
  };
}

/**
 * Main Function: Builds a complete long-term Learning Journey analysis from student profile history snapshots.
 * 
 * @param {Array<Object>} profileHistory - Chronological array of StudentLearningProfile objects
 * @returns {Object} Complete Learning Journey Intelligence object
 */
export function buildLearningJourney(profileHistory = []) {
  const historyArray = Array.isArray(profileHistory) ? profileHistory : [profileHistory];
  const safeHistory = historyArray.filter(Boolean);

  const latestProfile = safeHistory.length > 0 ? safeHistory[safeHistory.length - 1] : {};
  const previousProfile = safeHistory.length > 1 ? safeHistory[safeHistory.length - 2] : null;

  const latestAnalysis = analyzeLearningProfile(latestProfile);
  const previousAnalysis = previousProfile ? analyzeLearningProfile(previousProfile) : null;

  // Calculate stats & growth metrics
  const momentum = calculateMomentum(safeHistory);
  const retention = calculateRetention(safeHistory);
  const consistency = calculateConsistency(safeHistory);
  const speed = calculateLearningSpeed(safeHistory);
  const engagement = calculateEngagement(safeHistory);
  const insights = generateJourneyInsights(safeHistory);

  const latestAccuracy = latestProfile.overallStats?.averageAccuracyPercent || 0;
  const previousAccuracy = previousProfile?.overallStats?.averageAccuracyPercent || latestAccuracy;
  const accuracyChange = latestAccuracy - previousAccuracy;

  const latestConfidence = latestAnalysis.confidence_score || 50;
  const previousConfidence = previousAnalysis?.confidence_score || latestConfidence;
  const confidenceChange = latestConfidence - previousConfidence;

  // Overall progress percentage (0 - 100)
  const overall_progress = Math.min(100, Math.round(
    (latestAccuracy * 0.5) + (latestAnalysis.confidence_score * 0.3) + (consistency * 0.2)
  ));

  // Build Timeline Array
  const timeline = safeHistory.map((prof, index) => {
    const profAnalysis = analyzeLearningProfile(prof);
    const topicsList = Object.keys(prof.topics || {});
    return {
      snapshot_index: index + 1,
      date: prof.updatedAt || new Date().toISOString(),
      accuracy: prof.overallStats?.averageAccuracyPercent || 0,
      mastery: profAnalysis.mastery_level,
      confidence: profAnalysis.confidence_score,
      completedMissions: prof.overallStats?.totalMissionsCompleted || 0,
      topic: topicsList[0] ? prof.topics[topicsList[0]].topic : "Umum"
    };
  });

  // Recommended Focus
  let recommended_focus = {
    subject: "Matematik",
    topic: "Rumah Puluh dan Sa",
    reason: "Pengukuhan asas nilai tempat bersama Otan",
    priority: "MEDIUM"
  };

  if (latestAnalysis.weaknesses.length > 0) {
    recommended_focus = {
      subject: "Matematik",
      topic: latestAnalysis.weaknesses[0],
      reason: `Topik '${latestAnalysis.weaknesses[0]}' memerlukan pengukuhan bagi meningkatkan ketepatan.`,
      priority: "HIGH"
    };
  } else if (latestAnalysis.strengths.length > 0) {
    recommended_focus = {
      subject: "Matematik",
      topic: latestAnalysis.strengths[0],
      reason: `Teruskan ke cabaran aras tinggi bagi topik '${latestAnalysis.strengths[0]}'.`,
      priority: "LOW"
    };
  }

  // Otan Encouraging Summary Message
  let otan_summary = "";
  if (accuracyChange > 0) {
    otan_summary = `Hebat Pengembara! Ketepatan kamu meningkat ${accuracyChange}% berbanding sesi sebelum ini. 🦧🌟`;
  } else if (momentum === "RISING") {
    otan_summary = "Otan nampak kamu semakin yakin! Mari kita teruskan latihan supaya kemahiran ini kekal kuat.";
  } else if (latestAnalysis.mastery_level === MASTERY_LEVELS.MASTER) {
    otan_summary = "Syabas Juara! Kamu telah menguasai konsep ini dengan sangat cemerlang. Otan bangga dengan anda!";
  } else {
    otan_summary = "Langkah demi langkah, Pengembara! Setiap kembara bersama Otan menjadikan anda semakin bijak dan yakin.";
  }

  return {
    overall_progress,
    learning_momentum: momentum,
    mastery_growth: `${accuracyChange >= 0 ? "+" : ""}${accuracyChange}%`,
    confidence_growth: `${confidenceChange >= 0 ? "+" : ""}${confidenceChange}`,
    engagement_score: engagement,
    consistency_score: consistency,
    retention_score: retention,
    learning_speed: speed,
    timeline,
    insights,
    recommended_focus,
    otan_summary
  };
}

export default {
  calculateMomentum,
  calculateRetention,
  calculateConsistency,
  calculateLearningSpeed,
  calculateEngagement,
  generateJourneyInsights,
  buildLearningJourney
};
