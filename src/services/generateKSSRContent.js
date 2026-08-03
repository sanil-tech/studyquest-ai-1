// src/services/generateKSSRContent.js

/**
 * Validates a 9-Step KSSR Mission Package payload against schema requirements.
 * @param {object} json - The mission package payload to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMissionPackage(json) {
  const errors = [];

  if (!json || typeof json !== 'object') {
    return { valid: false, errors: ['Payload mesti wujud dan berbentuk objek'] };
  }

  // 1. Required top-level fields
  const requiredTopFields = ['spCode', 'skCode', 'grade', 'mode', 'pbdTarget', 'steps'];
  for (const field of requiredTopFields) {
    if (!json[field]) {
      errors.push(`Medan utama terlepas: '${field}'`);
    }
  }

  // 2. Validate mode
  if (json.mode && !['JUNIOR', 'SENIOR'].includes(json.mode)) {
    errors.push(`Mod tidak sah '${json.mode}'. Mesti 'JUNIOR' atau 'SENIOR'.`);
  }

  // 3. Validate steps array
  if (!Array.isArray(json.steps)) {
    errors.push("Medan 'steps' mesti berbentuk Array.");
  } else if (json.steps.length !== 9) {
    errors.push(`Array 'steps' mesti mempunyai tepat 9 langkah. Ditemui: ${json.steps.length}`);
  } else {
    // 4. Validate exact 9-Step Journey order
    const expectedStepTypes = [
      'BRIEFING',
      'ENGAGEMENT',
      'LESSON',
      'PRACTICE',
      'FLASHCARDS',
      'MINI_GAME',
      'QUIZ',
      'COMPLETE',
      'REWARD'
    ];

    json.steps.forEach((step, index) => {
      const expectedType = expectedStepTypes[index];
      if (step.step_type !== expectedType) {
        errors.push(`Langkah ${index + 1} mesti bertipe '${expectedType}', tetapi ditemui '${step.step_type}'`);
      }
      if (step.step_number !== index + 1) {
        errors.push(`Langkah ${index + 1} mempunyai step_number '${step.step_number}' instead of ${index + 1}`);
      }
    });

    // 5. Deep validation of Step 2 (ENGAGEMENT CPA Blocks)
    const engagementStep = json.steps[1];
    if (engagementStep && engagementStep.step_type === 'ENGAGEMENT') {
      const cpaBlocks = engagementStep.cpa_blocks;
      if (!Array.isArray(cpaBlocks) || cpaBlocks.length !== 4) {
        errors.push("Langkah 2 (ENGAGEMENT) mesti mengandungi tepat 4 blok 'cpa_blocks'");
      } else {
        const requiredCPATypes = ['VISUAL_STORY', 'COMPARISON_SPLIT', 'STEP_BY_STEP', 'MYTH_BUSTER'];
        requiredCPATypes.forEach((type, idx) => {
          if (!cpaBlocks[idx] || cpaBlocks[idx].block_type !== type) {
            errors.push(`Blok CPA ${idx + 1} di Langkah 2 mesti bertipe '${type}', tetapi ditemui '${cpaBlocks[idx]?.block_type}'`);
          }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Determines whether a grade belongs to JUNIOR or SENIOR Dual-Engine mode.
 * @param {string} grade - e.g., "Prasekolah", "Tahun 1" to "Tahun 6"
 * @returns {"JUNIOR" | "SENIOR"}
 */
export function getKSSRModeByGrade(grade = "Tahun 1") {
  const seniorGrades = ["Tahun 4", "Tahun 5", "Tahun 6"];
  return seniorGrades.includes(grade) ? "SENIOR" : "JUNIOR";
}

/**
 * Builds a complete, valid 9-Step KSSR Mission Package adhering strictly to the Dual-Layer Data Schema.
 * Generates rich, authentic student-facing lesson scenes (Suku Penyu story dialogue, real math questions, interactive widgets).
 */
