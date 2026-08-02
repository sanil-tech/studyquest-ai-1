import { getResourceBySP, getMasteryThreshold, getPrerequisites, getRecommendedNext, getRecommendedRevision } from './resourceLibraryService';
import { getSPDetails, getSPCatalogByGrade } from './taxonomyService';

/**
 * Student Mastery Engine
 * 
 * Sits on top of the Resource Library and Taxonomy services.
 * Calculates, records, and retrieves mastery metrics for a student on a per-SP basis.
 * Acts as the intelligence layer for future AI tutors and recommendation systems.
 */

// In-memory store for demonstration/prototype purposes. 
// In production, this would interface with Base44 or a persistent database.
let masteryStore = {};

/**
 * Initializes a blank mastery record for a student and a specific SP.
 * @param {string} studentId 
 * @param {string} spCode 
 * @returns {Object} 
 */
export const initializeStudentMastery = (studentId, spCode) => {
  const storeKey = `${studentId}_${spCode}`;
  if (!masteryStore[storeKey]) {
    masteryStore[storeKey] = {
      student_id: studentId,
      sp_code: spCode,
      mastery_percentage: 0,
      attempts: 0,
      correct_answers: 0,
      incorrect_answers: 0,
      average_score: 0,
      confidence_level: 'LOW',
      last_attempt: null,
      first_completed: null,
      time_spent: 0,
      streak: 0,
      recommended_revision: getPrerequisites(spCode) || [],
      recommended_next: getRecommendedNext(spCode) || [],
      current_status: 'NOT_STARTED'
    };
  }
  return masteryStore[storeKey];
};

/**
 * Retrieves the mastery record for a given student and SP.
 * @param {string} studentId 
 * @param {string} spCode 
 * @returns {Object}
 */
export const getMastery = (studentId, spCode) => {
  const storeKey = `${studentId}_${spCode}`;
  return masteryStore[storeKey] || initializeStudentMastery(studentId, spCode);
};

/**
 * Determines the categorical status based on mastery percentage and attempts.
 * @param {number} percentage 
 * @param {number} threshold 
 * @param {number} attempts 
 * @returns {string}
 */
const determineStatus = (percentage, threshold, attempts) => {
  if (attempts === 0) return 'NOT_STARTED';
  if (percentage >= threshold && percentage >= 90) return 'EXCELLENT';
  if (percentage >= threshold) return 'MASTERED';
  if (attempts > 3 && percentage < threshold - 20) return 'REVIEW_REQUIRED';
  return 'LEARNING';
};

/**
 * Calculates confidence based on consistency (streak) and accuracy.
 * @param {number} percentage 
 * @param {number} streak 
 * @returns {string}
 */
export const calculateConfidence = (percentage, streak) => {
  if (percentage >= 85 && streak >= 3) return 'HIGH';
  if (percentage >= 60 && streak >= 1) return 'MEDIUM';
  return 'LOW';
};

/**
 * Recalculates all derived mastery metrics for an SP record.
 * @param {Object} record 
 * @returns {Object}
 */
export const calculateMastery = (record) => {
  const totalAnswers = record.correct_answers + record.incorrect_answers;
  if (totalAnswers > 0) {
    // Simple accuracy for now. Can be weighted by difficulty later.
    record.mastery_percentage = Math.round((record.correct_answers / totalAnswers) * 100);
  }
  
  record.average_score = record.mastery_percentage; // Proxy for now
  record.confidence_level = calculateConfidence(record.mastery_percentage, record.streak);
  
  const threshold = getMasteryThreshold(record.sp_code) || 80;
  const previousStatus = record.current_status;
  record.current_status = determineStatus(record.mastery_percentage, threshold, record.attempts);

  // Set first completed if just mastered
  if (record.current_status === 'MASTERED' || record.current_status === 'EXCELLENT') {
    if (!record.first_completed) {
      record.first_completed = new Date().toISOString();
    }
  }

  // Dynamic recommendations
  if (record.current_status === 'REVIEW_REQUIRED') {
    record.recommended_revision = getRecommendedRevision(record.sp_code).length > 0 
      ? getRecommendedRevision(record.sp_code) 
      : getPrerequisites(record.sp_code);
  } else if (record.current_status === 'MASTERED' || record.current_status === 'EXCELLENT') {
    record.recommended_next = getRecommendedNext(record.sp_code);
  }

  return record;
};

/**
 * Records an attempt (quiz, widget, assessment) and updates mastery metrics.
 * @param {string} studentId 
 * @param {string} spCode 
 * @param {boolean} isCorrect 
 * @param {number} timeSpentSeconds 
 * @returns {Object} updated record
 */
