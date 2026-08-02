import diagnosticData from '../data/diagnosticTemplates.json';
import { getResourceBySP, getPrerequisites, getRecommendedNext } from './resourceLibraryService';
import { recordAttempt, getMastery } from './masteryEngine';
import { getSPDetails } from './taxonomyService';

/**
 * Diagnostic Assessment Engine
 * 
 * Determines a student's baseline mastery before they begin a syllabus.
 * Acts as the entry point to construct a personalized learning path, ensuring 
 * we don't assume mastery of prerequisite topics without proof.
 */

// In-memory store for active diagnostic sessions
let activeSessions = {};

/**
 * Initiates a new diagnostic assessment session for a student.
 * @param {string} studentId 
 * @param {string} curriculum 
 * @param {string} subject 
 * @param {string} yearLevel 
 * @returns {Object} assessment session
 */
export const createDiagnosticAssessment = (studentId, curriculum, subject, yearLevel) => {
  const sessionId = `sess_${studentId}_${Date.now()}`;
  
  const assessments = diagnosticData.assessments.filter(a => 
    a.curriculum === curriculum && 
    a.subject === subject && 
    a.year_level === yearLevel
  );

  activeSessions[sessionId] = {
    sessionId,
    studentId,
    curriculum,
    subject,
    yearLevel,
    assessments,
    currentAssessmentIndex: 0,
    answers: {},
    startTime: Date.now(),
    status: 'IN_PROGRESS'
  };

  return activeSessions[sessionId];
};

/**
 * Generates the specific test payload for a diagnostic.
 * @param {string} assessmentId 
 * @returns {Object|null}
 */
export const generateAssessment = (assessmentId) => {
  return diagnosticData.assessments.find(a => a.id === assessmentId) || null;
};

/**
 * Extracts questions from an assessment payload.
 * @param {string} assessmentId 
 * @returns {Object[]}
 */
export const getQuestions = (assessmentId) => {
  const assessment = generateAssessment(assessmentId);
  return assessment ? assessment.questions : [];
};

/**
 * Submits a student's answer for a specific diagnostic question.
 * @param {string} sessionId 
 * @param {string} questionId 
 * @param {string|number|Object} answer 
 * @param {number} timeSpent 
 */
export const submitAnswer = (sessionId, questionId, answer, timeSpent) => {
  const session = activeSessions[sessionId];
  if (!session) throw new Error("Invalid Diagnostic Session");

  // Locate the question across the session's assessments
  let questionTarget = null;
  for (const ast of session.assessments) {
    questionTarget = ast.questions.find(q => q.id === questionId);
    if (questionTarget) break;
  }

  if (!questionTarget) throw new Error("Question not found in this session");

  const isCorrect = String(answer) === String(questionTarget.correct_answer); // Basic string comparison for demo
  
  session.answers[questionId] = {
    answer,
    isCorrect,
    timeSpent,
    sp_code: questionTarget.sp_code
  };

  return session.answers[questionId];
};

/**
 * Calculates raw score for the assessment session.
 * @param {string} sessionId 
 * @returns {number} Percentage score
 */
export const calculateScore = (sessionId) => {
  const session = activeSessions[sessionId];
  if (!session) return 0;
  
  const answers = Object.values(session.answers);
  if (answers.length === 0) return 0;

  const correct = answers.filter(a => a.isCorrect).length;
  return Math.round((correct / answers.length) * 100);
};

/**
 * Translates diagnostic results into SP mastery metrics.
 * @param {string} sessionId 
 * @returns {Object} SP Mastery map
 */
export const calculateMastery = (sessionId) => {
  const session = activeSessions[sessionId];
  if (!session) return {};

  const masteryMap = {};
  
  // Aggregate results by SP code
  Object.values(session.answers).forEach(ans => {
    if (!masteryMap[ans.sp_code]) {
      masteryMap[ans.sp_code] = { total: 0, correct: 0, timeSpent: 0 };
    }
    masteryMap[ans.sp_code].total += 1;
    masteryMap[ans.sp_code].timeSpent += ans.timeSpent;
    if (ans.isCorrect) masteryMap[ans.sp_code].correct += 1;
  });

  return masteryMap;
};

