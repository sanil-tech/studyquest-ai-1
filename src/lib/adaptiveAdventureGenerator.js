import { analyzeLearningProfile, buildStudentLearningProfile } from "./learningProfileEngine.js";
import { validateAdventurePackage } from "./adventureGenerator.js";

/**
 * StudyQuest AI Adaptive Adventure Generator (Phase 6B)
 * 
 * Generates an entirely NEW mini AdventurePackage tailored to a student's
 * learning profile, strengths, weaknesses, hint usage, and mastery level.
 * 
 * Fully compatible with:
 * - /src/lib/adventurePackageSchema.json
 * - LessonAdventure.jsx
 * - AdventureMap.jsx
 * - MissionStage.jsx
 */

export const ADVENTURE_TYPES = {
  RECOVERY: "Recovery Adventure",
  REVISION: "Revision Adventure",
  MASTER: "Master Adventure",
  CHALLENGE: "Challenge Adventure",
  ELITE: "Elite Adventure"
};

/**
 * Determines the appropriate Adventure Type based on profile analytics.
 *
 * @param {Object} analysis - Output from analyzeLearningProfile()
 * @returns {string} One of ADVENTURE_TYPES
 */
export function determineAdventureType(analysis) {
  if (!analysis) return ADVENTURE_TYPES.REVISION;

  const { mastery_level, confidence_score = 50, weaknesses = [] } = analysis;

  if (confidence_score >= 90 && weaknesses.length === 0) {
    return ADVENTURE_TYPES.ELITE;
  }
  if (mastery_level === "MASTER" || confidence_score >= 80) {
    return ADVENTURE_TYPES.CHALLENGE;
  }
  if (mastery_level === "PROFICIENT" || confidence_score >= 65) {
    return ADVENTURE_TYPES.MASTER;
  }
  if (mastery_level === "DEVELOPING" || confidence_score >= 45) {
    return ADVENTURE_TYPES.REVISION;
  }
  return ADVENTURE_TYPES.RECOVERY;
}

/**
 * Builds an AI Prompt string for LLM generation of an adaptive adventure.
 *
 * @param {Object} params
 * @param {Object} params.learningProfile
 * @param {Object} [params.originalAdventure]
 * @param {string} params.subject
 * @param {string} params.year
 * @param {string} params.topic
 * @returns {string} System and User Prompt
 */
export function buildAdaptiveAdventurePrompt({
  learningProfile,
  originalAdventure,
  subject = "Matematik",
  year = "Tahun 1",
  topic = "Rumah Puluh dan Sa"
}) {
  const profileAnalysis = analyzeLearningProfile(
    learningProfile || buildStudentLearningProfile()
  );
  const adventureType = determineAdventureType(profileAnalysis);

  return `
Anda ialah AI Pedagogi KSSR StudyQuest. Hasilkan pakej Kembara Adaptif (Adaptive AdventurePackage) berpandukan profil murid berikut.

[PROFIL PEMBELAJARAN MURID]:
- Subjek: ${subject} (${year})
- Tajuk: ${topic}
- Jenis Kembara Adaptif: ${adventureType}
- Tahap Penguasaan: ${profileAnalysis.mastery_level}
- Skor Keyakinan: ${profileAnalysis.confidence_score}/100
- Kekuatan: ${profileAnalysis.strengths.join(", ") || "Sedang dibina"}
- Kelemahan: ${profileAnalysis.weaknesses.join(", ") || "Tiada kelemahan ketara"}
- Fokus Pengukuhan: Selesaikan salah faham tajuk ${topic}

[OBJEKTIF AI]:
Hasilkan penceritaan Kembara BAHARU (4-6 Misi) khas untuk topik ini. Jangan ulang penceritaan lama daripada pengembaraan asal. Fokus kepada konsep yang memerlukan penambahbaikan atau cabaran lanjutan.

[STRUKTUR JSON OUTPUT]:
Mesti mengandungi 7 seksyen utama:
1. world: { world_name, world_icon, theme, description }
2. adventure_story: { title, introduction, problem, mission_goal }
3. otan_companion: { greeting, encouragement [], hint_messages [], celebration_messages [] }
4. mission_journey: Array 4-6 Misi (mempunyai mission_id, title, story, objective, stage [DISCOVER, INTERACT, PRACTICE, CHALLENGE], activity, difficulty, estimated_time, reward, recommended_hint, content_blocks)
5. assessment: { quiz [] (5-10 soalan adaptif mengikut tahap), ai_explanation, mastery_condition }
6. completion_report: { skills_mastered [], remaining_weaknesses [], confidence_change, recommended_next_topic, otan_final_message, next_recommended_adventure }
7. metadata: { generated_at, generator_version, based_on_topic, based_on_mastery, estimated_learning_time, adventure_type }

Sila pastikan bahasa yang digunakan adalah Bahasa Melayu Malaysia KSSR yang mesra, menyeronokkan, dan tepat secara pedagogi.
`.trim();
}

