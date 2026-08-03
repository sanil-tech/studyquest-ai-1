import { build9StepKSSRMissionPackage, validateMissionPackage, getKSSRModeByGrade } from './generateKSSRContent.js';
import kssrTaxonomy from '../data/kssrTaxonomy.json' with { type: "json" };
import pedagogyMapping from '../data/pedagogyMapping.json' with { type: "json" };

/**
 * Retrieves the pedagogical strategy context object for a given subject, grade, and topic.
 * @param {string} subject - e.g. "Matematik"
 * @param {string} grade - e.g. "Tahun 1"
 * @param {string} topic - e.g. "Nombor hingga 100", "Pecahan"
 * @returns {object|null}
 */
export function getPedagogyContext(subject = "Matematik", grade = "Tahun 1", topic = "Nombor hingga 100") {
  if (!subject || !grade || !topic) return null;

  const subjectObj = pedagogyMapping?.[subject]?.[grade];
  if (!subjectObj) return null;

  const tLower = topic.toLowerCase();

  // Search by exact topic key or domain name
  const topicKey = Object.keys(subjectObj).find((key) => {
    const item = subjectObj[key];
    const dName = (item.domain_name || "").toLowerCase();
    const keyClean = key.toLowerCase().replace(/_/g, " ");
    return tLower.includes(dName) || dName.includes(tLower) || tLower.includes(keyClean) || keyClean.includes(tLower);
  });

  return topicKey ? subjectObj[topicKey] : null;
}

/**
 * Formulates prompt instructions for LLM generation matching adventurePackageSchema.json
 */
export function buildLLMPromptForKSSR({ spCode, spDescription, skCode, grade, subject, bidang = "Nombor dan Operasi", topic = "Nombor hingga 100", learningOutcome = "", pbdTarget = "TP3" }) {
  const mode = getKSSRModeByGrade(grade);
  const mascot = mode === "JUNIOR" ? "Suku Penyu 🐢 (Bahasa santai kanak-kanak)" : "Ejen Suku 🦊 (Penyelesaian masalah KBAT & Pemikiran Kritis)";
  const pedagogyCtx = getPedagogyContext(subject, grade, topic);

  let pedagogySection = "";
  if (pedagogyCtx) {
    pedagogySection = `
PEDAGOGY INTELLIGENCE CONTEXT:
  - Teaching Strategy: ${Array.isArray(pedagogyCtx.teaching_strategy) ? pedagogyCtx.teaching_strategy.join(", ") : pedagogyCtx.teaching_strategy}
  - Real-World Anchor: ${Array.isArray(pedagogyCtx.real_world_context) ? pedagogyCtx.real_world_context.join(", ") : pedagogyCtx.real_world_context}
  - Visual Method: ${Array.isArray(pedagogyCtx.visual_method) ? pedagogyCtx.visual_method.join(", ") : pedagogyCtx.visual_method}
  - Teacher Instruction Style: ${pedagogyCtx.teacher_instruction_style}
  - Misconception Shield: ${pedagogyCtx.common_misconception}
  - Suggested Activity: ${pedagogyCtx.suggested_activity}
  - Assessment Focus: ${pedagogyCtx.assessment_focus}
  - Preferred Interactive Widget: ${pedagogyCtx.default_widget_type}`;
  }

  const systemPrompt = `You are StudyQuest AI, an expert Malaysian KSSR Semakan Instructional Designer.
You must generate a 9-Step Macro Journey JSON payload strictly conforming to adventurePackageSchema.json for ${grade} (${subject}).

DUAL-ENGINE MODE: ${mode}
MASCOT COMPANION: ${mascot}
CURRICULUM CONTEXT:
  - Framework: KSSR Semakan
  - Grade: ${grade}
  - Subject: ${subject}
  - Bidang / Theme: ${bidang}
  - Topic: ${topic}
  - SK Code: ${skCode}
  - SP Code: ${spCode}
  - SP Description: ${spDescription || topic}
  - Learning Outcome: ${learningOutcome || spDescription || topic}
  - PBD Target: ${pbdTarget}${pedagogySection}

STRICT STEP ARCHITECTURE:
Step 1: BRIEFING (Story hook & mascot dialogue)
Step 2: ENGAGEMENT (4 CPA blocks: VISUAL_STORY, COMPARISON_SPLIT, STEP_BY_STEP, MYTH_BUSTER)
Step 3: LESSON (Core concept breakdown)
Step 4: PRACTICE (Interactive exercises using widget)
Step 5: FLASHCARDS (Key terms & definitions)
Step 6: MINI_GAME (Payload for SortingGame, MatchingGame, or SequenceGame)
Step 7: QUIZ (PBD evaluation questions)
Step 8: COMPLETE (XP calculation & mastery summary)
Step 9: REWARD (Badge & Item drop)

Output must be valid JSON only.`;

  return { systemPrompt, mode, pedagogyCtx };
}

