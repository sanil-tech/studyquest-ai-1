// src/services/lessonShellBuilder.js
// Phase 1 of the Hybrid Pipeline: Deterministic Shell Assembly
// Zero AI calls. System-owned lesson structure.

import { getPedagogyContext } from "./aiContentEngine.js";

/**
 * Resolves JUNIOR vs SENIOR mode from grade string.
 * @param {string} grade
 * @returns {"JUNIOR" | "SENIOR"}
 */
function resolveMode(grade = "Tahun 1") {
  const seniorGrades = ["Tahun 4", "Tahun 5", "Tahun 6"];
  return seniorGrades.includes(grade) ? "SENIOR" : "JUNIOR";
}

/**
 * Resolves mascot identity based on mode.
 * JUNIOR → Suku Penyu 🐢 | SENIOR → Ejen Suku 🦊
 * @param {"JUNIOR" | "SENIOR"} mode
 * @returns {string}
 */
function resolveMascot(mode) {
  return mode === "SENIOR" ? "Ejen Suku 🦊" : "Suku Penyu 🐢";
}

/**
 * WIDGET SEED DATA SCHEMAS
 * Defines the expected seed_data shape for each supported widget type.
 * AI must fill values conforming to these shapes.
 * Widgets not listed here fall back to a generic instruction-only schema.
 */
export const WIDGET_SEED_SCHEMAS = {
  base_ten_blocks: {
    target_number: "integer (1-999)",
    hint: "string — optional hint for the student"
  },
  number_scale: {
    left_val: "integer",
    right_val: "integer",
    correct_relation: "LESS_THAN | GREATER_THAN | EQUAL"
  },
  fraction_slicer: {
    target_fraction: "string e.g. '1/2', '1/4', '3/4'",
    shape_type: "circle | rectangle"
  },
  sentence_builder: {
    target_sentence: "string — the correct sentence to build",
    word_bank: "array of strings (optional extra distractor words)"
  },
  drag_and_drop: {
    items: "array of { id: string, label: string, category: string }",
    targets: "array of { category: string, title: string }"
  },
  matching_cards: {
    pairs: "array of { left: string, right: string }"
  },
  quiz_wheel: {
    segments: "array of { label: string, question: string, options: string[], correct_index: number }"
  }
};

/**
 * List of widget types that have real, implemented React components.
 * Lessons should only use these widgets for launch reliability.
 */
export const SUPPORTED_WIDGETS = [
  "base_ten_blocks",
  "number_scale",
  "fraction_slicer",
  "sentence_builder",
  "drag_and_drop",
  "matching_cards",
  "quiz_wheel"
];

/**
 * Resolves the best widget type for a given subject/grade/topic.
 * Priority: pedagogyMapping.json → subject default → universal fallback.
 *
 * @param {string} subject
 * @param {string} grade
 * @param {string} topic
 * @returns {string} widget_type string
 */
function resolveWidgetType(subject, grade, topic) {
  const pedagogyCtx = getPedagogyContext(subject, grade, topic);
  const mapped = pedagogyCtx?.default_widget_type;

  // If pedagogyMapping gives us a supported widget, use it
  if (mapped && SUPPORTED_WIDGETS.includes(mapped)) {
    return mapped;
  }

  // Subject-level defaults for unsupported/missing widget mappings
  const subjectDefaults = {
    Matematik: "base_ten_blocks",
    Sains: "drag_and_drop",
    "Bahasa Melayu": "sentence_builder",
    English: "sentence_builder"
  };

  return subjectDefaults[subject] || "drag_and_drop";
}

/**
 * XP and coin reward schedule per block.
 * Deterministic — never AI-generated.
 */
