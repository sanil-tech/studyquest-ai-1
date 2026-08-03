import kssrTaxonomy from '../data/kssrTaxonomy.json' with { type: "json" };
import { generateKSSRMissionPackage } from './aiContentEngine.js';
import { validateLessonQuality, validateAIContentAuthenticity } from './contentQualityService.js';

/**
 * StudyQuest Content LifeCycle Status Constants
 */
export const CONTENT_STATUS = {
  DRAFT: "DRAFT",
  AI_GENERATED: "AI_GENERATED",
  QUALITY_CHECKED: "QUALITY_CHECKED",
  AUTHENTICITY_PASSED: "AUTHENTICITY_PASSED",
  READY_FOR_REVIEW: "READY_FOR_REVIEW",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  PUBLISHED: "PUBLISHED"
};

/**
 * Executes a controlled batch production pipeline for an entire subject & grade framework.
 * 
 * @param {object} params
 * @param {string} params.subject - e.g. "Matematik"
 * @param {string} params.grade - e.g. "Tahun 1"
 * @param {number} params.limit - Max items to process (0 = all items)
 * @param {boolean} params.autoValidate - Execute quality & authenticity gates
 * @param {function} params.onProgress - Progress callback function (item, index, total)
 * @returns {Promise<object>} Batch Production Report
 */
export async function generateBatchLessons({
  subject = "Matematik",
  grade = "Tahun 1",
  limit = 0,
  autoValidate = true,
  onProgress = null
}) {
  const taxonomySubject = kssrTaxonomy.subjects?.[subject];
  const spItems = taxonomySubject?.[grade] || [];

  if (!Array.isArray(spItems) || spItems.length === 0) {
    return {
      total_generated: 0,
      passed_quality: 0,
      passed_authenticity: 0,
      failed: 0,
      error: `Tiada data SP KSSR ditemui bagi subjek ${subject} (${grade}).`,
      lessons: []
    };
  }

  const itemsToProcess = limit > 0 ? spItems.slice(0, limit) : spItems;
  const lessons = [];

  for (let idx = 0; idx < itemsToProcess.length; idx++) {
    const item = itemsToProcess[idx];

    // 1. Invoke AI Content Engine
    const genResult = await generateKSSRMissionPackage({
      spCode: item.sp_code,
      skCode: item.sk_code,
      grade: grade,
      subject: subject,
      bidang: item.bidang || "Nombor dan Operasi",
      topic: item.topic || "Nombor hingga 100",
      spDescription: item.title,
      learningOutcome: item.title,
      pbdTarget: "TP3"
    });

    const missionPackage = genResult.missionPackage;

    // 2. Execute Quality & Authenticity Gates
    let qualityReport = { overall: { score: 100, approved: true }, checks: { alignment: { notes: [] } } };
    let authReport = { authenticity_score: 100, passed: true, issues: [] };

    if (autoValidate) {
      const lessonObj = {
        title: item.title,
        learning_objective: item.title,
        content_blocks: missionPackage.steps
      };

      qualityReport = await validateLessonQuality(lessonObj, true);

      authReport = validateAIContentAuthenticity({
        subject,
        grade,
        topic: item.topic || "Nombor hingga 100",
        skCode: item.sk_code,
        spCode: item.sp_code,
        spDescription: item.title,
        missionPackage
      });
    }

    const qualityPassed = qualityReport.overall.score >= 80;
    const authenticityPassed = authReport.passed && authReport.authenticity_score >= 85;
    const isFullyApproved = qualityPassed && authenticityPassed;

    const content_status = isFullyApproved
      ? CONTENT_STATUS.READY_FOR_REVIEW
      : CONTENT_STATUS.NEEDS_REVIEW;

    const lessonRecord = {
      sp_code: item.sp_code,
      sk_code: item.sk_code,
      topic: item.topic,
      bidang: item.bidang,
      title: item.title,
      content_status,
      quality_score: qualityReport.overall.score,
      authenticity_score: authReport.authenticity_score,
      quality_passed: qualityPassed,
      authenticity_passed: authenticityPassed,
      passed: isFullyApproved,
      issues: [
        ...(qualityReport.checks?.alignment?.notes || []),
        ...(authReport.issues || [])
      ],
      generated_at: new Date().toISOString(),
      generated_by: "StudyQuest AI",
      missionPackage
    };

    lessons.push(lessonRecord);

    if (typeof onProgress === "function") {
      onProgress(lessonRecord, idx + 1, itemsToProcess.length);
    }
  }

  const passedQualityCount = lessons.filter(l => l.quality_passed).length;
  const passedAuthenticityCount = lessons.filter(l => l.authenticity_passed).length;
  const totalPassed = lessons.filter(l => l.passed).length;
  const totalFailed = lessons.length - totalPassed;

  return {
    total_generated: lessons.length,
    passed_quality: passedQualityCount,
    passed_authenticity: passedAuthenticityCount,
    passed_all: totalPassed,
    failed: totalFailed,
    lessons
  };
}
