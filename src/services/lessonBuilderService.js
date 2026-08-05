// src/services/lessonBuilderService.js
//
// Bridges the old LessonResources (flat Quiz entity) to the current
// LessonVersion / LessonContent / QuestionBank architecture.
//
// Key contracts
// ─────────────────────────────────────────────────────────────────────────────
// LessonVersion  { id, lesson_id, version_number, status, video_url, … }
// LessonContent  { id, lesson_version_id, content_type, title,
//                  content_markdown, image_url, sort_order, status }
// QuestionBank   { id, lesson_id, lesson_version_id, question, correct_answer,
//                  options_json, explanation, difficulty, … }
//
// Legacy Quiz (flat)  { id, topic_name, subject_name, video_url,
//                       notes_content, infographic_url,
//                       questions_json, subtopics_json }
// ─────────────────────────────────────────────────────────────────────────────

import { base44 } from "@/api/base44Client";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Parse a field that may already be an object or a JSON string. */
function safeParse(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** Validate & sanitise an image/video URL to prevent XSS. */
function safeUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : null;
}

// ─── LOAD ────────────────────────────────────────────────────────────────────

/**
 * Returns a list of { id, label } items for the version picker.
 * Strategy:
 *   1. Try LessonVersion.filter({ lesson_id }) – the new architecture.
 *   2. Fall back to Quiz.filter({}) – legacy flat entities.
 */
export async function listLessonVersions() {
  // ── New architecture: list all LessonVersion records ──────────────────────
  try {
    const versions = await base44.entities.LessonVersion.filter({});
    if (Array.isArray(versions) && versions.length > 0) {
      return versions.map((v) => ({
        id: v.id,
        label: v.lesson_id
          ? `v${v.version_number ?? 1} — ${v.lesson_id}`
          : `v${v.version_number ?? 1} (ID: ${v.id})`,
        source: "LessonVersion",
        raw: v,
      }));
    }
  } catch (_) {
    // intentional fall-through
  }

  // ── Legacy fallback: list Quiz entities ───────────────────────────────────
  try {
    const quizzes = await base44.entities.Quiz.filter({});
    if (Array.isArray(quizzes)) {
      return quizzes.map((q) => ({
        id: q.id,
        label: `${q.topic_name || q.id} (legacy)`,
        source: "Quiz",
        raw: q,
      }));
    }
  } catch (_) {
    // intentional fall-through
  }

  return [];
}

/**
 * Loads a single lesson's full content into a normalised UI state object.
 *
 * Normalised shape returned:
 * {
 *   lessonVersionId,   // string
 *   source,           // "LessonVersion" | "Quiz"
 *   topicId,
 *   title,
 *   subtitle,
 *   youtubeUrl,
 *   notes,
 *   noteImageUrl,
 *   infographicUrl,
 *   subtopics,        // string[]
 *   questions,        // UIQuestion[]
 * }
 */
export async function loadLessonContent(itemId, source) {
  if (source === "LessonVersion") {
    return _loadFromLessonVersion(itemId);
  }
  // Legacy Quiz path
  return _loadFromQuiz(itemId);
}

async function _loadFromLessonVersion(lessonVersionId) {
  const lv = await base44.entities.LessonVersion.get(lessonVersionId);

  // Load associated LessonContent blocks
  let contentBlocks = [];
  try {
    contentBlocks =
      (await base44.entities.LessonContent.filter({
        lesson_version_id: lessonVersionId,
      })) || [];
  } catch (_) {}

  // Load QuestionBank items for this version
  let questionBankItems = [];
  try {
    questionBankItems =
      (await base44.entities.QuestionBank.filter({
        lesson_version_id: lessonVersionId,
      })) || [];
  } catch (_) {}

  // Map LessonContent blocks to flat UI fields
  const notesBlock = contentBlocks.find((b) => b.content_type === "notes");
  const infographicBlock = contentBlocks.find(
    (b) => b.content_type === "infographic"
  );
  const subtopicsBlock = contentBlocks.find(
    (b) => b.content_type === "subtopics"
  );

  let notes = "";
  let noteImageUrl = "";
  if (notesBlock) {
    const parsed = safeParse(notesBlock.content_markdown, null);
    if (parsed && typeof parsed === "object") {
      notes = parsed.text || notesBlock.content_markdown || "";
      noteImageUrl = safeUrl(parsed.image) || safeUrl(notesBlock.image_url) || "";
    } else {
      notes = notesBlock.content_markdown || "";
      noteImageUrl = safeUrl(notesBlock.image_url) || "";
    }
  }

  const infographicUrl = safeUrl(infographicBlock?.image_url) || "";
  const subtopics = subtopicsBlock
    ? safeParse(subtopicsBlock.content_markdown, [])
    : [];

  // Map QuestionBank → UIQuestion[]
  const questions =
    questionBankItems.length > 0
      ? questionBankItems.map(_bankItemToUIQuestion)
      : [_emptyQuestion()];

  return {
    lessonVersionId,
    source: "LessonVersion",
    topicId: lv.lesson_id || "",
    title: lv.topic_name || "",
    subtitle: lv.subject_name || "",
    youtubeUrl: safeUrl(lv.video_url) || "",
    notes,
    noteImageUrl,
    infographicUrl,
    subtopics: Array.isArray(subtopics) ? subtopics : [],
    questions,
  };
}

