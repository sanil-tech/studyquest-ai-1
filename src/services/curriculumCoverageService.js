import { getSPEntries } from './dskpRegistry.js';

/**
 * Calculates curriculum coverage by subject and grade.
 * @param {string} subject
 * @param {string} grade
 * @param {Array} publishedLessons - Array of published lesson objects from DB
 * @returns {object}
 */
export function getCurriculumCoverageStats(subject = "Matematik", grade = "Tahun 1", publishedLessons = []) {
  const spItems = getSPEntries(subject, grade);
  const totalSP = spItems.length;

  if (totalSP === 0) {
    return {
      subject,
      grade,
      total_sp: 0,
      generated: 0,
      reviewed: 0,
      published: 0,
      coverage_percentage: 0,
      missing_sps: []
    };
  }

  const publishedSPSet = new Set(publishedLessons.map(l => l.sp_code));

  const publishedCount = spItems.filter(item => publishedSPSet.has(item.sp_code)).length;
  const missingSPs = spItems.filter(item => !publishedSPSet.has(item.sp_code));

  return {
    subject,
    grade,
    total_sp: totalSP,
    generated: publishedCount,
    reviewed: publishedCount,
    published: publishedCount,
    coverage_percentage: Math.round((publishedCount / totalSP) * 100),
    missing_sps: missingSPs.map(m => ({ sp_code: m.sp_code, topic: m.topic, title: m.title }))
  };
}

/**
 * Generates global coverage overview across all 4 subjects and 6 grades.
 */
export function getGlobalCurriculumCoverage(publishedLessons = []) {
  const subjects = ["Matematik", "Sains", "Bahasa Melayu", "English"];
  const grades = ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];

  const summary = {};
  let globalTotalSP = 0;
  let globalPublishedSP = 0;

  subjects.forEach(subj => {
    summary[subj] = {};
    grades.forEach(grd => {
      const stats = getCurriculumCoverageStats(subj, grd, publishedLessons);
      summary[subj][grd] = stats;
      globalTotalSP += stats.total_sp;
      globalPublishedSP += stats.published;
    });
  });

  return {
    global_total_sp: globalTotalSP,
    global_published_sp: globalPublishedSP,
    global_coverage_percentage: globalTotalSP > 0 ? Math.round((globalPublishedSP / globalTotalSP) * 100) : 0,
    by_subject: summary
  };
}
