import { build9StepKSSRMissionPackage, validateMissionPackage, getKSSRModeByGrade } from './generateKSSRContent.js';
import pedagogyMapping from '../data/pedagogyMapping.json' with { type: "json" };
import widgetRegistry from '../data/widgetRegistry.json' with { type: "json" };
import assessmentFramework from '../data/assessmentFramework.json' with { type: "json" };
import curriculumSchema from '../data/curriculumSchema.json' with { type: "json" };
import { base44 } from '../api/base44Client.js';
import { generateSceneImage } from './aiImageEngine.js';

/**
 * Retrieves or generates the pedagogical strategy context object for any subject, grade, and topic.
 * Supports STEM (Matematik, Sains) and Humanities (Bahasa Melayu, English).
 * @param {string} subject - e.g. "Matematik", "Sains", "Bahasa Melayu", "English"
 * @param {string} grade - e.g. "Tahun 1"
 * @param {string} topic - e.g. "Nombor hingga 100", "Pernafasan Manusia", "Tatabahasa"
 * @returns {object}
 */
export function getPedagogyContext(subject = "Matematik", grade = "Tahun 1", topic = "Nombor hingga 100") {
  if (!subject || !grade || !topic) return null;

  // 1. Try explicit lookup from pedagogyMapping.json first
  const subjectObj = pedagogyMapping?.[subject]?.[grade];
  if (subjectObj) {
    const tLower = topic.toLowerCase();
    const topicKey = Object.keys(subjectObj).find((key) => {
      const item = subjectObj[key];
      const dName = (item.domain_name || "").toLowerCase();
      const keyClean = key.toLowerCase().replace(/_/g, " ");
      return tLower.includes(dName) || dName.includes(tLower) || tLower.includes(keyClean) || keyClean.includes(tLower);
    });

    if (topicKey) {
      return subjectObj[topicKey];
    }
  }

  // 2. Universal Learning Model Fallback for non-mapped subjects/topics
  const assessmentRule = assessmentFramework.subject_assessment_rules?.[subject] || {
    focus: "Penguasaan objektif pembelajaran DSKP dan kemahiran asas."
  };

  if (subject === "Bahasa Melayu") {
    return {
      domain_name: topic,
      default_widget_type: "sentence_builder",
      teaching_strategy: ["Pendekatan Komunikatif", "Pengembangan Kosa Kata & Tatabahasa"],
      real_world_context: ["Penceritaan rutin harian, kebudayaan dan situasi sekolah"],
      visual_method: ["Kad kata interaktif & pengatur grafik susun ayat"],
      teacher_instruction_style: "Bimbingan bacaan lancar dan pembentukan ayat gramatis",
      common_misconception: "Penggunaan imbuhan dan struktur ayat yang tidak tepat",
      suggested_activity: "Susun perkataan menjadi ayat yang lengkap dan berstruktur",
      assessment_focus: assessmentRule.focus
    };
  }

  if (subject === "English") {
    return {
      domain_name: topic,
      default_widget_type: "word_matching",
      teaching_strategy: ["Communicative Language Teaching", "Phonics & Contextual Learning"],
      real_world_context: ["Daily routines, school, hobbies, and social interactions"],
      visual_method: ["Flashcard vocabulary pairing & interactive sentence frames"],
      teacher_instruction_style: "Encouraging pronunciation and vocabulary building",
      common_misconception: "Confusing subject-verb agreement and tenses",
      suggested_activity: "Match target vocabulary with correct picture and sentence clues",
      assessment_focus: assessmentRule.focus
    };
  }

  if (subject === "Sains") {
    return {
      domain_name: topic,
      default_widget_type: "organ_system_explorer",
      teaching_strategy: ["Inkuiri Penemuan & Kemahiran Proses Sains (KPS)", "Pemerhatian Amali & Eksperimen"],
      real_world_context: ["Pemerhatian alam sekitar, organisma hidup, dan fenomena fizik harian"],
      visual_method: ["Simulasi makmal interaktif & diagram pengelasan visual"],
      teacher_instruction_style: "Inkuiri sains berpandu dan pemikiran krisis",
      common_misconception: "Keliru pemboleh ubah bergerak balas dan pemboleh ubah dimalarkan",
      suggested_activity: "Teroka diagram interaktif dan jalankan simulasi eksperimen sains",
      assessment_focus: assessmentRule.focus
    };
  }

  // Generic STEM Math fallback
  return {
    domain_name: topic,
    default_widget_type: "number_scale",
    teaching_strategy: ["Pendekatan Konkrit-Pictorial-Abstrak (CPA)", "Penyelesaian Masalah Rutin"],
    real_world_context: ["Aplikasi nombor dan pengiraan situasi harian"],
    visual_method: ["Garis nombor & objek manipulatif visual"],
    teacher_instruction_style: "Bimbingan langkah demi langkah",
    common_misconception: "Penyusunan digit dan fakta asas matematik",
    suggested_activity: "Gunakan widget interaktif untuk mengukuhkan konsep",
    assessment_focus: assessmentRule.focus
  };
}

/**
 * Formulates prompt instructions for LLM generation matching adventurePackageSchema.json
 */
