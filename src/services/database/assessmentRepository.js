import { base44 } from './base44Client';

/**
 * Repository layer for AssessmentAttempt and DiagnosticAttempt entities using Base44 Cloud.
 */

export const saveDiagnosticResult = async (studentId, assessmentId, subject, score, resultPayload) => {
  try {
    // For simplicity, we assume DiagnosticResponse is the existing entity for this
    const data = {
      student_id: studentId,
      assessment_id: assessmentId,
      subject,
      score,
      completed_at: new Date().toISOString(),
      result_payload: JSON.stringify(resultPayload)
    };
    const response = await base44.entities.DiagnosticResponse.create(data);
    return response;
  } catch (error) {
    console.error("Failed to save diagnostic result to Base44:", error);
    return null;
  }
};

export const getDiagnosticHistory = async (studentId) => {
  try {
    const response = await base44.entities.DiagnosticResponse.filter({ student_id: studentId });
    if (response) {
      return response.map(a => ({
        ...a,
        result_payload: a.result_payload ? JSON.parse(a.result_payload) : {}
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch diagnostic history from Base44:", error);
    return [];
  }
};

export const logAssessmentAttempt = async (studentId, assessmentType, spCode, questionId, answer, correct, timeTaken, mistakeType, difficulty) => {
  try {
    const data = {
      student_id: studentId,
      sp_code: spCode,
      question_id: questionId,
      answer: String(answer),
      correct: Boolean(correct),
      mistake_type: mistakeType || 'NONE',
      difficulty: difficulty || 'BEGINNER',
      timestamp: new Date().toISOString()
    };
    const record = await base44.entities.AssessmentAttempt.create(data);
    return record;
  } catch (error) {
    console.error("Failed to log assessment attempt to Base44:", error);
    return null;
  }
};

export const getMistakeHistory = async (studentId) => {
  try {
    const response = await base44.entities.AssessmentAttempt.filter({ student_id: studentId, correct: false });
    if (response) {
      return response.filter(a => a.mistake_type && a.mistake_type !== 'UNKNOWN' && a.mistake_type !== 'NONE');
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch mistake history from Base44:", error);
    return [];
  }
};
