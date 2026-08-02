// src/services/generateKSSRContent.js

export function buildKSSRBatchLesson({ subject, grade, standardCode, topicTitle }) {
  const blocks = [];

  // 1. Header Markdown Block (Introduction & Learning Objective)
  blocks.push({
    order_number: 1,
    block_type: "TEXT_MARKDOWN",
    pedagogical_phase: "INDUCTION",
    title: `Selamat datang ke modul ${topicTitle}!`,
    payload: {
      markdown: `### Objektif Pembelajaran 🎯\nHari ini kita akan belajar tentang **${topicTitle}** berpandukan Standard Pembelajaran (${standardCode}).\n\nJom mulakan pengembaraan kita bersama Suku!`
    }
  });

  // 2. Interactive Widget Block (Automatic Widget Router Logic)
  const isMath = subject.toLowerCase().includes("matematik");
  const isBM = subject.toLowerCase().includes("bahasa melayu");

  if (isMath && standardCode.includes("1.4")) {
    blocks.push({
      order_number: 2,
      block_type: "INTERACTIVE",
      pedagogical_phase: "CONCEPT",
      title: "Latihan Nilai Tempat & Digit",
      payload: {
        widget_type: "base_ten_blocks",
        targetNumber: 42
      }
    });
  } else if (isMath && standardCode.includes("1.5")) {
    blocks.push({
      order_number: 2,
      block_type: "INTERACTIVE",
      pedagogical_phase: "CONCEPT",
      title: "Bandingkan Nombor",
      payload: {
        widget_type: "number_scale",
        leftVal: 68,
        rightVal: 42,
        correctRelation: "GREATER_THAN"
      }
    });
  } else if (isMath && standardCode.includes("1.1")) {
    blocks.push({
      order_number: 2,
      block_type: "INTERACTIVE",
      pedagogical_phase: "CONCEPT",
      title: "Pecahan Asas",
      payload: {
        widget_type: "fraction_slicer",
        targetFraction: "3/4",
        shapeType: "circle"
      }
    });
  } else if (isBM) {
    blocks.push({
      order_number: 2,
      block_type: "INTERACTIVE",
      pedagogical_phase: "CONCEPT",
      title: "Jom Bina Ayat",
      payload: {
        widget_type: "sentence_builder",
        targetSentence: "Keluarga Ahmad sedang berkelah di tepi pantai"
      }
    });
  } else {
    // Default interactive block if no exact standardCode matches
    blocks.push({
      order_number: 2,
      block_type: "INTERACTIVE",
      pedagogical_phase: "CONCEPT",
      title: "Aktiviti Interaktif",
      payload: {
        widget_type: "base_ten_blocks",
        targetNumber: 35
      }
    });
  }

  // 3. Checkpoint Quiz / Explanatory Markdown Block
  blocks.push({
    order_number: 3,
    block_type: "TEXT_MARKDOWN",
    pedagogical_phase: "REFLECTION",
    title: "Rumusan Modul",
    payload: {
      markdown: "Tahniah! Anda telah berjaya menyelesaikan kembara pembelajaran hari ini. Pastikan anda mengulang kaji pelajaran untuk sentiasa cemerlang!"
    }
  });

  return blocks;
}

/**
 * Returns a complete test payload that can be rendered directly by LessonPage.jsx
 * @param {string} subject - "Matematik_Nilai", "Matematik_Banding", "Matematik_Pecahan", or "Bahasa_Melayu"
 */
export function getSampleKSSRLesson(subject = "Bahasa_Melayu") {
  let params = {
    subject: "Bahasa Melayu",
    grade: "Tahun 1",
    standardCode: "2.1.1",
    topicTitle: "Membina Ayat Tunggal"
  };

  if (subject === "Matematik_Nilai") {
    params = {
      subject: "Matematik",
      grade: "Tahun 1",
      standardCode: "1.4.1",
      topicTitle: "Nilai Tempat"
    };
  } else if (subject === "Matematik_Banding") {
    params = {
      subject: "Matematik",
      grade: "Tahun 1",
      standardCode: "1.5.1",
      topicTitle: "Membandingkan Nombor"
    };
  } else if (subject === "Matematik_Pecahan") {
    params = {
      subject: "Matematik",
      grade: "Tahun 2",
      standardCode: "1.1.1",
      topicTitle: "Pecahan Asas"
    };
  }

  const content_blocks = buildKSSRBatchLesson(params);

  return {
    success: true,
    lesson: {
      id: "test-lesson-123",
      title: params.topicTitle,
      description: "Pelajaran KSSR Janaan Automatik",
    },
    published_version: {
      id: "test-version-123",
      version_number: 1,
      curriculum_type: "KSSR_SEMAKAN",
      year_level: params.grade,
      subject_name: params.subject,
      sk_code: params.standardCode,
      sp_code: params.standardCode,
    },
    curriculum_context: {
      subject_name: params.subject,
    },
    content_blocks: content_blocks.map((block, index) => ({
      id: `block-${index + 1}`,
      ...block
    })),
    assessments: []
  };
}