export function buildLLMPromptForKSSR({ spCode, spDescription, skCode, grade, subject, bidang = "Nombor dan Operasi", topic = "Nombor hingga 100", learningOutcome = "", pbdTarget = "TP3" }) {
  const mode = getKSSRModeByGrade(grade);
  const mascot = mode === "JUNIOR" ? "Suku Penyu 🐢 (Energetic, warm, friendly)" : "Ejen Suku 🦊 (Penyelesaian masalah KBAT)";
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

  const systemPrompt = `YOU ARE AN EXPERT KSSR CURRICULUM AI TUTOR FOR PRIMARY STUDENTS (${grade}).

CRITICAL REQUIREMENT:
You MUST generate lesson content strictly tailored to the following subtopic selection:
- Subject: ${subject}
- Year: ${grade}
- Main Unit (Topic): ${topic}
- Standard Kandungan (SK): ${skCode}
- Standard Pembelajaran (SP) [PRIMARY SUBTOPIC THEME]: ${spCode} - ${spDescription || topic}

STRICT CONTENT GUIDELINES:
1. MANDATORY SUBTOPIC FOCUS: The core learning theme MUST be the SK/SP subtopic "${spCode} - ${spDescription || topic}". Topic "${topic}" provides overall context, but all stories, visual objects, math/learning problems, interactive activities, and quiz questions MUST directly target "${spDescription || topic}" (e.g. comparing quantities 'banyak' vs 'sedikit', NOT generic counting or general unit summaries).
2. DO NOT default to beach/seashells themes UNLESS topic or subtopic is explicitly about counting seashells.
3. Mascot Suku Penyu 🐢 must participate in an adventure related specifically to the subtopic "${spDescription || topic}".
4. Generate RICH STUDENT LESSON SCENES conforming to adventurePackageSchema.json.
5. NEVER include DSKP code tags (SP X.X.X, SK X.X, TP1-6, Micro CPA) in student-facing dialogue or stories.

DUAL-ENGINE MODE: ${mode}
MASCOT COMPANION: ${mascot}${pedagogySection}

STRICT STEP ARCHITECTURE:
Step 1: BRIEFING (Rich story hook, suggestive help_continuation explaining HOW to help Suku Penyu and WHY learning this subtopic is needed, & mascot dialogue)
Step 2: ENGAGEMENT (4 CPA blocks: VISUAL_STORY, COMPARISON_SPLIT, STEP_BY_STEP, MYTH_BUSTER)
Step 3: LESSON (Core concept breakdown with dedicated INFOGRAPHIC structure: title, visual_labels, key_takeaway)
Step 4: PRACTICE (Interactive student exercise with widget)
Step 5: FLASHCARDS (Key vocabulary & definitions)
Step 6: MINI_GAME (SortingGame, MatchingGame, or SequenceGame)
Step 7: QUIZ (Student practice questions with feedback)
Step 8: COMPLETE (XP calculation & celebratory summary)
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

  let missionPackage = null;

  // Attempt real LLM API call if base44 functions or integrations are available
  try {
    if (base44?.functions?.invoke) {
      const apiRes = await base44.functions.invoke("generateAIContent", {
        spCode,
        spDescription,
        skCode,
        grade,
        subject,
        topic,
        pbdTarget,
        prompt: systemPrompt
      });

      if (apiRes?.data?.missionPackage) {
        missionPackage = apiRes.data.missionPackage;
      }
    } else if (base44?.integrations?.Core?.generateText) {
      const apiRes = await base44.integrations.Core.generateText({ prompt: systemPrompt });
      if (apiRes?.text) {
        try {
          missionPackage = JSON.parse(apiRes.text);
        } catch {}
      }
    }
  } catch (err) {
    console.warn("LLM API call failed, falling back to local generator engine:", err);
  }

  // Fallback to structured generator engine if API call returns null
  if (!missionPackage) {
    missionPackage = build9StepKSSRMissionPackage({
      spCode,
      skCode,
      grade,
      pbdTarget,
      subject,
      topicTitle: spDescription || topic,
      widgetType,
      pedagogyContext: pedagogyCtx
    });
  }

  // Enrich visual scenes with dynamic topic-aligned AI image URLs
  try {
    const mainImageUrl = await generateSceneImage({
      subject,
      grade,
      topic: spDescription || topic,
      sceneType: "STORY",
      visualDescription: missionPackage.steps?.[0]?.payload?.visual_description || ""
    });

    if (missionPackage.world) {
      missionPackage.world.image_url = mainImageUrl;
    }

    if (Array.isArray(missionPackage.steps)) {
      for (const step of missionPackage.steps) {
        if (step.payload && !step.payload.image_url) {
          step.payload.image_url = mainImageUrl;
        }
      }
    }
  } catch (imgErr) {
    console.warn("Scene image enrichment warning:", imgErr);
  }

  // Validate JSON against 9-Step schema constraints
  const validation = validateMissionPackage(missionPackage);

  if (!validation.valid) {
    return {
      success: false,
      validation_errors: validation.errors,
      prompt_used: systemPrompt,
      pedagogy_context: pedagogyCtx
    };
  }

  return {
    success: true,
    validation_errors: [],
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
