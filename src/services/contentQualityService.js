import qualityRules from '../data/contentQualityRules.json';
import { base44 } from './database/base44Client';

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