/**
 * Primary function to generate and validate KSSR Mission Package
 */
export async function generateKSSRMissionPackage({
  spCode = "1.1.1",
  spDescription = "",
  skCode = "1.1",
  grade = "Tahun 1",
  subject = "Matematik",
  bidang = "Nombor dan Operasi",
  topic = "Nombor hingga 100",
  learningOutcome = "",
  pbdTarget = "TP3"
}) {
  const mode = getKSSRModeByGrade(grade);
  const pedagogyCtx = getPedagogyContext(subject, grade, topic);
  const widgetType = pedagogyCtx?.default_widget_type;

  const { systemPrompt } = buildLLMPromptForKSSR({ spCode, spDescription, skCode, grade, subject, bidang, topic, learningOutcome, pbdTarget });

  // Generate structured 9-Step Package conforming to adventurePackageSchema.json
  const missionPackage = build9StepKSSRMissionPackage({
    spCode,
    skCode,
    grade,
    pbdTarget,
    subject,
    topicTitle: spDescription || topic,
    widgetType,
    pedagogyContext: pedagogyCtx
  });

  // Adjust mascot dialogue for SENIOR vs JUNIOR mode
  if (mode === "SENIOR") {
    missionPackage.otan_companion.greeting = "Salam Pengembara! Ejen Suku 🦊 sedia membantu anda menganalisis masalah KBAT ini!";
    missionPackage.steps[0].payload.mascot_dialogue = `Hai! Saya Ejen Suku 🦊. Mari kita rungkai cabaran KBAT bagi SP ${spCode}.`;
  } else {
    missionPackage.otan_companion.greeting = "Hai Pengembara! Suku Penyu 🐢 sedia meneroka bersama kamu!";
    missionPackage.steps[0].payload.mascot_dialogue = `Hai! Saya Suku Penyu 🐢. Hari ini kita akan belajar ${spDescription || topic}!`;
  }

  // Validate JSON against 9-Step schema constraints
  const validation = validateMissionPackage(missionPackage);

  return {
    success: validation.valid,
    validation_errors: validation.errors,
    prompt_used: systemPrompt,
    pedagogy_context: pedagogyCtx,
    missionPackage,
    adventurePackage: missionPackage // for compatibility with AdventurePreview
  };
}

/**
 * Legacy compatibility helper
 */
export const generateLessonForSP = async (spCode, studentName = 'Pengembara') => {
  const result = await generateKSSRMissionPackage({ spCode });
  return {
    success: result.success,
    lesson: {
      id: `ai_gen_${spCode}_${Date.now()}`,
      title: `SP ${spCode}`,
      description: `Pelajaran 9-Langkah KSSR`
    },
    published_version: {
      id: `ai_ver_${Date.now()}`,
      version_number: 1,
      curriculum_type: "KSSR_SEMAKAN",
      year_level: "Tahun 1",
      subject_name: "Matematik",
      sk_code: spCode.substring(0, spCode.lastIndexOf('.')),
      sp_code: spCode
    },
    adventurePackage: result.adventurePackage,
    content_blocks: result.missionPackage.steps
  };
};
