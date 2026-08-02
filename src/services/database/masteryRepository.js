import { base44 } from './base44Client';
import { recordAttempt } from '../masteryEngine';

/**
 * Repository layer for StudentMastery entities using Base44 Cloud.
 * Syncs local engine calculation with Cloud.
 */

export const saveMastery = async (studentId, spCode, isCorrect, timeSpent) => {
  // Use the local mastery engine for the complex math/logic
  const updatedRecord = recordAttempt(studentId, spCode, isCorrect, timeSpent);
  
  try {
    // Check if record exists
    const existing = await base44.entities.StudentMastery.filter({ student_id: studentId, sp_code: spCode });

    if (existing && existing.length > 0) {
      // Update
      await base44.entities.StudentMastery.update(existing[0].id, {
        mastery_percentage: updatedRecord.mastery_percentage,
          confidence_level: updatedRecord.confidence_level,
          status: updatedRecord.current_status,
          attempts: updatedRecord.attempts,
          last_attempt: updatedRecord.last_attempt
      });
    } else {
      // Create
      await base44.entities.StudentMastery.create({
        student_id: studentId,
        sp_code: spCode,
        mastery_percentage: updatedRecord.mastery_percentage,
        confidence_level: updatedRecord.confidence_level,
        status: updatedRecord.current_status,
        attempts: updatedRecord.attempts,
        last_attempt: updatedRecord.last_attempt
      });
    }
  } catch (error) {
    console.error("Failed to sync mastery to Base44:", error);
    // Continue gracefully, as local engine holds the session state
  }
  
  return {
    student_id: updatedRecord.student_id,
    sp_code: updatedRecord.sp_code,
    mastery_percentage: updatedRecord.mastery_percentage,
    confidence_level: updatedRecord.confidence_level,
    attempts: updatedRecord.attempts,
    time_spent: updatedRecord.time_spent,
    status: updatedRecord.current_status,
    updated_at: updatedRecord.last_attempt
  };
};

export const getStudentMastery = async (studentId, spCode) => {
  try {
    const response = await base44.entities.StudentMastery.filter({ student_id: studentId, sp_code: spCode });
    if (response && response.length > 0) {
      return response[0];
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch mastery from Base44:", error);
    return null;
  }
};

export const getWeakAreas = async (studentId) => {
  try {
    const response = await base44.entities.StudentMastery.filter({ student_id: studentId });
    if (response) {
      return response.filter(m => m.mastery_percentage < 60 || m.status === 'STRUGGLING');
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch weak areas from Base44:", error);
    return [];
  }
};