const REWARD_SCHEDULE = [
  { xp: 10, coins: 0 },   // Block 1: STORY_HOOK
  { xp: 0, coins: 0 },    // Block 2: LEARNING_OBJECTIVE
  { xp: 15, coins: 0 },   // Block 3: CONCEPT_CPA
  { xp: 0, coins: 0 },    // Block 4: WORKED_EXAMPLE
  { xp: 25, coins: 10 },  // Block 5: INTERACTIVE_PRACTICE
  { xp: 50, coins: 15 },  // Block 6: KNOWLEDGE_CHECK
  { xp: 0, coins: 0 },    // Block 7: KEY_TAKEAWAY
  { xp: 0, coins: 0 }     // Block 8: MISSION_COMPLETE (totals filled at build time)
];

/**
 * The 8 block types in their fixed, deterministic order.
 */
const BLOCK_TYPES = [
  "STORY_HOOK",
  "LEARNING_OBJECTIVE",
  "CONCEPT_CPA",
  "WORKED_EXAMPLE",
  "INTERACTIVE_PRACTICE",
  "KNOWLEDGE_CHECK",
  "KEY_TAKEAWAY",
  "MISSION_COMPLETE"
];

/**
 * Builds a complete, empty 8-block lesson shell.
 *
 * This is Phase 1 of the Hybrid Pipeline.
 * Zero AI calls. All structural decisions are deterministic.
 * The returned shell has empty content fields marked for AI fill.
 *
 * @param {object} params
 * @param {string} params.subject - e.g. "Matematik"
 * @param {string} params.grade - e.g. "Tahun 1"
 * @param {string} params.sk_code - e.g. "1.1"
 * @param {string} params.sp_code - e.g. "1.1.1"
 * @param {string} params.sp_description - e.g. "Menyatakan kuantiti secara membandingkan banyak atau sedikit"
 * @param {string} params.topic - e.g. "Nombor hingga 100"
 * @param {string} params.target_tp - e.g. "TP3"
 * @returns {object} Complete lesson shell with empty AI_FILL content fields
 */
