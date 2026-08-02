import { base44 } from './base44Client';

/**
 * Repository layer for TutorInteraction entities using Base44 Cloud.
 */

export const logTutorInteraction = async (data) => {
  try {
    const recordData = {
      student_id: data.studentId,
      sp_code: data.spCode,
      question_id: data.questionId,
      hint_level: data.hintLevel || 1,
      student_response: data.studentResponse || '',
      tutor_response: data.tutorResponse || '',
      timestamp: data.timestamp || new Date().toISOString()
    };
    const record = await base44.entities.TutorInteraction.create(recordData);
    return record;
  } catch (error) {
    console.error("Failed to log tutor interaction to Base44:", error);
    return null;
  }
};

export const getTutorInteractions = async (studentId) => {
  try {
    const response = await base44.entities.TutorInteraction.filter({ student_id: studentId });
    return response || [];
  } catch (error) {
    console.error("Failed to fetch tutor interactions from Base44:", error);
    return [];
  }
};