/**
 * Persists diagnostic findings into the core Mastery Engine.
 * @param {string} sessionId 
 */
export const updateMasteryEngine = (sessionId) => {
  const session = activeSessions[sessionId];
  if (!session) return;
  
  const masteryMap = calculateMastery(sessionId);

  // Hydrate the Mastery Engine
  Object.keys(masteryMap).forEach(spCode => {
    const data = masteryMap[spCode];
    // We treat the diagnostic as a series of attempts
    for (let i = 0; i < data.total; i++) {
      const isCorrect = i < data.correct;
      // Record attempt directly into Mastery Engine
      recordAttempt(session.studentId, spCode, isCorrect, Math.round(data.timeSpent / data.total));
    }
  });

  session.status = 'COMPLETED';
};

/**
 * Determines necessary revision based on failed diagnostic SPs.
 * @param {Object} masteryMap 
 * @returns {string[]}
 */
export const recommendRevision = (masteryMap) => {
  const revisionSet = new Set();
  Object.keys(masteryMap).forEach(spCode => {
    const score = (masteryMap[spCode].correct / masteryMap[spCode].total) * 100;
    if (score < 80) { // Diagnostic threshold
      const prereqs = getPrerequisites(spCode) || [];
      prereqs.forEach(p => revisionSet.add(p));
      revisionSet.add(spCode);
    }
  });
  return Array.from(revisionSet);
};

/**
 * Determines appropriate next topics based on passed diagnostic SPs.
 * @param {Object} masteryMap 
 * @returns {string[]}
 */
export const recommendNextSP = (masteryMap) => {
  const nextSet = new Set();
  Object.keys(masteryMap).forEach(spCode => {
    const score = (masteryMap[spCode].correct / masteryMap[spCode].total) * 100;
    if (score >= 80) {
      const nextSps = getRecommendedNext(spCode) || [];
      nextSps.forEach(n => nextSet.add(n));
    }
  });
  return Array.from(nextSet);
};

/**
 * Generates the structured, final analytical report.
 * @param {string} sessionId 
 * @returns {Object}
 */
export const generateAssessmentReport = (sessionId) => {
  const session = activeSessions[sessionId];
  if (!session || session.status !== 'COMPLETED') throw new Error("Session must be completed to generate report");

  const overallScore = calculateScore(sessionId);
  const masteryMap = calculateMastery(sessionId);
  const totalTime = Math.round((Date.now() - session.startTime) / 1000); // seconds

  const strongAreas = Object.keys(masteryMap).filter(sp => (masteryMap[sp].correct / masteryMap[sp].total) >= 0.8);
  const weakAreas = Object.keys(masteryMap).filter(sp => (masteryMap[sp].correct / masteryMap[sp].total) < 0.8);

  const revisionSPs = recommendRevision(masteryMap);
  const nextSPs = recommendNextSP(masteryMap);

  return {
    sessionId,
    studentId: session.studentId,
    overallScore,
    subjectScore: overallScore, // Subject level equals overall for single-subject diagnostics
    topicScore: overallScore,
    spMastery: masteryMap,
    strongAreas,
    weakAreas,
    recommendedRevision: revisionSPs,
    recommendedNext: nextSPs,
    recommendedLessons: revisionSPs.flatMap(sp => getResourceBySP(sp)?.lesson_ids || []),
    recommendedWidgets: revisionSPs.flatMap(sp => getResourceBySP(sp)?.widget_ids || []),
    recommendedQuizzes: revisionSPs.flatMap(sp => getResourceBySP(sp)?.quiz_ids || []),
    estimatedStudyTime: revisionSPs.length * 30, // Rough estimate: 30 mins per weak SP
    totalAssessmentTimeSpent: totalTime
  };
};

/**
 * Produces a strict sequence of SPs the student must follow.
 * @param {string} sessionId 
 * @returns {string[]}
 */
export const generateLearningPath = (sessionId) => {
  const report = generateAssessmentReport(sessionId);
  // Revisions must happen first, then new topics.
  return [...report.recommendedRevision, ...report.recommendedNext];
};