export function buildLessonShell({
  subject = "Matematik",
  grade = "Tahun 1",
  sk_code = "1.1",
  sp_code = "1.1.1",
  sp_description = "",
  topic = "",
  target_tp = "TP3"
}) {
  const mode = resolveMode(grade);
  const mascot = resolveMascot(mode);
  const widgetType = resolveWidgetType(subject, grade, topic || sp_description);
  const pedagogyCtx = getPedagogyContext(subject, grade, topic || sp_description);

  // Calculate totals for the MISSION_COMPLETE block
  const totalXp = REWARD_SCHEDULE.reduce((sum, r) => sum + r.xp, 0);
  const totalCoins = REWARD_SCHEDULE.reduce((sum, r) => sum + r.coins, 0);

  const lessonId = `lesson_${sp_code.replace(/\./g, "_")}_${Date.now()}`;

  const shell = {
    version: "2.0",
    lesson_id: lessonId,
    metadata: {
      subject,
      grade,
      sk_code,
      sp_code,
      sp_description: sp_description || topic,
      topic: topic || sp_description,
      target_tp,
      mode,
      mascot,
      widget_type: widgetType,
      estimated_duration_minutes: mode === "JUNIOR" ? 20 : 25,
      pedagogy_context: pedagogyCtx
        ? {
            teaching_strategy: Array.isArray(pedagogyCtx.teaching_strategy)
              ? pedagogyCtx.teaching_strategy
              : [pedagogyCtx.teaching_strategy].filter(Boolean),
            real_world_context: Array.isArray(pedagogyCtx.real_world_context)
              ? pedagogyCtx.real_world_context
              : [pedagogyCtx.real_world_context].filter(Boolean),
            visual_method: Array.isArray(pedagogyCtx.visual_method)
              ? pedagogyCtx.visual_method
              : [pedagogyCtx.visual_method].filter(Boolean),
            common_misconception: pedagogyCtx.common_misconception || "",
            suggested_activity: pedagogyCtx.suggested_activity || ""
          }
        : null
    },
    blocks: BLOCK_TYPES.map((blockType, index) => {
      const reward = REWARD_SCHEDULE[index];
      const blockNumber = index + 1;

      const block = {
        block_number: blockNumber,
        block_type: blockType,
        xp_reward: reward.xp,
        coin_reward: reward.coins,
        content: {} // AI fills this in Phase 2
      };

      // Pre-populate system-determined fields within content
      switch (blockType) {
        case "STORY_HOOK":
          block.content = {
            story_text: "",        // AI_FILL
            mascot_dialogue: "",   // AI_FILL
            tts_script: ""         // AI_FILL
          };
          break;

        case "LEARNING_OBJECTIVE":
          block.content = {
            i_can_statement: "",   // AI_FILL
            tp_badge: target_tp    // SYSTEM
          };
          break;

        case "CONCEPT_CPA":
          block.content = {
            concrete: { title: "", explanation: "", visual_prompt: "" },   // AI_FILL
            pictorial: { title: "", explanation: "", visual_prompt: "" },  // AI_FILL
            abstract: { title: "", explanation: "", key_term: "", key_definition: "" }  // AI_FILL
          };
          break;

        case "WORKED_EXAMPLE":
          block.content = {
            problem_statement: "",    // AI_FILL
            solution_steps: [],       // AI_FILL
            common_mistake: "",       // AI_FILL
            correct_reasoning: ""     // AI_FILL
          };
          break;

        case "INTERACTIVE_PRACTICE":
          block.content = {
            widget_type: widgetType,  // SYSTEM (from pedagogyMapping)
            instruction: "",          // AI_FILL
            seed_data: {}             // AI_FILL (must match WIDGET_SEED_SCHEMAS[widgetType])
          };
          break;

        case "KNOWLEDGE_CHECK":
          block.content = {
            questions: []  // AI_FILL: 3-5 question objects
          };
          break;

        case "KEY_TAKEAWAY":
          block.content = {
            summary_points: [],  // AI_FILL: exactly 3 strings
            memory_tip: "",      // AI_FILL
            flashcards: []       // AI_FILL: 2-3 { term, definition } objects
          };
          break;

        case "MISSION_COMPLETE":
          block.content = {
            celebration_message: "",  // AI_FILL
            badge_name: "",           // AI_FILL
            total_xp: totalXp,       // SYSTEM: calculated
            total_coins: totalCoins   // SYSTEM: calculated
          };
          break;

        default:
          break;
      }

      return block;
    })
  };

  return shell;
}

