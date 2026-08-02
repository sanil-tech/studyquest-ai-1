import kssrTaxonomy from '../data/kssrTaxonomy.json';
import kssmTaxonomy from '../data/kssmTaxonomy.json';

const getCombinedTaxonomy = () => {
  return [kssrTaxonomy, kssmTaxonomy];
};

/**
 * Helper to find an SP code detail object across all frameworks and subjects.
 * @param {string} spCode 
 * @returns {Object|null}
 */
export const getSPDetails = (spCode) => {
  const taxonomies = getCombinedTaxonomy();
  for (const taxonomy of taxonomies) {
    for (const subjectKey of Object.keys(taxonomy.subjects)) {
      const subjectLevels = taxonomy.subjects[subjectKey];
      for (const levelKey of Object.keys(subjectLevels)) {
        const standardList = subjectLevels[levelKey];
        const found = standardList.find(sp => sp.sp_code === spCode);
        if (found) {
          return {
            ...found,
            framework: taxonomy.framework,
            subject: subjectKey,
            grade: levelKey
          };
        }
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
  const taxonomies = getCombinedTaxonomy();
  const targetFramework = taxonomies.find(t => t.framework === framework);
  
  if (!targetFramework) return [];
  if (!targetFramework.subjects[subjectId]) return [];
  if (!targetFramework.subjects[subjectId][grade]) return [];
  
  return targetFramework.subjects[subjectId][grade];
};
