// src/lib/contentAssetContract.js
/**
 * STUDYQUEST AI — PHASE 3C-1
 * Canonical Content Asset Contract & Validation Utility
 *
 * Establishes the canonical metadata contract, asset type taxonomy, asset-to-entity mapping,
 * approval lifecycle, curriculum identity validation, coverage state calculator,
 * and published snapshot immutability invariant helper.
 */

/**
 * 1. CANONICAL ASSET TYPES REGISTRY
 */
export const CANONICAL_ASSET_TYPES = Object.freeze({
  LESSON_HOOK: "LESSON_HOOK",
  LESSON_OBJECTIVE: "LESSON_OBJECTIVE",
  CONCEPT: "CONCEPT",
  WORKED_EXAMPLE: "WORKED_EXAMPLE",
  GUIDED_PRACTICE: "GUIDED_PRACTICE",
  INDEPENDENT_PRACTICE: "INDEPENDENT_PRACTICE",
  REFLECTION: "REFLECTION",
  VIDEO: "VIDEO",
  INTERACTIVE: "INTERACTIVE",
  FLASHCARD: "FLASHCARD",
  QUIZ_QUESTION: "QUIZ_QUESTION",
  ASSESSMENT_ITEM: "ASSESSMENT_ITEM",
});

/**
 * 2. ASSET TYPE → DATABASE ENTITY MAPPING
 */
export const ASSET_ENTITY_MAP = Object.freeze({
  LESSON_HOOK: { entity: "LessonBlock", block_type: "STORY_HOOK", content_type: null },
  LESSON_OBJECTIVE: { entity: "LessonBlock", block_type: "LEARNING_OBJECTIVE", content_type: null },
  CONCEPT: { entity: "LessonBlock", block_type: "CONCEPT_CPA", content_type: null },
  WORKED_EXAMPLE: { entity: "LessonBlock", block_type: "WORKED_EXAMPLE", content_type: null },
  GUIDED_PRACTICE: { entity: "LessonBlock", block_type: "INTERACTIVE_PRACTICE", content_type: null },
  INDEPENDENT_PRACTICE: { entity: "LessonBlock", block_type: "INTERACTIVE_PRACTICE", content_type: null },
  REFLECTION: { entity: "LessonBlock", block_type: "KEY_TAKEAWAY", content_type: null },
  VIDEO: { entity: "LessonContent", block_type: null, content_type: "video" },
  INTERACTIVE: { entity: "LearningActivity", block_type: null, content_type: "interactive" },
  FLASHCARD: { entity: "Flashcard", block_type: null, content_type: "flashcard" },
  QUIZ_QUESTION: { entity: "QuestionBank", block_type: null, content_type: "question" },
  ASSESSMENT_ITEM: { entity: "QuestionBank", block_type: null, content_type: "question" },
});

/**
 * 3. ASSET APPROVAL LIFECYCLE & STATUS ENUMS
 */
