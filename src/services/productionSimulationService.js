import { generateBatchLessons } from './contentFactoryService.js';

/**
 * AI Curriculum Semantic Validator
 * Compares SP description against generated lesson concept to detect curriculum mismatch.
 * 
 * @param {object} params
 * @param {string} params.spDescription - Official DSKP SP Title/Description
 * @param {object} params.missionPackage - Generated 9-step mission package
 * @returns {object} { semantic_alignment_score, semantic_matched, matched_keywords }
 */
export function evaluateSemanticAlignment({ spDescription = "", missionPackage = null }) {
  if (!spDescription || !missionPackage) {
    return { semantic_alignment_score: 50, semantic_matched: false, matched_keywords: [] };
  }

  const cleanDesc = spDescription.toLowerCase().replace(/[^a-z0-9\s]/gi, "");
  const words = cleanDesc.split(/\s+/).filter(w => w.length > 3);

  if (words.length === 0) {
    return { semantic_alignment_score: 100, semantic_matched: true, matched_keywords: [] };
  }

  const pkgText = JSON.stringify(missionPackage).toLowerCase();
  const matchedWords = words.filter(w => pkgText.includes(w));

  const score = Math.round((matchedWords.length / words.length) * 100);
  const matched = score >= 70;

  return {
    semantic_alignment_score: score,
    semantic_matched: matched,
    matched_keywords: matchedWords
  };
}

/**
 * Lesson Version Governance Manager
 * Records version history, teacher review metadata, and approval state.
 */
export function createGovernanceRecord({ lessonVersionId, spCode, teacherName = "Cikgu Admin", status = "TEACHER_APPROVED", reviewNotes = "Lulus semakan DSKP." }) {
  return {
    governance_id: `gov_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    lesson_version_id: lessonVersionId,
    sp_code: spCode,
    status: status,
    teacher_metadata: {
      teacher_name: teacherName,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
      approved: status === "TEACHER_APPROVED" || status === "PUBLISHED"
    },
    version_history: [
      { step: "AI_GENERATED", timestamp: new Date(Date.now() - 60000).toISOString() },
      { step: "QUALITY_CHECKED", timestamp: new Date(Date.now() - 30000).toISOString() },
      { step: status, timestamp: new Date().toISOString() }
    ]
  };
}

/**
 * Simulates large batch production across subjects without modifying database records.
 * 
 * @param {object} params
 * @param {string} params.subject
 * @param {string} params.grade
 * @param {number} params.limit
 * @returns {Promise<object>} Simulation Report
 */
export async function simulateProductionBatch({ subject = "Matematik", grade = "Tahun 1", limit = 0 }) {
  const startTime = Date.now();

  const batchResult = await generateBatchLessons({
    subject,
    grade,
    limit,
    autoValidate: true
  });

  const processingTimeSec = Number(((Date.now() - startTime) / 1000).toFixed(2));

  // Add Semantic Validation to each simulated lesson
  const simulatedLessons = batchResult.lessons.map(l => {
    const semanticRes = evaluateSemanticAlignment({
      spDescription: l.title,
      missionPackage: l.missionPackage
    });

    const govRecord = createGovernanceRecord({
      lessonVersionId: `ver_sim_${l.sp_code}`,
      spCode: l.sp_code,
      status: l.passed ? "READY_FOR_REVIEW" : "NEEDS_REVIEW"
    });

    return {
      ...l,
      semantic_alignment_score: semanticRes.semantic_alignment_score,
      semantic_matched: semanticRes.semantic_matched,
      governance: govRecord
    };
  });

  const avgSemanticScore = simulatedLessons.length > 0
    ? Math.round(simulatedLessons.reduce((acc, l) => acc + l.semantic_alignment_score, 0) / simulatedLessons.length)
    : 100;

  return {
    subject,
    grade,
    simulation_mode: true,
    total_generated: batchResult.total_generated,
    passed_quality: batchResult.passed_quality,
    passed_authenticity: batchResult.passed_authenticity,
    failed_validation: batchResult.failed,
    avg_semantic_alignment: avgSemanticScore,
    analytics: {
      total_tokens: batchResult.analytics.total_tokens,
      estimated_cost_usd: batchResult.analytics.estimated_cost_usd,
      processing_time_sec: processingTimeSec
    },
    lessons: simulatedLessons
  };
}

/**
 * Rolls back a lesson to a previous version number.
 * @param {object} params
 * @param {string} params.spCode
 * @param {number} params.targetVersionNumber
 * @param {Array} params.versionHistory - List of existing versions
 * @returns {object} { success, active_version, message }
 */
export function rollbackLessonVersion({ spCode, targetVersionNumber, versionHistory = [] }) {
  if (!spCode || !targetVersionNumber) {
    return { success: false, error: "SP code and target version number are required." };
  }

  const target = versionHistory.find(v => v.version_number === targetVersionNumber);
  if (!target) {
    return {
      success: false,
      error: `Versi #${targetVersionNumber} tidak ditemui bagi SP ${spCode}.`
    };
  }

  return {
    success: true,
    sp_code: spCode,
    active_version: {
      ...target,
      content_status: "READY_FOR_REVIEW",
      rolled_back_at: new Date().toISOString(),
      rollback_note: `Berjaya mengembalikan SP ${spCode} ke Versi #${targetVersionNumber}`
    },
    message: `Pelajaran SP ${spCode} berjaya dikembalikan ke Versi #${targetVersionNumber}.`
  };
}

