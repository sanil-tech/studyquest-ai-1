import rules from '../data/recommendationRules.json';
import { getMastery, getWeakSPs, getStrongSPs } from './masteryEngine';
import { getResourceBySP, getPrerequisites, getLessons, getWidgets, getQuizzes } from './resourceLibraryService';
import { getSPCatalogByGrade } from './taxonomyService';

/**
 * Recommendation Engine
 * 
 * Sits on top of the Mastery Engine and Resource Library.
 * Acts as the autonomous study planner for StudyQuest, generating personalized 
 * daily quests, revisions, and forward progression paths based entirely on deterministic mastery data.
 */

// ==========================================
// CORE METRICS & VELOCITY
// ==========================================

export const calculateLearningVelocity = (studentId) => {
  const strong = getStrongSPs(studentId);
  if (strong.length === 0) return 'MEDIUM';
  
  // A real implementation would check how quickly SPs transitioned from NOT_STARTED to MASTERED
  const averageAttempts = strong.reduce((acc, curr) => acc + curr.attempts, 0) / strong.length;
  if (averageAttempts <= 1.5) return 'HIGH';
  if (averageAttempts >= 3.5) return 'LOW';
  return 'MEDIUM';
};

export const calculateStudyPriority = (spCode, masteryRecord) => {
  const status = masteryRecord.current_status;
  return rules.priority_weights[status] || 0;
};

// ==========================================
// GENERATORS
// ==========================================

export const recommendRevision = (studentId) => {
  const weakSPs = getWeakSPs(studentId);
  const revisionSPs = new Set();
  
  weakSPs.forEach(record => {
    // Highly prioritize missing prerequisites
    const prereqs = getPrerequisites(record.sp_code);
    prereqs.forEach(p => {
      const pRecord = getMastery(studentId, p);
      if (pRecord.current_status !== 'MASTERED' && pRecord.current_status !== 'EXCELLENT') {
        revisionSPs.add(p);
      }
    });
    // Add the weak SP itself
    revisionSPs.add(record.sp_code);
  });
  
  return Array.from(revisionSPs);
};

export const recommendNextLesson = (studentId, framework, grade, subjectId) => {
  const catalog = getSPCatalogByGrade(framework, grade, subjectId);
  for (const sp of catalog) {
    const record = getMastery(studentId, sp.sp_code);
    if (record.current_status === 'NOT_STARTED' || record.current_status === 'LEARNING') {
      // Check if prerequisites are met
      const prereqs = getPrerequisites(sp.sp_code);
      const ready = prereqs.every(p => {
        const pRecord = getMastery(studentId, p);
        return pRecord.current_status === 'MASTERED' || pRecord.current_status === 'EXCELLENT';
      });
      if (ready) return [sp.sp_code];
    }
  }
  return [];
};

export const recommendWidget = (spCode) => getWidgets(spCode);
export const recommendQuiz = (spCode) => getQuizzes(spCode);
export const recommendPractice = (spCode) => getLessons(spCode);
export const recommendChallenge = (spCode) => getQuizzes(spCode); // Proxied for now

export const recommendDailyMission = (studentId, framework, grade, subjectId) => {
  const revision = recommendRevision(studentId);
  if (revision.length > 0) {
    // If there are weak spots, the daily mission MUST focus on revision.
    return {
      type: "REVISION",
      targetSP: revision[0],
      resources: {
        lessons: getLessons(revision[0]),
        widgets: getWidgets(revision[0])
      }
    };
  }

  const next = recommendNextLesson(studentId, framework, grade, subjectId);
  if (next.length > 0) {
    // Otherwise, push them forward
    return {
      type: "PROGRESSION",
      targetSP: next[0],
      resources: {
        lessons: getLessons(next[0]),
        widgets: getWidgets(next[0])
      }
    };
  }

  return { type: "ALL_CAUGHT_UP" };
};

export const recommendCatchUpPlan = (studentId) => {
  return recommendRevision(studentId).slice(0, 5); // Limit to top 5 blockers
};

export const recommendAdvancedPath = (studentId, framework, grade, subjectId) => {
  // Finds the next logical topic if they are accelerating
  return recommendNextLesson(studentId, framework, grade, subjectId);
};

export const recommendWeeklyPlan = (studentId, framework, grade, subjectId) => {
  return {
    monday: recommendDailyMission(studentId, framework, grade, subjectId),
    tuesday: recommendDailyMission(studentId, framework, grade, subjectId),
    wednesday: recommendDailyMission(studentId, framework, grade, subjectId),
    thursday: recommendDailyMission(studentId, framework, grade, subjectId),
    friday: recommendDailyMission(studentId, framework, grade, subjectId)
  };
};

/**
 * Generates the master recommendation payload.
 * @param {string} studentId 
 * @param {string} framework 
 * @param {string} grade 
 * @param {string} subjectId 
 * @returns {Object}
 */
export const generateRecommendations = (studentId, framework, grade, subjectId) => {
  const revision = recommendRevision(studentId);
  const nextLessons = recommendNextLesson(studentId, framework, grade, subjectId);
  
  // Aggregate resources based on priority targets
  const targetSPs = [...revision, ...nextLessons];
  const widgets = [];
  const quizzes = [];
  const practice = [];
  const challenge = [];
  
  targetSPs.forEach(spCode => {
    widgets.push(...recommendWidget(spCode));
    quizzes.push(...recommendQuiz(spCode));
    practice.push(...recommendPractice(spCode));
    challenge.push(...recommendChallenge(spCode));
  });

  const priorityLevel = revision.length > 0 ? "HIGH" : "MEDIUM";
  const estimatedStudyTime = (revision.length * rules.study_time_allocations.REVIEW_REQUIRED) + 
                             (nextLessons.length * rules.study_time_allocations.NOT_STARTED);

  return {
    dailyMission: targetSPs.slice(0, 2),
    revision,
    nextLessons,
    widgets: [...new Set(widgets)],
    quizzes: [...new Set(quizzes)],
    practice: [...new Set(practice)],
    challenge: [...new Set(challenge)],
    estimatedStudyTime,
    completionForecast: calculateLearningVelocity(studentId) === 'HIGH' ? 'FAST' : 'NORMAL',
    priorityLevel
  };
};
