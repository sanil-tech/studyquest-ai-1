import qualityRules from '../data/contentQualityRules.json' with { type: "json" };

/**
 * Validates a generated lesson package against curriculum and pedagogical rules.
 */
export const validateLessonQuality = async (lesson, curriculumContext) => {
  const report = {
    checks: {
      alignment: { passed: false, score: 0, notes: [] },
      pedagogy: { passed: false, score: 0, notes: [] },
      assessment: { passed: false, score: 0, notes: [] },
      engagement: { passed: false, score: 0, notes: [] }
    },
    overall: {
      score: 0,
      approved: false,
      summary: ''
    }
  };

  // 1. DSKP Alignment Check
  let alignmentScore = 100;
  if (!lesson.title) {
    alignmentScore -= 20;
    report.checks.alignment.notes.push("Missing lesson title");
  }
  
  if (curriculumContext) {
    // Simulated deep NLP check against SP Code
    if (!lesson.content_blocks || lesson.content_blocks.length === 0) {
      alignmentScore -= 50;
      report.checks.alignment.notes.push("Lesson has no content blocks matching SP");
    }
  }
  
  report.checks.alignment.score = Math.max(0, alignmentScore);
  report.checks.alignment.passed = alignmentScore >= 80;

  // 2. Pedagogy & Bloom's Taxonomy Check
  let pedagogyScore = 100;
  const hasLearningObjective = lesson.learning_objective && lesson.learning_objective.length > 5;
  if (!hasLearningObjective) {
    pedagogyScore -= 30;
    report.checks.pedagogy.notes.push("Learning objective is missing or too vague.");
  } else if (lesson.learning_objective.toLowerCase().includes("understand")) {
    pedagogyScore -= 10;
    report.checks.pedagogy.notes.push("Use measurable verbs instead of 'Understand'.");
  }
  
  report.checks.pedagogy.score = Math.max(0, pedagogyScore);
  report.checks.pedagogy.passed = pedagogyScore >= 80;

  // 3. Assessment Coverage Check
  let assessmentScore = 100;
  let hasConcept = false;
  let hasPractice = false;
  let hasAssessment = false;
  
  (lesson.content_blocks || []).forEach(block => {
    const type = (block.block_type || "").toLowerCase();
    const phase = (block.pedagogical_phase || "").toLowerCase();

    if (phase === 'concept' || type === 'concept' || type === 'story' || type === 'text_markdown') hasConcept = true;
    if (phase === 'practice' || phase === 'application' || type === 'interactive' || type === 'practice' || type === 'flashcard_deck') hasPractice = true;
    if (phase === 'pbd_assessment' || type === 'assessment' || type === 'quiz' || type === 'interactive_game') hasAssessment = true;
  });

  if (!hasConcept) {
    assessmentScore -= 30;
    report.checks.assessment.notes.push("Missing concept teaching phase.");
  }
  if (!hasPractice) {
    assessmentScore -= 30;
    report.checks.assessment.notes.push("Missing interactive practice phase.");
  }
  if (!hasAssessment) {
    assessmentScore -= 30;
    report.checks.assessment.notes.push("Missing final assessment phase.");
  }

  report.checks.assessment.score = Math.max(0, assessmentScore);
  report.checks.assessment.passed = assessmentScore >= 80;

  // 4. Engagement (Activity Matching)
  let engagementScore = 100;
  // Simplified engagement check (checking if it has at least one interactive widget)
  const hasWidget = (lesson.content_blocks || []).some(b => b.block_type === 'interactive');
  if (!hasWidget) {
    engagementScore -= 20;
    report.checks.engagement.notes.push("Consider adding an interactive widget.");
  }
  
  report.checks.engagement.score = Math.max(0, engagementScore);
  report.checks.engagement.passed = engagementScore >= 80;

  // Calculate Overall
  const finalScore = Math.round(
    (report.checks.alignment.score * qualityRules.scoring_weights.alignment) +
    (report.checks.pedagogy.score * qualityRules.scoring_weights.pedagogy) +
    (report.checks.assessment.score * qualityRules.scoring_weights.assessment) +
    (report.checks.engagement.score * qualityRules.scoring_weights.engagement)
  );

  report.overall.score = finalScore;
  report.overall.approved = finalScore >= qualityRules.passing_threshold;
  report.overall.summary = report.overall.approved ? "Lesson meets quality standards." : "Lesson requires revision.";

  return report;
};

export const saveLessonReview = async (lessonId, report) => {
  try {
    const { base44 } = await import('../api/base44Client.js');
    const data = {
      lesson_id: lessonId,
      quality_score: report.overall.score,
      alignment_score: report.checks.alignment.score,
      pedagogy_score: report.checks.pedagogy.score,
      approved: report.overall.approved,
      review_notes: JSON.stringify(report.checks),
      created_at: new Date().toISOString()
    };
    
    await base44.entities.LessonReview.create(data);
    return true;
  } catch (error) {
    console.error("Failed to save lesson review to Base44:", error);
    return false;
  }
};

/**
 * Validates AI Content Authenticity against 5 Alignment Dimensions.
 * Enforces score >= 85 threshold before publishing to students.
 */
