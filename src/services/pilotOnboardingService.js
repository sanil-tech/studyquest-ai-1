import profilesData from '../data/onboardingSimulationProfiles.json';
import { validatePipelineHandoff } from './endToEndValidationService';

export const getSimulationProfiles = () => profilesData.profiles;

export const runOnboardingDrill = async (profileId, logCallback, errorCallback) => {
  const profile = profilesData.profiles.find(p => p.id === profileId);
  if (!profile) throw new Error("Profile not found");

  const behavior = profile.simulated_behavior;
  const steps = [];

  const addLog = (stage, detail, status = "PASS") => {
    const entry = { id: Date.now() + Math.random(), stage, detail, status, time: new Date().toLocaleTimeString() };
    steps.push(entry);
    if (logCallback) logCallback(entry);
  };

  try {
    // 1. Registration
    await new Promise(r => setTimeout(r, 400));
    addLog("REGISTRATION", "Parent account created and OTP verified.");

    // 2. Child Profile
    await new Promise(r => setTimeout(r, 300));
    addLog("CHILD_PROFILE", `Profile created: ${profile.name} (Tahun 1).`);

    // 3. Diagnostic
    await new Promise(r => setTimeout(r, 600));
    addLog("DIAGNOSTIC", `Completed diagnostic assessment. Score: ${behavior.diagnostic_score}%`);

    // 4. Recommendation Engine
    await new Promise(r => setTimeout(r, 400));
    const recData = { sp_code: behavior.expected_sp };
    validatePipelineHandoff('RECOMMENDATION', recData);
    addLog("RECOMMENDATION", `Recommendation Engine assigned initial target: SP ${recData.sp_code}`);

    // 5. Lesson Retrieval
    await new Promise(r => setTimeout(r, 500));
    const lessonData = { sp_code: recData.sp_code, lesson_id: `L_${recData.sp_code.replace(/\./g, '')}`, has_assessment: true };
    validatePipelineHandoff('LESSON_RETRIEVAL', lessonData);
    addLog("LESSON_RETRIEVAL", `Resource Library served lesson ${lessonData.lesson_id} successfully.`);

    // 6. AI Tutor Interaction
    await new Promise(r => setTimeout(r, 700));
    if (behavior.lesson_mistakes > 0) {
      const tutorData = { mistakes: behavior.lesson_mistakes, tutor_fired: true };
      validatePipelineHandoff('AI_TUTOR', tutorData);
      addLog("AI_TUTOR", `Detected ${behavior.lesson_mistakes} mistake(s). Tutor intervened with conceptual hint.`);
    } else {
      addLog("AI_TUTOR", "No mistakes detected during widget interaction. Tutor remained silent.");
    }

    // 7. Assessment & Mastery
    await new Promise(r => setTimeout(r, 600));
    addLog("ASSESSMENT", `Final quiz completed. Score: ${behavior.final_assessment_score}%`);
    
    let nextState = behavior.final_assessment_score >= 85 ? "MASTERED" : (behavior.final_assessment_score < 50 ? "REVIEW_REQUIRED" : "LEARNING");
    const masteryData = { new_state: nextState };
    validatePipelineHandoff('MASTERY_UPDATE', masteryData);
    addLog("MASTERY_UPDATE", `Mastery Engine updated status to: ${nextState}`);

    // 8. Parent Dashboard
    await new Promise(r => setTimeout(r, 400));
    const parentData = { report_generated: true };
    validatePipelineHandoff('PARENT_REPORT', parentData);
    addLog("PARENT_REPORT", "Learning timeline updated and weekly report generated.");

    return { success: true, steps };

  } catch (error) {
    if (errorCallback) errorCallback(error.message);
    addLog("SYSTEM_FAILURE", error.message, "FAIL");
    return { success: false, steps, error: error.message };
  }
};
