import templates from '../data/resourceTemplates.json';
import { generateLessonForSP } from './aiContentEngine';

/**
 * Resource Library Service
 * 
 * Provides UI-independent, deterministic access to all learning resources 
 * tied to a specific Standard Pembelajaran (SP) code.
 * Sits securely between the KSSR/KSSM Taxonomy and the Mastery/Assessment Engines.
 */

const resourceLibrary = templates.resources;

/**
 * Core Lookup: Retrieves the complete resource mapping for a given SP.
 * @param {string} spCode 
 * @returns {Object|null}
 */
export const getResourceBySP = (spCode) => {
  return resourceLibrary.find(r => r.sp_code === spCode) || null;
};

// ==========================================
// INDIVIDUAL RESOURCE GETTERS
// ==========================================

export const getLessonContent = async (spCode, studentName) => {
  // If we had real static database lessons, we'd fetch them here.
  // For the AI Content Engine phase, we'll auto-generate content for ALL spCodes
  // to ensure 100% curriculum coverage.
  return await generateLessonForSP(spCode, studentName);
};

export const getLessons = (spCode) => getResourceBySP(spCode)?.lesson_ids || [];
export const getLessonVersions = (spCode) => getResourceBySP(spCode)?.lesson_version_ids || [];
export const getLessonBlocks = (spCode) => getResourceBySP(spCode)?.lesson_block_ids || [];
export const getAssessments = (spCode) => getResourceBySP(spCode)?.assessment_ids || [];
export const getQuizzes = (spCode) => getResourceBySP(spCode)?.quiz_ids || [];
export const getWidgets = (spCode) => getResourceBySP(spCode)?.widget_ids || [];
export const getRevision = (spCode) => getResourceBySP(spCode)?.revision_ids || [];
export const getVideos = (spCode) => getResourceBySP(spCode)?.video_ids || [];
export const getAudio = (spCode) => getResourceBySP(spCode)?.audio_ids || [];
export const getVocabulary = (spCode) => getResourceBySP(spCode)?.vocabulary_ids || [];
export const getHints = (spCode) => getResourceBySP(spCode)?.hint_ids || [];

// ==========================================
// METADATA & PEDAGOGY GETTERS
// ==========================================

export const getObjectives = (spCode) => getResourceBySP(spCode)?.learning_objectives || [];
export const getSuccessCriteria = (spCode) => getResourceBySP(spCode)?.success_criteria || [];
export const getMasteryThreshold = (spCode) => getResourceBySP(spCode)?.mastery_threshold || 80;
export const getPrerequisites = (spCode) => getResourceBySP(spCode)?.prerequisites || [];
export const getRecommendedNext = (spCode) => getResourceBySP(spCode)?.recommended_next || [];
export const getRecommendedRevision = (spCode) => getResourceBySP(spCode)?.recommended_revision || [];

// ==========================================
// SEARCH & FILTER UTILITIES
// ==========================================

/**
 * Global search across SP titles, descriptions, and learning objectives.
 * @param {string} keyword 
 * @returns {Object[]}
 */
export const searchResources = (keyword) => {
  const kw = keyword.toLowerCase();
  return resourceLibrary.filter(r => 
    r.sp_code.toLowerCase().includes(kw) ||
    r.title.toLowerCase().includes(kw) ||
    r.description.toLowerCase().includes(kw) ||
    r.learning_objectives.some(obj => obj.toLowerCase().includes(kw))
  );
};

export const getResourcesBySubject = (subject) => {
  return resourceLibrary.filter(r => r.subject === subject);
};

export const getResourcesByYear = (grade) => {
  return resourceLibrary.filter(r => r.grade === grade);
};

export const getResourcesByBloomLevel = (level) => {
  return resourceLibrary.filter(r => r.bloom_level === level.toUpperCase());
};
