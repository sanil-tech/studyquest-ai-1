import { aiTutorRules as tutorRules } from '../data/domainRules.js';
import { getStudent } from './database/studentRepository';
import { getSPDetails } from './taxonomyService';

/**
 * AI Tutor Engine
 * 
 * Provides contextual, progressive hints and explanations without giving away the answer.
 * Integrated directly with the Assessment Engine to detect specific misconceptions.
 */

export const initializeTutorContext = async (studentId, spCode) => {
  const student = await getStudent(studentId);
  const spDetails = getSPDetails(spCode);
  
  return {
    studentProfile: {
      id: studentId,
      yearLevel: student?.year_level || 'Tahun 1',
    },
    currentSkill: {
      spCode: spCode,
      title: spDetails?.title || 'Kemahiran'
    }
  };
};

export const generateHint = (context, attemptCount, category = "GENERIC") => {
  const hintCategory = tutorRules.hints[category] || tutorRules.hints.GENERIC;
  
  if (attemptCount === 1) return hintCategory.level1;
  if (attemptCount === 2) return hintCategory.level2;
  return hintCategory.level3;
};

export const explainConcept = (context, concept, visualObject = "blok LEGO") => {
  const yearLevel = context.studentProfile.yearLevel;
  const template = tutorRules.explanations[yearLevel] || tutorRules.explanations["Tahun 1"];
  
  return template
    .replace('{concept}', concept)
    .replace('{visualObject}', visualObject);
};

export const respondToMistake = (mistakeType) => {
  if (!mistakeType || mistakeType === "UNKNOWN") return null;
  return tutorRules.misconceptions[mistakeType] || null;
};

export const generateEncouragement = (resultType) => {
  // resultType: SUCCESS, STRUGGLE, MULTIPLE_FAILURES
  const options = tutorRules.encouragements[resultType] || tutorRules.encouragements.STRUGGLE;
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};