/**
 * Validates an Adaptive AdventurePackage object against schema and rules.
 *
 * @param {Object} pkg
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAdaptiveAdventurePackage(pkg) {
  const baseValidation = validateAdventurePackage(pkg);
  const errors = [...baseValidation.errors];

  if (!pkg.metadata) {
    errors.push("Seksyen 'metadata' wajib wujud dalam Adaptive AdventurePackage.");
  } else {
    if (!pkg.metadata.adventure_type) {
      errors.push("Metadata 'adventure_type' tidak dinyatakan.");
    }
  }

  if (pkg.assessment && Array.isArray(pkg.assessment.quiz)) {
    if (pkg.assessment.quiz.length < 5) {
      errors.push("Soalan penilaian adaptif sekurang-kurangnya mesti mengandungi 5 soalan.");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main Function: Generates an AI Adaptive Adventure Package.
 *
 * @param {Object} params
 * @param {Object} [params.learningProfile] - Student's learning profile
 * @param {Object} [params.originalAdventure] - Base adventure reference
 * @param {string} [params.subject="Matematik"] - Subject name
 * @param {string} [params.year="Tahun 1"] - Year level
 * @param {string} [params.topic="Rumah Puluh dan Sa"] - Curriculum topic
 * @returns {Promise<Object>} Complete Adaptive AdventurePackage JSON
 */
