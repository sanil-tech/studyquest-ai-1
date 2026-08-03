/**
 * Analyzes a collection of generated mission packages to detect duplicates and content repetition.
 * @param {Array} lessons - Array of lesson objects containing missionPackage
 * @returns {object} Duplicate Audit Report
 */
export function analyzeDuplicateContent(lessons = []) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return {
      has_duplicates: false,
      duplicate_story_hooks: [],
      similar_questions: [],
      repeated_activities: [],
      uniqueness_score: 100
    };
  }

  const hookMap = {};
  const questionMap = {};
  const activityMap = {};

  let totalHooks = 0;
  let duplicateHookCount = 0;

  lessons.forEach((l) => {
    const pkg = l.missionPackage || l;
    const spCode = l.sp_code || pkg.sp_code || "SP";

    // 1. Story Hook Analysis
    const hook = pkg.adventure_story?.title || pkg.steps?.[0]?.payload?.story_hook || pkg.steps?.[0]?.payload?.mascot_dialogue || "";
    if (hook) {
      totalHooks++;
      const cleanHook = hook.toLowerCase().trim();
      if (!hookMap[cleanHook]) {
        hookMap[cleanHook] = [spCode];
      } else {
        hookMap[cleanHook].push(spCode);
        duplicateHookCount++;
      }
    }

    // 2. Quiz Question Analysis
    const quizStep = pkg.steps?.find(s => s.step_type === "QUIZ" || s.questions);
    if (quizStep?.questions && Array.isArray(quizStep.questions)) {
      quizStep.questions.forEach(q => {
        const qText = (q.question || "").toLowerCase().trim();
        if (qText) {
          if (!questionMap[qText]) {
            questionMap[qText] = [spCode];
          } else {
            questionMap[qText].push(spCode);
          }
        }
      });
    }

    // 3. Activity / Widget Analysis
    const practiceStep = pkg.steps?.find(s => s.step_type === "PRACTICE" || s.payload?.widget_type);
    const widgetType = practiceStep?.payload?.widget_type || "default";
    if (!activityMap[widgetType]) {
      activityMap[widgetType] = [spCode];
    } else {
      activityMap[widgetType].push(spCode);
    }
  });

  const duplicateStoryHooks = Object.entries(hookMap)
    .filter(([_, sps]) => sps.length > 1)
    .map(([hook, sps]) => ({ hook, sps, count: sps.length }));

  const similarQuestions = Object.entries(questionMap)
    .filter(([_, sps]) => sps.length > 1)
    .map(([question, sps]) => ({ question, sps, count: sps.length }));

  const repeatedActivities = Object.entries(activityMap)
    .map(([widget, sps]) => ({ widget, count: sps.length, sps }));

  const uniquenessScore = totalHooks > 0
    ? Math.max(0, Math.round(((totalHooks - duplicateHookCount) / totalHooks) * 100))
    : 100;

  return {
    has_duplicates: duplicateStoryHooks.length > 0 || similarQuestions.length > 0,
    duplicate_story_hooks: duplicateStoryHooks,
    similar_questions: similarQuestions,
    repeated_activities: repeatedActivities,
    uniqueness_score: uniquenessScore
  };
}