export function build9StepKSSRMissionPackage({
  spCode = "1.1.1",
  skCode = "1.1",
  grade = "Tahun 1",
  pbdTarget = "TP3",
  subject = "Matematik",
  topicTitle = "Nombor hingga 100",
  widgetType = null,
  pedagogyContext = null
}) {
  const mode = getKSSRModeByGrade(grade);
  const mascotName = mode === "SENIOR" ? "Ejen Suku 🦊" : "Suku Penyu 🐢";

  const realWorldAnchor = pedagogyContext?.real_world_context
    ? (Array.isArray(pedagogyContext.real_world_context) ? pedagogyContext.real_world_context[0] : pedagogyContext.real_world_context)
    : `Membilang guli, klip kertas, dan buah-buahan di kedai`;

  const visualMethod = pedagogyContext?.visual_method
    ? (Array.isArray(pedagogyContext.visual_method) ? pedagogyContext.visual_method[0] : pedagogyContext.visual_method)
    : `Suku meletakkan 3 kerang biru di sebelah kiri dan 2 kerang merah di sebelah kanan untuk dikira.`;

  const misconceptionText = pedagogyContext?.common_misconception
    ? pedagogyContext.common_misconception
    : `Keliru antara kumpulan yang lebih banyak dan lebih sedikit`;

  const yearNum = parseInt(grade.replace(/\D/g, ""), 10) || 1;

  const missionPackage = {
    // ----------------------------------------------------
    // DUAL-LAYER SCHEMA: TEACHER/ADMIN METADATA
    // ----------------------------------------------------
    admin_metadata: {
      subject,
      year: yearNum,
      grade,
      sk_code: skCode,
      sp_code: spCode,
      topic: topicTitle,
      pedagogy_block: "MICRO_CPA_ENGAGEMENT",
      target_tp: pbdTarget
    },

    // ----------------------------------------------------
    // DUAL-LAYER SCHEMA: STUDENT-FACING INTERFACE TEXT
    // ----------------------------------------------------
    student_ui: {
      world_title: `Dunia ${subject}`,
      mission_header: `Pengembaraan di Pantai Borneo`,
      mission_description: `Selamat datang! Suku Penyu sedang mengumpul kerang berwarna-warni di tepi pantai. Jom kita bantu Suku membilang kerang!`,
      mascot_dialogue: mode === "SENIOR"
        ? `Hai! Saya Ejen Suku 🦊. Mari kita analisis dan selesaikan masalah nombor ini bersama-sama!`
        : `Hai kawan-kawan! Suku jumpa 5 biji kerang di tepi pantai. Jom kita kira bersama!`,
      call_to_action: "Mula Kembara!"
    },

    // Top-Level Legacy & Compatibility Fields
    spCode,
    skCode,
    grade,
    mode,
    pbdTarget,
    world: {
      world_name: `Dunia ${subject}`,
      world_icon: subject.toLowerCase().includes("matematik") ? "🔢" : (subject.toLowerCase().includes("sains") ? "🔬" : "📚"),
      theme: "Pengembaraan di Pantai Borneo",
      description: `Bantu ${mascotName} membilang kerang dan mengumpul syiling emas!`
    },
    adventure_story: {
      title: `Pengembaraan di Pantai Borneo`,
      introduction: `Di tepi pantai Borneo yang indah, Suku Penyu 🐢 sedang mengumpul kerang berwarna-warni. Mari bantu Suku membilang kerang tersebut!`,
      problem: `Bantu Suku mengira 5 biji kerang biru dan 3 biji kerang merah untuk memenuhi bakul ganjaran!`,
      mission_goal: `Kira dan susun kerang dengan tepat untuk memenangi Pingat Kerang Emas!`
    },
    otan_companion: {
      greeting: mode === "SENIOR"
        ? "Salam Pengembara! Ejen Suku 🦊 sedia membantu anda menganalisis cabaran ini!"
        : "Hai kawan-kawan! Suku Penyu 🐢 sedia membilang bersama kamu!",
      encouragement: ["Bagus sekali!", "Kamu membilang dengan cepat dan tepat!", "Suku bangga dengan kamu!"],
      hint_messages: ["Kira satu demi satu dari kiri ke kanan.", "Bandingkan bilangan kerang merah dan biru."],
      celebration_messages: ["Tahniah! Bakul kerang Suku sudah penuh! 🎉"]
    },
    steps: [
      {
        step_number: 1,
        step_type: "BRIEFING",
        title: "Pengenalan Misi",
        payload: {
          story_hook: `Di tepi pantai Borneo yang indah, Suku Penyu 🐢 sedang mengumpul kerang berwarna-warni! Jom kita bantu Suku membilang kerang dan mengira jumlahnya bersama-sama!`,
          mascot_dialogue: mode === "SENIOR"
            ? `Hai! Saya Ejen Suku 🦊. Jom kita rungkai cabaran nombor ini!`
            : `Hai kawan-kawan! Suku jumpa 5 biji kerang di tepi pantai. Jom kita kira bersama!`,
          visual_description: `3D Suku Penyu holding 5 seashells on a sunny beach`
        }
      },
      {
        step_number: 2,
        step_type: "ENGAGEMENT",
        title: "Penerokaan CPA 4-Blok",
        cpa_blocks: [
          {
            block_type: "VISUAL_STORY",
            title: `Kisah Visual Membilang Kerang`,
            content: { text: `Suku meletakkan 3 kerang biru di sebelah kiri dan 2 kerang merah di sebelah kanan untuk dikira.` }
          },
          {
            block_type: "COMPARISON_SPLIT",
            title: `Perbandingan Kuantiti`,
            content: { left: `3 Kerang Biru`, right: `2 Kerang Merah` }
          },
          {
            block_type: "STEP_BY_STEP",
            title: `Langkah Membilang`,
            content: { steps: [`1. Kira kerang biru: 1, 2, 3`, `2. Kira kerang merah: 1, 2`, `3. Gabungkan kesemuanya: 3 + 2 = 5 kerang!`] }
          },
          {
            block_type: "MYTH_BUSTER",
            title: `Mitos & Fakta Nombor`,
            content: { myth: `Adakah 5 lebih sedikit daripada 3?`, fact: `5 ialah nombor yang lebih besar daripada 3!` }
          }
        ]
      },
      {
        step_number: 3,
        step_type: "LESSON",
        title: "Pecahan Konsep Utama",
        payload: {
          concept_summary: `Bila kita membilang nombor dari 1 hingga 10, setiap nombor bertambah 1. Kuantiti yang lebih besar bermaksud bilangan yang lebih banyak.`,
          key_points: [
            `Membilang mengikut urutan 1 hingga 10 secara tertib naik`,
            `Membandingkan kumpulan banyak dan sedikit`,
            `Menggabungkan dua kumpulan objek untuk mendapat jumlah keseluruhan`
          ]
        }
      },
      {
        step_number: 4,
        step_type: "PRACTICE",
        title: "Bantu Suku Membilang",
        payload: {
          widget_type: widgetType || (subject.toLowerCase().includes("matematik") ? "base_ten_blocks" : "sentence_builder"),
          instruction: `Tarik 3 lagi kerang ke dalam bakul Suku.`,
          interactive_data: { topic: "Bantu Suku Membilang", targetNumber: 5, targetSentence: "Suku membilang lima biji kerang di pantai" }
        }
      },
      {
        step_number: 5,
        step_type: "FLASHCARDS",
        title: "Kad Imbasan Terma Utama",
        cards: [
          { term: "Kuantiti", definition: "Jumlah atau bilangan objek yang kita kira." },
          { term: "Lebih Banyak", definition: "Kumpulan yang mempunyai bilangan objek yang lebih tinggi." }
        ]
      },
      {
        step_number: 6,
        step_type: "MINI_GAME",
        title: "Permainan Susun Nombor",
        payload: {
          game_type: "SortingGame",
          game_config: { items: ["3 Kerang", "5 Kerang", "8 Kerang"], targetCategory: "Susun dari kecil ke besar" }
        }
      },
      {
        step_number: 7,
        step_type: "QUIZ",
        title: "Soalan Cabaran Suku",
        questions: [
          {
            question: "Suku ada 5 kerang, kemudian jumpa 3 lagi. Berapakah jumlah kerang Suku sekarang?",
            options: ["7", "8", "9"],
            correct_index: 1,
            explanation: "5 tambah 3 menjadi 8 kerang kesemuanya!",
            tp_level: pbdTarget
          }
        ]
      },
      {
        step_number: 8,
        step_type: "COMPLETE",
        title: "Rumusan Misi",
        payload: {
          xp_earned: 100,
          coins_earned: 25,
          mastery_summary: "Tahniah! Anda telah berjaya membantu Suku membilang 8 biji kerang di tepi pantai! 🎉"
        }
      },
      {
        step_number: 9,
        step_type: "REWARD",
        title: "Ganjaran Lencana Misi",
        payload: {
          badge: "Wira Pembilang Kerang",
          item_drop: "Mahkota Kerang Emas 👑",
          item_icon: "👑"
        }
      }
    ]
  };

  return missionPackage;
}