export async function generateAdaptiveAdventurePackage({
  learningProfile,
  originalAdventure = null,
  subject = "Matematik",
  year = "Tahun 1",
  topic = "Rumah Puluh dan Sa"
}) {
  const profileAnalysis = analyzeLearningProfile(
    learningProfile || buildStudentLearningProfile()
  );

  const adventureType = determineAdventureType(profileAnalysis);
  const isRecovery = adventureType === ADVENTURE_TYPES.RECOVERY;
  const isEliteOrChallenge =
    adventureType === ADVENTURE_TYPES.ELITE || adventureType === ADVENTURE_TYPES.CHALLENGE;

  // 1. World Layer
  const world = {
    world_name: `Dunia ${subject} Adaptif`,
    world_icon: isRecovery ? "🩹" : isEliteOrChallenge ? "👑" : "🌟",
    theme: `${adventureType}: ${topic}`,
    description: `Kembara khas Otan 🦧 yang disesuaikan mengikut tahap penguasaan ${profileAnalysis.mastery_level} anda.`
  };

  // 2. Adventure Story
  const adventure_story = {
    title: `Misi ${adventureType}: Kunci ${topic}`,
    introduction: isRecovery
      ? `Hai Pengembara! Otan perhatikan kamu memerlukan sedikit bantuan tambahan untuk menguasai ${topic}. Jangan risau, Otan akan membimbing kamu langkah demi langkah!`
      : isEliteOrChallenge
      ? `Salam Wira Kembara! Kamu telah menunjukkan kehebatan luar biasa. Otan menjemput kamu ke Cabaran Mahkota ${topic}!`
      : `Hai Pengembara! Mari kita perkukuhkan pemahaman kamu dalam ${topic} melalui kembara pintar Otan!`,
    problem: isRecovery
      ? `Beberapa laluan angka ${topic} agak keliru dan memerlukan bantuan penjelas visual Otan.`
      : `Cabaran masa dan teka-teki bertingkat ${topic} menantikan keputusan bijak anda!`,
    mission_goal: `Selesaikan misi kembara adaptif untuk membina keyakinan dan menguasai ${topic} 100%!`,
  };

  // 3. Otan Companion Layer
  const otan_companion = {
    greeting: `Hai! Otan di sini bersedia dengan panduan adaptif khas untuk kamu dalam ${topic}!`,
    encouragement: [
      "Bagus! Mari kita fikirkan bersama Otan.",
      "Setiap percubaan membuatkan minda kamu semakin tajam!",
      "Jangan putus asa, Otan percaya pada kebolehan kamu!"
    ],
    hint_messages: [
      `Gunakan petunjuk visual untuk mengelompokkan nombor dalam ${topic}.`,
      "Perhatikan pola angka dengan teliti sebelum memilih jawapan.",
      "Cerakin mengikut nilai tempat puluh dan sa."
    ],
    celebration_messages: [
      "Luar biasa! Penguasaan adaptif kamu semakin mantap!",
      "Tahniah! Otan kagum dengan peningkatan fokus kamu!",
      "Syabas! Kamu berjaya menewaskan cabaran ini!"
    ]
  };

  // 4. Mission Journey (4 to 6 Adaptive Missions)
  const mission_journey = [
    {
      mission_id: "misi-1-discover",
      title: `Peringkat 1: Penemuan Konsep Adaptif`,
      story: `Otan membimbing anda mengenali asas penting ${topic}.`,
      stage: "DISCOVER",
      objective: `Memahami konsep asas ${topic} dengan visual mudah.`,
      activity: "visual_guided_discovery",
      difficulty: isRecovery ? "MUDAH" : "SEDERHANA",
      estimated_time: "3 minit",
      reward: { xp: 50, coins: 15, badge: "Peneroka Adaptif" },
      recommended_hint: "Lihat carta warna yang disediakan oleh Otan.",
      content_blocks: [
        {
          type: "text",
          content: `Mari kita imbas kembali asas ${topic} mengikut tahap anda.`
        }
      ]
    },
    {
      mission_id: "misi-2-interact",
      title: `Peringkat 2: Terokai Visual & Interaksi`,
      story: `Selesaikan teka-teki visual untuk membuka pintu kembara berikutnya.`,
      stage: "INTERACT",
      objective: `Mengaplikasikan kefahaman melalui susunan interaktif.`,
      activity: "interactive_drag_drop",
      difficulty: "SEDERHANA",
      estimated_time: "4 minit",
      reward: { xp: 75, coins: 20, badge: "Pakar Interaktif" },
      recommended_hint: "Padankan nombor dengan nilai tempat yang betul.",
      content_blocks: [
        {
          type: "interactive",
          content: `Susun kad angka mengikut tempat nilai yang tepat.`
        }
      ]
    },
    {
      mission_id: "misi-3-practice",
      title: `Peringkat 3: Latihan Pengukuhan Pintar`,
      story: `Otan menguji ketepatan anda dengan soalan-soalan terarah.`,
      stage: "PRACTICE",
      objective: `Menjawab soalan pengukuhan untuk mengurangkan kesilapan berulang.`,
      activity: "guided_practice",
      difficulty: isEliteOrChallenge ? "SUKAR" : "SEDERHANA",
      estimated_time: "5 minit",
      reward: { xp: 100, coins: 25, badge: "Wira Pengukuhan" },
      recommended_hint: "Semak semula jawapan sebelum menghantar.",
      content_blocks: [
        {
          type: "quiz_practice",
          content: `Jawab soalan latihan pengukuhan berikut.`
        }
      ]
    },
    {
      mission_id: "misi-4-challenge",
      title: `Peringkat 4: Cabaran Kemuncak Otan`,
      story: `Selesaikan soalan bertingkat untuk membuktikan penguasaan sebenar!`,
      stage: "CHALLENGE",
      objective: `Mencapai ketepatan tinggi dalam cabaran kemuncak adaptif.`,
      activity: "boss_quiz",
      difficulty: isEliteOrChallenge ? "ELITE" : "SUKAR",
      estimated_time: "5 minit",
      reward: { xp: 150, coins: 40, badge: "Juara Adaptif" },
      recommended_hint: "Gunakan kemahiran yang telah dipelajari dalam misi 1-3.",
      content_blocks: [
        {
          type: "boss_challenge",
          content: `Kalahkan cabaran utama dan dapatkan ganjaran!`
        }
      ]
    }
  ];

  // If Challenge or Elite, add a 5th and 6th bonus mission
  if (isEliteOrChallenge) {
    mission_journey.push({
      mission_id: "misi-5-elite-challenge",
      title: "Peringkat 5: Cabaran Mahkota Minda",
      story: "Otan memberikan soalan aplikasi KBAT aras tinggi khas untuk murid elit!",
      stage: "CHALLENGE",
      objective: "Menjawab soalan KBAT dengan pantas dan tepat.",
      activity: "kbat_challenge",
      difficulty: "ELITE",
      estimated_time: "4 minit",
      reward: { xp: 200, coins: 50, badge: "Master KBAT" },
      recommended_hint: "Analisis maklumat soalan dengan mendalam.",
      content_blocks: [
        {
          type: "kbat_quiz",
          content: "Selesaikan soalan KBAT aras tinggi ini!"
        }
      ]
    });
  }

  // 5. Assessment (5 - 10 Adaptive Quiz Questions)
  const quizQuestionsCount = isEliteOrChallenge ? 8 : 5;
  const quiz = [];
  for (let i = 1; i <= quizQuestionsCount; i++) {
    quiz.push({
      question: `Soalan Adaptif ${i}: Apakah jawapan yang betul bagi latihan ${topic}?`,
      options: [
        `Jawapan Tepat ${i} (Mengikut Konsep)`,
        `Pilihan Keliru A`,
        `Pilihan Keliru B`,
        `Pilihan Keliru C`
      ],
      correct_index: 0,
      explanation: `Penjelasan AI: Konsep ini menekankan aplikasi nilai dan struktur nombor yang tepat bagi ${topic}.`,
      learning_objective: `Menguasai kemahiran sub-topik ${i} bagi ${topic}`,
      difficulty: isRecovery ? "MUDAH" : i > 5 ? "SUKAR" : "SEDERHANA"
    });
  }

  const assessment = {
    quiz,
    ai_explanation: `Penilaian adaptif ini dibina khas berdasarkan profil pembelajaran (${profileAnalysis.mastery_level}) untuk mengukuhkan topik ${topic}.`,
    mastery_condition: {
      min_accuracy: isRecovery ? 0.65 : 0.8,
      pass_score: isRecovery ? 70 : 85
    }
  };

  // 6. Completion Report
  const completion_report = {
    skills_mastered: [
      `Penguasaan Adaptif ${topic}`,
      `Aplikasi Peringkat ${adventureType}`
    ],
    remaining_weaknesses: profileAnalysis.weaknesses.length > 0
      ? profileAnalysis.weaknesses
      : ["Tiada kelemahan utama dikesan"],
    confidence_change: "+15%",
    recommended_next_topic: originalAdventure?.completion_report?.next_recommended_adventure?.topic_slug || "cabaran-lanjutan",
    otan_final_message: `Tahniah Pengembara! Kamu telah menyelesaikan Kembara Adaptif (${adventureType}). Otan bangga dengan ketabahan kamu! 🦧🌟`,
    next_recommended_adventure: {
      world_name: world.world_name,
      adventure_title: `Pengembaraan Lanjutan ${topic}`,
      topic_slug: topic.toLowerCase().replace(/\s+/g, "-")
    }
  };

  // 7. Metadata
  const metadata = {
    generated_at: new Date().toISOString(),
    generator_version: "v1.0-adaptive",
    based_on_topic: topic,
    based_on_mastery: profileAnalysis.mastery_level,
    estimated_learning_time: isEliteOrChallenge ? "18 - 25 Minit" : "12 - 15 Minit",
    adventure_type: adventureType
  };

  const packageResult = {
    world,
    adventure_story,
    otan_companion,
    mission_journey,
    assessment,
    completion_report,
    metadata
  };

  // Validate package
  const validation = validateAdaptiveAdventurePackage(packageResult);
  if (!validation.valid) {
    console.warn("Adaptive AdventurePackage Validation Warnings:", validation.errors);
  }

  return packageResult;
}

export default {
  ADVENTURE_TYPES,
  determineAdventureType,
  buildAdaptiveAdventurePrompt,
  validateAdaptiveAdventurePackage,
  generateAdaptiveAdventurePackage
};
