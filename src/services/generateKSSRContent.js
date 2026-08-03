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
 * Builds a complete, valid 9-Step KSSR Mission Package
 */
export function build9StepKSSRMissionPackage({
  spCode = "1.1.1",
  skCode = "1.1",
  grade = "Tahun 1",
  pbdTarget = "TP3",
  subject = "Matematik",
  topicTitle = "Kuantiti & Nilai Nombor",
  widgetType = null,
  pedagogyContext = null
}) {
  const mode = getKSSRModeByGrade(grade);
  const mascotName = mode === "SENIOR" ? "Ejen Suku 🦊" : "Suku Penyu 🐢";

  const realWorldAnchor = pedagogyContext?.real_world_context
    ? (Array.isArray(pedagogyContext.real_world_context) ? pedagogyContext.real_world_context[0] : pedagogyContext.real_world_context)
    : `Meneroka tajuk ${topicTitle}`;

  const visualMethod = pedagogyContext?.visual_method
    ? (Array.isArray(pedagogyContext.visual_method) ? pedagogyContext.visual_method[0] : pedagogyContext.visual_method)
    : `Visual perwakilan danilustrasi objek bagi pemahaman tajuk ${topicTitle}.`;

  const misconceptionText = pedagogyContext?.common_misconception
    ? pedagogyContext.common_misconception
    : `Tajuk ${topicTitle} sangat sukar dikuasai`;

  const missionPackage = {
    spCode,
    skCode,
    grade,
    mode,
    pbdTarget,
    world: {
      world_name: `Dunia ${subject}`,
      world_icon: subject.toLowerCase().includes("matematik") ? "🔢" : (subject.toLowerCase().includes("sains") ? "🔬" : "📚"),
      theme: "Pengembaraan KSSR Semakan",
      description: `Meneroka tajuk ${topicTitle} bersama ${mascotName}`
    },
    adventure_story: {
      title: `Kembara ${topicTitle}`,
      introduction: `Selamat datang ke modul KSSR ${grade}! Mari kita terokai tajuk ${topicTitle} (${realWorldAnchor}).`,
      problem: `Selesaikan cabaran SP ${spCode} untuk mencapai sasaran PBD ${pbdTarget}!`,
      mission_goal: `Kuasai kemahiran ${topicTitle} mengikut standard KPM KSSR Semakan.`
    },
    otan_companion: {
      greeting: `Hai Pengembara! ${mascotName} sedia membimbing kamu dalam tajuk ${topicTitle}!`,
      encouragement: ["Teruskan usaha!", `Kamu semakin menguasai ${topicTitle}!`, "Bagus sekali!"],
      hint_messages: [`Fikirkan konsep asas SP ${spCode}.`, `Bandingkan jawapan dengan prinsip SK ${skCode}.`],
      celebration_messages: [`Tahniah! Misi ${topicTitle} berjaya diselesaikan dengan cemerlang! 🎉`]
    },
    steps: [
      {
        step_number: 1,
        step_type: "BRIEFING",
        title: "Pengenalan Misi",
        payload: {
          story_hook: `Di Dunia ${subject}, cabaran ${topicTitle} memerlukan perhatian anda! Konteks harian: ${realWorldAnchor}.`,
          mascot_dialogue: `Hai! Saya ${mascotName}. Hari ini kita akan mempelajari ${topicTitle} (SP ${spCode}).`
        }
      },
      {
        step_number: 2,
        step_type: "ENGAGEMENT",
        title: "Penerokaan CPA 4-Blok",
        cpa_blocks: [
          {
            block_type: "VISUAL_STORY",
            title: `Kisah Visual ${topicTitle}`,
            content: { text: visualMethod }
          },
          {
            block_type: "COMPARISON_SPLIT",
            title: `Perbandingan Kumpulan ${topicTitle}`,
            content: { left: `Kumpulan Utama A (${topicTitle})`, right: `Kumpulan Pembanding B (${topicTitle})` }
          },
          {
            block_type: "STEP_BY_STEP",
            title: `Langkah Pembelajaran ${topicTitle}`,
            content: { steps: [`Fahami masalah ${topicTitle}`, `Terapkan formulasi SP ${spCode}`, `Semak jawapan mengikut SK ${skCode}`] }
          },
          {
            block_type: "MYTH_BUSTER",
            title: `Mitos & Fakta ${topicTitle}`,
            content: { myth: misconceptionText, fact: `Dengan bimbingan berstruktur SP ${spCode}, semua murid boleh mencapai ${pbdTarget}!` }
          }
        ]
      },
      {
        step_number: 3,
        step_type: "LESSON",
        title: "Pecahan Konsep Utama",
        payload: {
          concept_summary: `Konsep asas ${topicTitle} berpandukan SK ${skCode} dan SP ${spCode} untuk murid ${grade}. Kaedah Visual: ${visualMethod}.`,
          key_points: [
            `Memahami takrifan asas bagi ${topicTitle}`,
            `Mengaplikasikan kemahiran SP ${spCode} dalam latihan harian`,
            `Mencapai penguasaan PBD sasaran ${pbdTarget}`
          ]
        }
      },
      {
        step_number: 4,
        step_type: "PRACTICE",
        title: "Latihan Interaktif Widget",
        payload: {
          widget_type: widgetType || (subject.toLowerCase().includes("matematik") ? "base_ten_blocks" : "sentence_builder"),
          interactive_data: { topic: topicTitle, targetNumber: 42, targetSentence: `Murid mengulangkaji ${topicTitle}` }
        }
      },
      {
        step_number: 5,
        step_type: "FLASHCARDS",
        title: "Kad Imbasan Terma Utama",
        cards: [
          { term: topicTitle, definition: `Istilah utama kurikulum KSSR ${grade} bagi SP ${spCode}.` },
          { term: `Standard Kandungan ${skCode}`, definition: `Rangka kemahiran asas yang menyokong pembelajaran ${topicTitle}.` }
        ]
      },
      {
        step_number: 6,
        step_type: "MINI_GAME",
        title: "Permainan Mini Pembelajaran",
        payload: {
          game_type: "SortingGame",
          game_config: { items: [`Item 1 (${topicTitle})`, `Item 2 (${topicTitle})`, `Item 3 (${topicTitle})`], targetCategory: "Kategori Utama" }
        }
      },
      {
        step_number: 7,
        step_type: "QUIZ",
        title: "Penilaian PBD",
        questions: [
          {
            question: `Apakah konsep utama bagi tajuk ${topicTitle} mengikut SP ${spCode}?`,
            options: [`Pilihan A (Konsep Tepat SP ${spCode})`, `Pilihan B (Kurang Tepat)`, `Pilihan C (Salah)`],
            correct_index: 0,
            explanation: `Pilihan A berpandukan piawaian SK ${skCode} KSSR ${grade}.`,
            tp_level: pbdTarget
          }
        ]
      },
      {
        step_number: 8,
        step_type: "COMPLETE",
        title: "Rumusan & Kiraan XP",
        payload: {
          xp_earned: 100,
          coins_earned: 25,
          mastery_summary: `Tahniah! Anda telah menguasai ${topicTitle} (SP ${spCode}) pada Tahap ${pbdTarget}!`
        }
      },
      {
        step_number: 9,
        step_type: "REWARD",
        title: "Ganjaran Lencana Misi",
        payload: {
          badge: `Wira KSSR ${subject}`,
          item_drop: `Pingat Gemilang ${topicTitle} 🏅`,
          item_icon: "🏅"
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