async function _loadFromQuiz(quizId) {
  const q = await base44.entities.Quiz.get(quizId);

  const rawNotes = q.notes_content || "";
  let notes = "";
  let noteImageUrl = "";

  if (rawNotes) {
    const parsed = safeParse(
      String(rawNotes).replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
      null
    );
    if (parsed && (parsed.text !== undefined || parsed.image !== undefined)) {
      notes = parsed.text || "";
      noteImageUrl = safeUrl(parsed.image) || "";
    } else {
      notes = String(rawNotes);
    }
  }

  const parsedQ = safeParse(q.questions_json, []);
  const questions =
    Array.isArray(parsedQ) && parsedQ.length > 0
      ? parsedQ.map(_quizQuestionToUIQuestion)
      : [_emptyQuestion()];

  const subtopics = safeParse(q.subtopics_json, []);

  return {
    lessonVersionId: quizId,
    source: "Quiz",
    topicId: q.id,
    title: q.topic_name || "",
    subtitle: q.subject_name || "",
    youtubeUrl: safeUrl(q.video_url) || "",
    notes,
    noteImageUrl,
    infographicUrl: safeUrl(q.infographic_url) || "",
    subtopics: Array.isArray(subtopics) ? subtopics : [],
    questions,
  };
}

// ─── SAVE ────────────────────────────────────────────────────────────────────

/**
 * Persists the builder UI state.
 *
 * For LessonVersion source:
 *   • Update LessonVersion (video_url, topic_name, subject_name)
 *   • Upsert LessonContent blocks (notes, infographic, subtopics)
 *   • Replace QuestionBank items for this version
 *
 * For Quiz (legacy) source on EDIT:
 *   • Update Quiz entity using the original flat schema (no data loss)
 *
 * For Quiz (legacy) source on CREATE:
 *   • Create a new Quiz entity (preserves legacy behaviour for now)
 */
export async function saveLessonContent({
  mode, // "create" | "edit"
  source, // "LessonVersion" | "Quiz"
  lessonVersionId,
  topicId,
  title,
  subtitle,
  youtubeUrl,
  notes,
  noteImageUrl,
  infographicUrl,
  subtopics,
  questions, // UIQuestion[]
}) {
  if (source === "LessonVersion" && mode === "edit") {
    return _saveToLessonVersion({
      lessonVersionId,
      title,
      subtitle,
      youtubeUrl,
      notes,
      noteImageUrl,
      infographicUrl,
      subtopics,
      questions,
    });
  }

  // Legacy path (Quiz entity) – covers both create and edit of old records
  return _saveToQuiz({
    mode,
    lessonVersionId,
    topicId,
    title,
    subtitle,
    youtubeUrl,
    notes,
    noteImageUrl,
    infographicUrl,
    subtopics,
    questions,
  });
}

