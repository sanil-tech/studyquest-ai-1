import templates from '../data/questionTemplates.json';
import { assessmentRules as rules } from '../data/domainRules.js';
import { recordAttempt } from './masteryEngine';
import { logAssessmentAttempt } from './database/assessmentRepository';

/**
 * Assessment Intelligence Engine
 * 
 * Generates tailored questions, analyzes mistakes structurally, and 
 * adjusts difficulty based on live performance.
 */

export const generateAssessment = (studentId, subject, level, purpose) => {
  // For prototype, pick a template based on hardcoded mapping.
  // Real implementation would use the taxonomy's SP code to query templates.
  let selectedTemplateKey = "fraction_addition";
  if (level === "Tahun 1") {
    selectedTemplateKey = "number_comparison";
  }

  const template = templates[selectedTemplateKey];
  
  // Basic variable substitution (simulated)
  let qText = template.template;
  let correctAns = 0;
  let distractors = [];
  let renderedQuestion = {};

  if (selectedTemplateKey === "fraction_addition") {
    const den = 8;
    const num1 = 3;
    const num2 = 2;
    qText = `${num1}/${den} + ${num2}/${den} = ?`;
    correctAns = `${num1 + num2}/${den}`;
    
    // Distractor generation
    distractors.push({
      answer: `${num1 + num2}/${den + den}`,
      mistakeType: "DENOMINATOR_ADDITION"
    });
    distractors.push({
      answer: `${num1 * num2}/${den}`,
      mistakeType: "CONFUSED_OPERATOR"
    });
  } else if (selectedTemplateKey === "number_comparison") {
    const v1 = 42;
    const v2 = 68;
    qText = `Antara ${v1} dan ${v2}, yang manakah lebih besar?`;
    correctAns = Math.max(v1, v2).toString();
    distractors.push({
      answer: Math.min(v1, v2).toString(),
      mistakeType: "MISREAD_QUESTION_SMALLER"
    });
  }

  return {
    id: `q_${Date.now()}`,
    type: template.type,
    spCode: template.spCode,
    text: qText,
    correctAnswer: correctAns,
    options: [...distractors, { answer: correctAns, mistakeType: null }].sort(() => Math.random() - 0.5),
    difficulty: "STANDARD" // Default for now
  };
};

export const adjustDifficulty = (studentProfile, recentScore) => {
  const levels = ["BEGINNER", "FOUNDATION", "STANDARD", "CHALLENGE", "KBAT"];
  let currentIdx = levels.indexOf(studentProfile.currentDifficulty || "STANDARD");
  
  if (recentScore > 85 && currentIdx < levels.length - 1) {
    return levels[currentIdx + 1];
  }
  if (recentScore < 40 && currentIdx > 0) {
    return levels[currentIdx - 1];
  }
  return levels[currentIdx];
};

export const analyzeAnswer = (question, studentAnswer, studentId) => {
  const isCorrect = String(studentAnswer) === String(question.correctAnswer);
  
  let mistakeType = null;
  let insight = null;

  if (!isCorrect) {
    // Find if the answer matches a known distractor (trap)
    const trap = question.options.find(opt => String(opt.answer) === String(studentAnswer) && opt.mistakeType);
    if (trap) {
      mistakeType = trap.mistakeType;
      insight = rules.mistakeTypes[mistakeType];
    } else {
      mistakeType = "UNKNOWN";
      insight = rules.mistakeTypes.UNKNOWN;
    }
  }

  return {
    isCorrect,
    mistakeType,
    insight
  };
};

export const submitAssessmentAnswer = async (studentId, question, answer, timeTaken) => {
  const analysis = analyzeAnswer(question, answer, studentId);
  
  // 1. Log to Repository
  await logAssessmentAttempt(
    studentId, 
    "PRACTICE", 
    question.spCode, 
    question.id, 
    answer, 
    analysis.isCorrect, 
    timeTaken, 
    analysis.mistakeType, 
    question.difficulty
  );

  // 2. Hydrate Mastery Engine
  recordAttempt(studentId, question.spCode, analysis.isCorrect, timeTaken);

  // 3. (Optional) Trigger AI Content Engine for targeted revision if severity is HIGH
  if (analysis.insight?.action === "TRIGGER_REVISION") {
    // We would queue a revision mission for this student here
    console.log(`[AssessmentEngine] Triggering targeted revision for SP: ${question.spCode}`);
  }

  return analysis;
};
