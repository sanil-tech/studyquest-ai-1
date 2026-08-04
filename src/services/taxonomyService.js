import { getTaxonomySubjects, getTaxonomyYears, getSPEntries } from './dskpRegistry.js';

/**
 * Helper to find an SP code detail object across all subjects and grades in DSKP Registry.
 * @param {string} spCode 
 * @returns {Object|null}
 */
export const getSPDetails = (spCode) => {
  const subjects = getTaxonomySubjects();
  for (const subjectKey of subjects) {
    const years = getTaxonomyYears(subjectKey);
    for (const levelKey of years) {
      const standardList = getSPEntries(subjectKey, levelKey);
      const found = standardList.find(sp => sp.sp_code === spCode);
      if (found) {
        return {
          ...found,
          framework: "KSSR_SEMAKAN",
          subject: subjectKey,
          grade: levelKey
        };
      }
    }
  }
  return null;
};

/**
 * Returns an array of prerequisite SP codes for a given SP code.
 * @param {string} spCode 
 * @returns {string[]}
 */
export const getPrerequisites = (spCode) => {
  const details = getSPDetails(spCode);
  return details ? details.prerequisites || [] : [];
};

/**
 * Returns the recommended widget type for a given SP code.
 * @param {string} spCode 
 * @returns {string|null}
 */
export const getWidgetMapping = (spCode) => {
  const details = getSPDetails(spCode);
  return details ? details.default_widget_type || null : null;
};

/**
 * Returns all SP entries for a specific framework, grade level, and subject.
 * @param {string} framework "KSSR_SEMAKAN" or "KSSM"
 * @param {string} grade e.g., "Tahun 1" or "Tingkatan 1"
 * @param {string} subjectId e.g., "Matematik"
 * @returns {Object[]}
 */
export const getSPCatalogByGrade = (framework, grade, subjectId) => {
  return getSPEntries(subjectId, grade);
};