export const recordAttempt = (studentId, spCode, isCorrect, timeSpentSeconds = 0) => {
  let record = getMastery(studentId, spCode);
  
  record.attempts += 1;
  record.time_spent += timeSpentSeconds;
  record.last_attempt = new Date().toISOString();

  if (isCorrect) {
    record.correct_answers += 1;
    record.streak += 1;
  } else {
    record.incorrect_answers += 1;
    record.streak = 0;
  }

  record = calculateMastery(record);
  
  // Save back to store
  masteryStore[`${studentId}_${spCode}`] = record;
  return record;
};

/**
 * Force updates an entire mastery record (useful for syncing from backend).
 * @param {string} studentId 
 * @param {string} spCode 
 * @param {Object} data 
 * @returns {Object}
 */
export const updateMastery = (studentId, spCode, data) => {
  const storeKey = `${studentId}_${spCode}`;
  masteryStore[storeKey] = { ...getMastery(studentId, spCode), ...data };
  return masteryStore[storeKey];
};

/**
 * Returns all SPs where the student is struggling.
 * @param {string} studentId 
 * @returns {Object[]}
 */
export const getWeakSPs = (studentId) => {
  return Object.values(masteryStore)
    .filter(record => record.student_id === studentId && record.current_status === 'REVIEW_REQUIRED');
};

/**
 * Returns all SPs where the student has achieved mastery.
 * @param {string} studentId 
 * @returns {Object[]}
 */
export const getStrongSPs = (studentId) => {
  return Object.values(masteryStore)
    .filter(record => record.student_id === studentId && 
           (record.current_status === 'MASTERED' || record.current_status === 'EXCELLENT'));
};

/**
 * Get dynamic revision recommendations based on weak SPs.
 * @param {string} studentId 
 * @returns {string[]} Array of SP Codes
 */
export const getRecommendedRevisionForStudent = (studentId) => {
  const weak = getWeakSPs(studentId);
  const recommendations = new Set();
  weak.forEach(w => {
    w.recommended_revision.forEach(r => recommendations.add(r));
  });
  return Array.from(recommendations);
};

/**
 * Get dynamic next-step recommendations based on strong SPs.
 * @param {string} studentId 
 * @returns {string[]} Array of SP Codes
 */
export const getRecommendedNextForStudent = (studentId) => {
  const strong = getStrongSPs(studentId);
  const recommendations = new Set();
  strong.forEach(s => {
    s.recommended_next.forEach(r => recommendations.add(r));
  });
  return Array.from(recommendations);
};

/**
 * Calculates overall progress across all interacted SPs.
 * @param {string} studentId 
 * @returns {Object}
 */
export const getOverallProgress = (studentId) => {
  const records = Object.values(masteryStore).filter(r => r.student_id === studentId);
  if (records.length === 0) return { totalSPs: 0, mastered: 0, percentage: 0 };
  
  const mastered = records.filter(r => r.current_status === 'MASTERED' || r.current_status === 'EXCELLENT').length;
  return {
    totalInteractedSPs: records.length,
    mastered,
    percentage: Math.round((mastered / records.length) * 100)
  };
};

/**
 * Calculates progress for a specific subject based on the Taxonomy Catalog.
 * @param {string} studentId 
 * @param {string} subject 
 * @returns {Object}
 */
export const getSubjectProgress = (studentId, subject) => {
  const records = Object.values(masteryStore).filter(r => {
    if (r.student_id !== studentId) return false;
    const details = getSPDetails(r.sp_code);
    return details && details.subject === subject;
  });
  
  if (records.length === 0) return { totalInteractedSPs: 0, mastered: 0, percentage: 0 };
  
  const mastered = records.filter(r => r.current_status === 'MASTERED' || r.current_status === 'EXCELLENT').length;
  return {
    totalInteractedSPs: records.length,
    mastered,
    percentage: Math.round((mastered / records.length) * 100)
  };
};

/**
 * Calculates progress for a specific year/form and subject.
 * @param {string} studentId 
 * @param {string} framework 
 * @param {string} grade 
 * @param {string} subjectId 
 * @returns {Object}
 */
export const getYearProgress = (studentId, framework, grade, subjectId) => {
  const catalog = getSPCatalogByGrade(framework, grade, subjectId);
  const totalInSyllabus = catalog.length;
  if (totalInSyllabus === 0) return { totalInSyllabus: 0, mastered: 0, percentage: 0 };

  let masteredCount = 0;
  catalog.forEach(sp => {
    const record = getMastery(studentId, sp.sp_code);
    if (record.current_status === 'MASTERED' || record.current_status === 'EXCELLENT') {
      masteredCount++;
    }
  });

  return {
    totalInSyllabus,
    mastered: masteredCount,
    percentage: Math.round((masteredCount / totalInSyllabus) * 100)
  };
};

// Export for test clearing / resetting if needed
export const _clearMasteryStore = () => { masteryStore = {}; };
