/**
 * Strict validator for end-to-end simulated runs.
 * Throws errors if expected handoffs fail.
 */

export const validatePipelineHandoff = (stage, data) => {
  switch(stage) {
    case 'RECOMMENDATION':
      if (!data.sp_code) throw new Error("Recommendation Engine failed to provide an SP Code.");
      break;
    case 'LESSON_RETRIEVAL':
      if (!data.lesson_id) throw new Error(`Resource Library missing lesson for SP: ${data.sp_code}`);
      if (!data.has_assessment) throw new Error(`Lesson ${data.lesson_id} is missing an assessment module.`);
      break;
    case 'AI_TUTOR':
      if (data.mistakes > 0 && !data.tutor_fired) throw new Error("AI Tutor failed to intervene on simulated mistake.");
      break;
    case 'MASTERY_UPDATE':
      if (!data.new_state) throw new Error("Mastery Engine failed to calculate a new threshold state.");
      break;
    case 'PARENT_REPORT':
      if (!data.report_generated) throw new Error("Parent Dashboard failed to receive learning telemetry.");
      break;
    default:
      break;
  }
  return true;
};