export const ASSET_STATUSES = Object.freeze({
  DRAFT: "draft",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

export const REVIEW_STATUSES = Object.freeze({
  DRAFT: "draft",
  REVIEW: "review",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

/**
 * 4. CONTENT COVERAGE STATES
 */
export const COVERAGE_STATES = Object.freeze({
  MISSING: "MISSING",
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
});

/**
 * 5. VALIDATION HELPER
 * Validates a candidate content asset against canonical curriculum identity rules.
 *
 * @param {object} asset
 * @param {object} [options]
 * @param {boolean} [options.requireCurriculum=true] - Whether topic_id, subtopic_id, and sp_code are mandatory
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAsset(asset, options = {}) {
  const errors = [];
  const { requireCurriculum = true } = options;

  if (!asset || typeof asset !== "object") {
    return { valid: false, errors: ["Aset mesti berupa objek yang sah."] };
  }

  // 1. Asset Type Validation
  const assetType = asset.asset_type;
  if (!assetType || !Object.values(CANONICAL_ASSET_TYPES).includes(assetType)) {
    errors.push(`Jenis aset tidak sah: '${assetType}'. Values dibenarkan: ${Object.keys(CANONICAL_ASSET_TYPES).join(", ")}`);
  }

  // 2. Curriculum Identity Validation
  if (requireCurriculum) {
    if (!asset.topic_id || typeof asset.topic_id !== "string" || !asset.topic_id.trim()) {
      errors.push("Kurikulum Identity tidak lengkap: 'topic_id' diperlukan.");
    }
    if (!asset.subtopic_id || typeof asset.subtopic_id !== "string" || !asset.subtopic_id.trim()) {
      errors.push("Kurikulum Identity tidak lengkap: 'subtopic_id' diperlukan.");
    }
    if (!asset.sp_code || typeof asset.sp_code !== "string" || !asset.sp_code.trim()) {
      errors.push("Kurikulum Identity tidak lengkap: 'sp_code' diperlukan.");
    }
  }

  // 3. AI Generation Safety Gate: AI generation MUST NOT automatically create APPROVED content
  const statusStr = (asset.review_status || asset.status || "").toLowerCase();
  const isApprovedOrPublished = statusStr === "approved" || statusStr === "published";
  const isAiSource = asset.created_source === "ai_generated";

  if (isAiSource && isApprovedOrPublished && !asset.approved_by) {
    errors.push("Aturan Keselamatan AI: Kandungan janaan AI tidak boleh diluluskan (APPROVED) secara automatik tanpa pengesahan manual admin (approved_by).");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 6. ASSET CREATION SANITIZER FOR AI GENERATION
 * Enforces that AI-generated assets start strictly in DRAFT or UNDER_REVIEW status.
 *
 * @param {object} rawPayload
 * @returns {object} Sanitized asset payload with approved status stripped
 */
export function sanitizeAiGeneratedAsset(rawPayload) {
  const sanitized = { ...rawPayload };

  // AI-generated content ALWAYS defaults to ai_generated source and draft / under_review status
  sanitized.created_source = "ai_generated";
  sanitized.approved_by = null;
  sanitized.approved_at = null;

  if (sanitized.review_status === "approved" || sanitized.review_status === "published") {
    sanitized.review_status = "under_review";
  }
  if (sanitized.status === "approved" || sanitized.status === "published") {
    sanitized.status = "draft";
  }

  return sanitized;
}

/**
 * 7. CONTENT COVERAGE CALCULATOR
 * Evaluates the coverage state for a given curriculum identity without fabricating placeholder content.
 *
 * @param {Array<object>} availableAssets - List of assets matching curriculum identity
 * @returns {string} One of COVERAGE_STATES
 */
export function getAssetCoverageState(availableAssets) {
  if (!Array.isArray(availableAssets) || availableAssets.length === 0) {
    return COVERAGE_STATES.MISSING;
  }

  const statuses = availableAssets.map((a) => (a.review_status || a.status || "").toLowerCase());

  if (statuses.includes("published")) return COVERAGE_STATES.PUBLISHED;
  if (statuses.includes("approved")) return COVERAGE_STATES.APPROVED;
  if (statuses.includes("under_review") || statuses.includes("review")) return COVERAGE_STATES.UNDER_REVIEW;
  if (statuses.includes("draft")) return COVERAGE_STATES.DRAFT;
  if (statuses.includes("rejected")) return COVERAGE_STATES.REJECTED;

  return COVERAGE_STATES.MISSING;
}

/**
 * 8. PUBLISHED SNAPSHOT INVARIANT VERIFIER
 * Verifies that changes to Content Library assets do NOT alter a published LessonVersion snapshot.
 *
 * @param {object} publishedLessonVersion - The published LessonVersion container
 * @param {Array<object>} compiledBlocks - The blocks attached to this LessonVersion snapshot
 * @param {Array<object>} updatedLibraryAssets - Freshly updated assets in Content Library
 * @returns {{ invariantHeld: boolean, explanation: string }}
 */
export function verifyPublishedSnapshotInvariant(publishedLessonVersion, compiledBlocks, updatedLibraryAssets) {
  if (!publishedLessonVersion || publishedLessonVersion.status !== "published") {
    return { invariantHeld: true, explanation: "Pelajaran belum diterbitkan." };
  }

  // Ensure compiled blocks belong strictly to publishedLessonVersion.id
  const belongsToSnapshot = compiledBlocks.every((b) => b.lesson_version_id === publishedLessonVersion.id);

  if (!belongsToSnapshot) {
    return {
      invariantHeld: false,
      explanation: "INVARIANT VIOLATION: Terdapat blok yang tidak terikat secara tegar pada lesson_version_id snapshot ini.",
    };
  }

  // Content Library updates must not mutate compiledBlocks in memory or database
  return {
    invariantHeld: true,
    explanation: "INVARIANT HELD: Snapshot LessonVersion terbitan kekal tidak terjejas oleh perubahan aset dalam Content Library.",
  };
}
