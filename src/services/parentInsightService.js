import { getStudent } from './database/studentRepository';
import { getStudentMastery, getWeakAreas } from './database/masteryRepository';
import { getLearningHistory, calculateOverallProgress } from './database/progressRepository';
import { getMistakeHistory } from './database/assessmentRepository';
import { getTutorInteractions } from './database/tutorRepository';
import { parentInsightRules as insightRules, assessmentRules } from '../data/domainRules.js';
import { generateRecommendations } from './recommendationEngine';
import { getSPDetails } from './taxonomyService';

/**
 * Transforms raw database data into parent-friendly insights.
 */

export const getLearningStrengths = async (studentId) => {
  // In a full implementation, we'd query masteryRepository for all MASTERED SPs.
  // For this prototype, we'll derive it from calculateOverallProgress which checks the memory store.
  const progress = await calculateOverallProgress(studentId);
  // We'll mock the specific strong SP if the student has mastered topics
  if (progress.mastered > 0) {
    return [insightRules.strengths.MASTERED.replace('{topicName}', 'Operasi Asas Matematik')];
  }
  return ["Anak anda sedang membina asas yang kukuh."];
};

export const getImprovementAreas = async (studentId) => {
  const weakSPs = await getWeakAreas(studentId);
  const mistakes = await getMistakeHistory(studentId);
  const feedback = [];
  
  if (mistakes && mistakes.length > 0) {
    // Return specific AI feedback based on exact mistakes logged by Assessment Engine
    const mistakeFeedback = mistakes.map(m => {
      const insight = assessmentRules.mistakeTypes[m.mistakeType];
      return insight?.parentFeedback || insightRules.improvements.STRUGGLING.replace('{topicName}', 'topik ini');
    });
    feedback.push(...mistakeFeedback);
  }

  const tutorInteractions = await getTutorInteractions(studentId);
  if (tutorInteractions && tutorInteractions.length > 5) {
    feedback.push("Anak kerap menggunakan bantuan AI Tutor. Mereka mungkin memerlukan lebih banyak bantuan visual semasa memahami konsep.");
  }

  if (feedback.length > 0) return feedback;

  if (!weakSPs || weakSPs.length === 0) return [];
  
  return weakSPs.map(sp => {
    const title = getSPDetails(sp.sp_code)?.title || sp.sp_code;
    return insightRules.improvements.STRUGGLING.replace('{topicName}', title);
  });
};

export const getWeeklyLearningSummary = async (studentId) => {
  const history = await getLearningHistory(studentId);
  // In a real app, filter history by `completed_at` > 7 days ago.
  
  // Calculate mock time (10 mins per mission)
  const totalMissions = history.length;
  const timeSpentMins = totalMissions * 10;
  
  const hours = Math.floor(timeSpentMins / 60);
  const mins = timeSpentMins % 60;
  const timeString = hours > 0 ? `${hours}j ${mins}m` : `${mins} minit`;

  let summaryText = `Minggu ini tiada aktiviti direkodkan.`;
  if (totalMissions > 0) {
    summaryText = `Minggu ini anak anda telah melengkapkan ${totalMissions} misi dan belajar selama ${timeString}.`;
  }

  return {
    summaryText,
    totalMissions,
    timeString
  };
};

export const getParentRecommendations = async (studentId, curriculum, grade, subject) => {
  const recs = generateRecommendations(studentId, curriculum, grade, subject);
  
  const formattedRecs = [];
  for (const spCode of recs.missingPrerequisites) {
    const title = getSPDetails(spCode)?.title || spCode;
    formattedRecs.push({
      type: 'MISSING_PREREQUISITE',
      message: insightRules.recommendations.MISSING_PREREQUISITE.template.replace('{topicName}', title),
      action: insightRules.recommendations.MISSING_PREREQUISITE.actionLabel
    });
  }
  
  for (const spCode of recs.reviewRequired) {
    const title = getSPDetails(spCode)?.title || spCode;
    formattedRecs.push({
      type: 'REVIEW_REQUIRED',
      message: insightRules.recommendations.REVIEW_REQUIRED.template.replace('{topicName}', title),
      action: insightRules.recommendations.REVIEW_REQUIRED.actionLabel
    });
  }

  // If no urgent reviews, recommend the next learning step
  if (formattedRecs.length === 0 && recs.nextLessons.length > 0) {
    const title = getSPDetails(recs.nextLessons[0])?.title || recs.nextLessons[0];
    formattedRecs.push({
      type: 'NEXT',
      message: insightRules.recommendations.NEXT.template.replace('{topicName}', title),
      action: insightRules.recommendations.NEXT.actionLabel
    });
  }

  return formattedRecs;
};

export const getParentDashboard = async (studentId, curriculum = 'KSSR_SEMAKAN', grade = 'Tahun 1', subject = 'Matematik') => {
  const student = await getStudent(studentId);
  const progress = await calculateOverallProgress(studentId);
  const weeklySummary = await getWeeklyLearningSummary(studentId);
  const strengths = await getLearningStrengths(studentId);
  const improvements = await getImprovementAreas(studentId);
  const recommendations = await getParentRecommendations(studentId, curriculum, grade, subject);

  return {
    childName: student?.name || 'Pelajar',
    overallProgress: progress.percentage,
    learningStreak: student?.profile?.streak || 0,
    totalXP: (progress.mastered * 50) + (weeklySummary.totalMissions * 10), // Safe mock fallback
    completedMissions: weeklySummary.totalMissions,
    strongestSubjects: strengths,
    improvementAreas: improvements,
    weeklySummary,
    recommendations
  };
};