/**
 * Validates a completed lesson shell (after AI fill) against content constraints.
 * This is NOT JSON Schema validation — it checks semantic quality.
 *
 * @param {object} shell - The lesson shell with AI-filled content
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateLessonShell(shell) {
  const errors = [];
  const warnings = [];

  if (!shell || shell.version !== "2.0") {
    errors.push("Shell version mesti '2.0'");
    return { valid: false, errors, warnings };
  }

  if (!shell.metadata?.sp_code) {
    errors.push("Metadata SP code tidak wujud");
  }

  if (!Array.isArray(shell.blocks) || shell.blocks.length !== 8) {
    errors.push(`Shell mesti mempunyai tepat 8 blok. Ditemui: ${shell.blocks?.length}`);
    return { valid: false, errors, warnings };
  }

  // Block-level validation
  shell.blocks.forEach((block, idx) => {
    const expectedType = BLOCK_TYPES[idx];
    if (block.block_type !== expectedType) {
      errors.push(`Blok ${idx + 1} mesti '${expectedType}', ditemui '${block.block_type}'`);
    }

    const c = block.content;
    if (!c || Object.keys(c).length === 0) {
      errors.push(`Blok ${idx + 1} (${expectedType}) tiada kandungan`);
      return;
    }

    switch (block.block_type) {
      case "STORY_HOOK":
        if (!c.story_text || c.story_text.length < 20) {
          errors.push("STORY_HOOK: story_text terlalu pendek atau kosong");
        }
        if (!c.mascot_dialogue) {
          errors.push("STORY_HOOK: mascot_dialogue kosong");
        }
        break;

      case "LEARNING_OBJECTIVE":
        if (!c.i_can_statement || c.i_can_statement.length < 10) {
          errors.push("LEARNING_OBJECTIVE: i_can_statement kosong atau terlalu pendek");
        }
        break;

      case "CONCEPT_CPA":
        ["concrete", "pictorial", "abstract"].forEach((phase) => {
          if (!c[phase]?.explanation || c[phase].explanation.length < 15) {
            errors.push(`CONCEPT_CPA: ${phase}.explanation kosong atau terlalu pendek`);
          }
        });
        break;

      case "WORKED_EXAMPLE":
        if (!c.problem_statement) {
          errors.push("WORKED_EXAMPLE: problem_statement kosong");
        }
        if (!Array.isArray(c.solution_steps) || c.solution_steps.length < 2) {
          errors.push("WORKED_EXAMPLE: solution_steps mesti ada sekurang-kurangnya 2 langkah");
        }
        break;

      case "INTERACTIVE_PRACTICE":
        if (!c.instruction) {
          errors.push("INTERACTIVE_PRACTICE: instruction kosong");
        }
        if (!c.seed_data || Object.keys(c.seed_data).length === 0) {
          warnings.push("INTERACTIVE_PRACTICE: seed_data kosong — widget mungkin gunakan default");
        }
        break;

      case "KNOWLEDGE_CHECK":
        if (!Array.isArray(c.questions) || c.questions.length < 3) {
          errors.push(`KNOWLEDGE_CHECK: Mesti ada 3-5 soalan. Ditemui: ${c.questions?.length || 0}`);
        }
        c.questions?.forEach((q, qIdx) => {
          if (!q.stem) errors.push(`KNOWLEDGE_CHECK: Soalan ${qIdx + 1} tiada stem`);
          if (!Array.isArray(q.options) || q.options.length < 3) {
            errors.push(`KNOWLEDGE_CHECK: Soalan ${qIdx + 1} mesti ada 3+ pilihan`);
          }
          if (q.correct_index === undefined || q.correct_index === null) {
            errors.push(`KNOWLEDGE_CHECK: Soalan ${qIdx + 1} tiada correct_index`);
          }
        });
        break;

      case "KEY_TAKEAWAY":
        if (!Array.isArray(c.summary_points) || c.summary_points.length < 3) {
          errors.push("KEY_TAKEAWAY: Mesti ada tepat 3 summary_points");
        }
        if (!Array.isArray(c.flashcards) || c.flashcards.length < 2) {
          errors.push("KEY_TAKEAWAY: Mesti ada 2+ flashcards");
        }
        break;

      case "MISSION_COMPLETE":
        if (!c.celebration_message) {
          warnings.push("MISSION_COMPLETE: celebration_message kosong");
        }
        break;

      default:
        break;
    }
  });

  // Content quality checks — detect placeholder/generic text
  const BANNED_PATTERNS = [
    /Pilihan A \(Jawapan Tepat\)/i,
    /Pilihan B \(Kurang Tepat\)/i,
    /Pilihan C \(Salah\)/i,
    /Kategori \d/i,
    /Penerangan konsep asas/i,
    /Belajar tajuk ini/i,
    /\$\{.*?\}/  // Unreplaced template variables
  ];

  const allText = JSON.stringify(shell.blocks);
  BANNED_PATTERNS.forEach((pattern) => {
    if (pattern.test(allText)) {
      errors.push(`Teks placeholder/generik dikesan: ${pattern.source}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Returns the widget seed data schema for a given widget type.
 * Used by AI content filler to know what shape seed_data should be.
 *
 * @param {string} widgetType
 * @returns {object|null}
 */
export function getWidgetSeedSchema(widgetType) {
  return WIDGET_SEED_SCHEMAS[widgetType] || null;
}