/**
 * Returns a batch lesson for backward compatibility
 */
export function buildKSSRBatchLesson({ subject, grade, standardCode, topicTitle }) {
  const missionPkg = build9StepKSSRMissionPackage({
    subject,
    grade,
    spCode: standardCode,
    skCode: standardCode ? standardCode.split('.').slice(0, 2).join('.') : "1.1",
    topicTitle
  });

  return missionPkg.steps.map((step) => ({
    id: `step-${step.step_number}`,
    order_number: step.step_number,
    block_type: step.step_type,
    pedagogical_phase: step.title,
    title: step.title,
    payload: step.payload || step
  }));
}

/**
 * Returns sample KSSR lesson payload
 */
export function getSampleKSSRLesson(subject = "Bahasa_Melayu") {
  const params = {
    subject: subject.includes("Matematik") ? "Matematik" : "Bahasa Melayu",
    grade: "Tahun 1",
    spCode: "1.4.1",
    skCode: "1.4",
    pbdTarget: "TP3",
    topicTitle: "Nilai Tempat & Kuantiti"
  };

  const missionPkg = build9StepKSSRMissionPackage(params);
  const validation = validateMissionPackage(missionPkg);

  return {
    success: validation.valid,
    validation_errors: validation.errors,
    mission_package: missionPkg,
    published_version: {
      id: "test-version-9step",
      version_number: 1,
      curriculum_type: "KSSR_SEMAKAN",
      year_level: params.grade,
      subject_name: params.subject,
      sk_code: params.skCode,
      sp_code: params.spCode
    }
  };
}
