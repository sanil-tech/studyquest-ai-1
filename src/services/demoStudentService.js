import demoStudents from '../data/demoStudents.json';
import { initializePilotStudent, getDailyMission, getPilotProgressReport } from './pilotService';
import { generatePilotReport } from './learningAnalyticsService';
import { generateRecommendations } from './recommendationEngine';

let currentDemoStudent = null;

export const getDemoProfiles = () => demoStudents;

export const loadDemoProfile = (profileId) => {
  const profile = demoStudents.find(p => p.id === profileId);
  if (!profile) throw new Error("Demo profile not found");
  currentDemoStudent = profile;
  return profile;
};

export const runDiagnosticSimulation = async () => {
  if (!currentDemoStudent) throw new Error("No demo profile loaded");
  
  // Simulate the diagnostic assessment flow
  const initResult = await initializePilotStudent(currentDemoStudent.id, currentDemoStudent.name);
  
  return {
    action: "Diagnostic Assessment Completed",
    result: {
      initial_mastery: currentDemoStudent.mastery_state.overall - 20, // simulate growth
      current_mastery: currentDemoStudent.mastery_state.overall,
      weak_areas_identified: currentDemoStudent.mastery_state.weak_sp_codes,
      recommended_action: "GENERATE_PATH"
    }
  };
};

export const generateMissionSimulation = async () => {
  if (!currentDemoStudent) throw new Error("No demo profile loaded");
  
  // Use the actual Pilot Service layer to generate the mission
  const mission = await getDailyMission(currentDemoStudent.id);
  
  return {
    action: "Daily Mission Generated",
    result: mission
  };
};

export const completeLessonSimulation = async () => {
  if (!currentDemoStudent) throw new Error("No demo profile loaded");
  
  // Simulate mastery gain after a successful lesson
  const newMastery = Math.min(100, currentDemoStudent.mastery_state.overall + 5);
  currentDemoStudent = {
    ...currentDemoStudent,
    mastery_state: {
      ...currentDemoStudent.mastery_state,
      overall: newMastery
    },
    learning_history: {
      ...currentDemoStudent.learning_history,
      lessons_completed: currentDemoStudent.learning_history.lessons_completed + 1
    }
  };
  
  return {
    action: "Lesson Completed Successfully",
    result: {
      xp_earned: 150,
      new_mastery_level: newMastery,
      message: "Great job! Mastery increased."
    }
  };
};

export const triggerMistakeSimulation = async () => {
  if (!currentDemoStudent) throw new Error("No demo profile loaded");
  
  // Simulate a mistake and AI Tutor intervention
  currentDemoStudent.learning_history.ai_hints_used += 1;
  
  return {
    action: "Mistake Detected & AI Tutor Triggered",
    result: {
      mistake_type: "Miscalculation",
      ai_tutor_hint: "Remember to carry over the 1 to the tens place. Let's try adding the ones column again.",
      hints_used_today: currentDemoStudent.learning_history.ai_hints_used
    }
  };
};

export const generateParentReportSimulation = async () => {
  if (!currentDemoStudent) throw new Error("No demo profile loaded");
  
  // Uses pilotService to format the parent report
  const report = await getPilotProgressReport(currentDemoStudent.id);
  
  return {
    action: "Parent Insight Report Generated",
    result: report
  };
};

export const generateAnalyticsSimulation = async () => {
  // Uses learningAnalyticsService to run the pilot cohort analysis
  const analytics = await generatePilotReport();
  
  return {
    action: "Pilot Analytics Cohort Report Generated",
    result: analytics
  };
};

export const resetDemoStudent = () => {
  if (!currentDemoStudent) return null;
  const original = demoStudents.find(p => p.id === currentDemoStudent.id);
  currentDemoStudent = JSON.parse(JSON.stringify(original));
  return { action: "Student Reset", result: currentDemoStudent };
};