export function validateAIContentAuthenticity({
  subject = "Matematik",
  grade = "Tahun 1",
  topic = "",
  skCode = "",
  spCode = "",
  spDescription = "",
  missionPackage = null
}) {
  const issues = [];
  let score = 100;

  if (!missionPackage || typeof missionPackage !== "object") {
    return {
      authenticity_score: 0,
      passed: false,
      issues: ["Payload missionPackage tidak wujud atau tidak sah."]
    };
  }

  const spTargetText = (spDescription || topic || "").toLowerCase();
  const spCodeTarget = (spCode || "").toLowerCase();

  // 1. STORY ALIGNMENT (20 pts)
  const story = missionPackage.adventure_story || {};
  const storyText = `${story.title || ""} ${story.introduction || ""} ${story.mission_goal || ""}`.toLowerCase();
  const storyHook = (missionPackage.steps?.[0]?.payload?.story_hook || "").toLowerCase();
  const combinedStory = `${storyText} ${storyHook}`;

  const hasStoryMatch = (spTargetText && combinedStory.includes(spTargetText.slice(0, 15))) ||
                         (spCodeTarget && combinedStory.includes(spCodeTarget)) ||
                         combinedStory.length > 30;

  if (!hasStoryMatch) {
    score -= 20;
    issues.push("Pensejajaran Cerita: Jalan cerita/briefing tidak merujuk secara khusus kepada kemahiran SP.");
  }

  // 2. CPA ALIGNMENT (20 pts)
  const engagementStep = (missionPackage.steps || []).find(s => s.step_type === "ENGAGEMENT") || {};
  const cpaBlocks = engagementStep.cpa_blocks || [];
  const requiredCPATypes = ["VISUAL_STORY", "COMPARISON_SPLIT", "STEP_BY_STEP", "MYTH_BUSTER"];

  let cpaScore = 20;
  requiredCPATypes.forEach((cpaType) => {
    const block = cpaBlocks.find(b => b.block_type === cpaType);
    if (!block) {
      cpaScore -= 5;
      issues.push(`Pensejajaran CPA: Blok '${cpaType}' terlepas daripada Langkah 2.`);
    } else {
      const blockStr = JSON.stringify(block.content || {}).toLowerCase();
      if (blockStr.length < 10) {
        cpaScore -= 3;
        issues.push(`Pensejajaran CPA: Kandungan blok '${cpaType}' terlalu ringkas.`);
      }
    }
  });
  score -= (20 - Math.max(0, cpaScore));

  // 3. CONCEPT ALIGNMENT (20 pts)
  const lessonStep = (missionPackage.steps || []).find(s => s.step_type === "LESSON") || {};
  const conceptSummary = (lessonStep.payload?.concept_summary || "").toLowerCase();
  const keyPoints = lessonStep.payload?.key_points || [];

  if (!conceptSummary || conceptSummary.length < 15) {
    score -= 20;
    issues.push("Pensejajaran Konsep: Langkah 3 (LESSON) kekurangan ringkasan konsep yang bermakna.");
  } else if (spCodeTarget && !conceptSummary.includes(spCodeTarget) && !conceptSummary.includes("sk") && !conceptSummary.includes("sp")) {
    score -= 10;
    issues.push("Pensejajaran Konsep: Ringkasan konsep tidak merujuk standard SK/SP secara eksplisit.");
  }

  // 4. ACTIVITY ALIGNMENT (20 pts)
  const practiceStep = (missionPackage.steps || []).find(s => s.step_type === "PRACTICE") || {};
  const widgetType = (practiceStep.payload?.widget_type || "").toLowerCase();

  const topicLower = (topic || spDescription || "").toLowerCase();
  let expectedWidget = "";
  if (topicLower.includes("pecahan")) expectedWidget = "fraction_slicer";
  else if (topicLower.includes("wang")) expectedWidget = "money_counter";
  else if (topicLower.includes("masa") || topicLower.includes("waktu")) expectedWidget = "clock_face";
  else if (topicLower.includes("bentuk")) expectedWidget = "shape_sorter";
  else if (topicLower.includes("data")) expectedWidget = "piktograf_chart";
  else if (subject.toLowerCase().includes("matematik")) expectedWidget = "base_ten_blocks";

  if (expectedWidget && widgetType && widgetType !== expectedWidget && !widgetType.includes(expectedWidget.slice(0, 5))) {
    score -= 15;
    issues.push(`Pensejajaran Aktiviti: Widget '${widgetType}' tidak sepadan dengan sasaran domain '${expectedWidget}'.`);
  }

  // 5. ASSESSMENT ALIGNMENT (20 pts)
  const quizStep = (missionPackage.steps || []).find(s => s.step_type === "QUIZ") || {};
  const questions = quizStep.questions || quizStep.payload?.questions || [];

  if (!Array.isArray(questions) || questions.length === 0) {
    score -= 20;
    issues.push("Pensejajaran Pentaksiran: Tiada soalan kuiz PBD ditemui dalam Langkah 7.");
  } else {
    const firstQ = questions[0] || {};
    if (!firstQ.question || firstQ.question.length < 10) {
      score -= 10;
      issues.push("Pensejajaran Pentaksiran: Teks soalan kuiz tidak bermakna.");
    }
    if (!firstQ.explanation) {
      score -= 5;
      issues.push("Pensejajaran Pentaksiran: Soalan kuiz kekurangan penerangan jawapan.");
    }
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const passed = finalScore >= 85;

  return {
    authenticity_score: finalScore,
    passed,
    issues
  };
}