async function _saveToLessonVersion({
  lessonVersionId,
  title,
  subtitle,
  youtubeUrl,
  notes,
  noteImageUrl,
  infographicUrl,
  subtopics,
  questions,
}) {
  // 1. Update LessonVersion metadata
  await base44.entities.LessonVersion.update(lessonVersionId, {
    topic_name: title.trim(),
    subject_name: subtitle.trim() || "Matematik",
    video_url: safeUrl(youtubeUrl) || youtubeUrl.trim(),
  });

  // 2. Load existing content blocks to upsert
  let existingBlocks = [];
  try {
    existingBlocks =
      (await base44.entities.LessonContent.filter({
        lesson_version_id: lessonVersionId,
      })) || [];
  } catch (_) {}

  const findBlock = (type) =>
    existingBlocks.find((b) => b.content_type === type);

  const upsertBlock = async (contentType, data) => {
    const existing = findBlock(contentType);
    if (existing) {
      await base44.entities.LessonContent.update(existing.id, data);
    } else {
      await base44.entities.LessonContent.create({
        lesson_version_id: lessonVersionId,
        content_type: contentType,
        status: "draft",
        ...data,
      });
    }
  };

  // 3. Upsert Notes block
  await upsertBlock("notes", {
    title: "Nota Pelajaran",
    content_markdown: JSON.stringify({
      text: notes.trim(),
      image: safeUrl(noteImageUrl) || null,
    }),
    image_url: safeUrl(noteImageUrl) || null,
    sort_order: 0,
  });

  // 4. Upsert Infographic block
  if (infographicUrl) {
    await upsertBlock("infographic", {
      title: "Peta Minda",
      content_markdown: "",
      image_url: safeUrl(infographicUrl),
      sort_order: 4,
    });
  }

  // 5. Upsert Subtopics block
  if (subtopics.length > 0) {
    await upsertBlock("subtopics", {
      title: "Subtopik",
      content_markdown: JSON.stringify(subtopics),
      sort_order: 1,
    });
  }

  // 6. Replace QuestionBank items for this version
  //    – delete existing, then bulk-create new ones
  let existingQBItems = [];
  try {
    existingQBItems =
      (await base44.entities.QuestionBank.filter({
        lesson_version_id: lessonVersionId,
      })) || [];
  } catch (_) {}

  await Promise.all(
    existingQBItems.map((item) =>
      base44.entities.QuestionBank.delete(item.id).catch(() => {})
    )
  );

  const lv = await base44.entities.LessonVersion.get(lessonVersionId);
  const lessonId = lv?.lesson_id || lessonVersionId;

  const bankItems = questions.map((q, i) => ({
    lesson_id: lessonId,
    lesson_version_id: lessonVersionId,
    question_id: `q_${Date.now()}_${i}`,
    question: (q.questionText || "").trim(),
    correct_answer: q.correctAnswer || "A",
    options_json: JSON.stringify(
      (q.options || ["", "", "", ""]).map((o) => o.trim())
    ),
    explanation: (q.explanation || "").trim(),
    question_image_url: safeUrl(q.questionImageUrl) || null,
    difficulty: "medium",
    quiz_type: "practice",
    question_type: "mcq",
    sort_order: i,
    status: "draft",
  }));

  if (bankItems.length > 0) {
    await base44.entities.QuestionBank.bulkCreate(bankItems);
  }
}

async function _saveToQuiz({
  mode,
  lessonVersionId,
  topicId,
  title,
  subtitle,
  youtubeUrl,
  notes,
  noteImageUrl,
  infographicUrl,
  subtopics,
  questions,
}) {
  const questionsPayload = questions.map((q) => ({
    question: (q.questionText || "").trim(),
    question_image_url: safeUrl(q.questionImageUrl) || null,
    questionImageUrl: safeUrl(q.questionImageUrl) || null,
    options: (q.options || ["", "", "", ""]).map((o) => o.trim()),
    correct_answer: q.correctAnswer || "A",
    correctAnswer: q.correctAnswer || "A",
    explanation: (q.explanation || "").trim(),
  }));

  const notesPayload = JSON.stringify({
    text: notes.trim(),
    image: safeUrl(noteImageUrl) || null,
  });

  const dataPayload = {
    topic_name: title.trim(),
    subject_name: subtitle.trim() || "Matematik",
    video_url: youtubeUrl.trim(),
    notes_content: notesPayload,
    infographic_url: safeUrl(infographicUrl) || null,
    questions_json: JSON.stringify(questionsPayload),
    subtopics_json: JSON.stringify(subtopics),
  };

  if (mode === "create") {
    const targetId = topicId
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await base44.entities.Quiz.create({ id: targetId, ...dataPayload });
  } else {
    await base44.entities.Quiz.update(lessonVersionId, dataPayload);
  }
}

// ─── DELETE (legacy Quiz only) ───────────────────────────────────────────────

export async function deleteLessonQuiz(quizId) {
  await base44.entities.Quiz.delete(quizId);
}

// ─── private converters ──────────────────────────────────────────────────────

function _emptyQuestion() {
  return {
    questionText: "",
    questionImageUrl: "",
    questionFile: null,
    questionPreview: "",
    options: ["", "", "", ""],
    correctAnswer: "A",
    explanation: "",
  };
}

function _quizQuestionToUIQuestion(q) {
  const img = q.questionImageUrl || q.question_image_url || "";
  return {
    questionText: q.question || "",
    questionImageUrl: img,
    questionFile: null,
    questionPreview: img,
    options: q.options || ["", "", "", ""],
    correctAnswer: q.correct_answer || q.correctAnswer || "A",
    explanation: q.explanation || "",
  };
}

function _bankItemToUIQuestion(item) {
  const opts = safeParse(item.options_json, ["", "", "", ""]);
  const img = item.question_image_url || "";
  return {
    questionText: item.question || "",
    questionImageUrl: img,
    questionFile: null,
    questionPreview: img,
    options: Array.isArray(opts) ? opts : ["", "", "", ""],
    correctAnswer: item.correct_answer || "A",
    explanation: item.explanation || "",
  };
}
