import { base44 } from './base44Client';
import { getOverallProgress } from '../masteryEngine';

/**
 * Repository layer for MissionProgress entities using Base44 Cloud.
 */

export const saveMissionProgress = async (studentId, missionId, lessonId, isComplete, score, xp) => {
  try {
    const data = {
      student_id: studentId,
      mission_id: missionId,
      lesson_id: lessonId,
      completion_status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
      score: score || 0,
      xp: xp || 0,
      stars: score > 80 ? 3 : score > 50 ? 2 : 1,
      completed: isComplete,
      timestamp: new Date().toISOString()
    };
    
    // In our schema we split MissionProgress and LessonProgress.
    // For simplicity, we write to MissionProgress here.
    const record = await base44.entities.MissionProgress.create(data);
    return record;
  } catch (error) {
    console.error("Failed to save mission progress to Base44:", error);
    return null;
  }
};

export const getLearningHistory = async (studentId) => {
  try {
    const response = await base44.entities.MissionProgress.filter({ student_id: studentId });
    
    if (response) {
      return response.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch learning history from Base44:", error);
    return [];
  }
};

export const calculateOverallProgress = async (studentId) => {
  // Can still use existing backend logic wrapper for complex aggregations
  // Alternatively, could query StudentMastery and aggregate.
  return getOverallProgress(studentId);
};
