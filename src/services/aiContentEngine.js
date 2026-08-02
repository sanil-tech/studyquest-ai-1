import { getSPDetails, getWidgetMapping } from './taxonomyService';

/**
 * AI Content Engine
 * 
 * Procedurally generates Gamified Lesson structures based on the DSKP Taxonomy.
 * This guarantees that ANY valid SP code can be immediately rendered into a lesson
 * even if a human teacher hasn't handcrafted one yet.
 */

export const generateLessonForSP = async (spCode, studentName = 'Pengembara') => {
  const details = getSPDetails(spCode);
  if (!details) {
    throw new Error(`SP Code ${spCode} not found in taxonomy.`);
  }

  // Determine which widget to use based on the taxonomy metadata
  const widgetMapping = getWidgetMapping(spCode) || 'base_ten_blocks'; // generic fallback

  const blocks = [];

  // Phase 1: INDUCTION (AI generated story/context)
  blocks.push({
    order_number: 1,
    block_type: "TEXT_MARKDOWN",
    pedagogical_phase: "INDUCTION",
    title: `Misi: ${details.title}`,
    payload: {
      markdown: `### Hai ${studentName}! Suku perlukan bantuan anda! 🦊\n\nHari ini, kita ada cabaran khas untuk topik **${details.title}**.\n\nMari kita bekerjasama untuk selesaikan misi ini menggunakan kemahiran baru kita.`
    }
  });

  // Phase 2: CONCEPT & INTERACTIVE (Widget)
  blocks.push({
    order_number: 2,
    block_type: "INTERACTIVE",
    pedagogical_phase: "CONCEPT",
    title: `Latihan Interaktif`,
    payload: {
      widget_type: widgetMapping,
      targetNumber: Math.floor(Math.random() * 50) + 10, // Randomized for generic fallback
      targetFraction: "1/2", 
      targetSentence: "Suku suka makan durian",
      leftVal: 50,
      rightVal: 20,
      correctRelation: "GREATER_THAN"
    }
  });

  // Phase 3: REFLECTION
  blocks.push({
    order_number: 3,
    block_type: "TEXT_MARKDOWN",
    pedagogical_phase: "REFLECTION",
    title: "Rumusan Kejayaan",
    payload: {
      markdown: `### Kerja yang Hebat!\n\nAnda berjaya menguasai **${details.title}**.\n\nTerus berlatih untuk menjadi lebih bijak!`
    }
  });

  return {
    success: true,
    lesson: {
      id: `ai_gen_${spCode}_${Date.now()}`,
      title: details.title,
      description: `Pelajaran interaktif dijana AI untuk SP ${spCode}`,
    },
    published_version: {
      id: `ai_ver_${Date.now()}`,
      version_number: 1,
      curriculum_type: "KSSR_SEMAKAN",
      year_level: "Auto-mapped", 
      subject_name: "Auto-mapped",
      sk_code: spCode.substring(0, spCode.lastIndexOf('.')),
      sp_code: spCode,
    },
    content_blocks: blocks.map((block, index) => ({
      id: `block-${index + 1}`,
      ...block
    })),
    assessments: []
  };
};
