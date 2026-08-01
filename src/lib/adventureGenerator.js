import adventureSchema from "./adventurePackageSchema.json";

/**
 * StudyQuest AI Adventure Generator Service Layer (Phase 5B)
 * 
 * Transforms Curriculum Topic & Learning Standards into a full AdventurePackage.
 * Adheres strictly to /src/lib/adventurePackageSchema.json.
 */

/**
 * Generates an optimized AI Prompt string to produce an AdventurePackage
 * from a given subject, year level, topic, and learning standard.
 *
 * @param {Object} input
 * @param {string} input.subject - E.g. "Matematik", "Sains"
 * @param {string} input.year_level - E.g. "Tahun 1", "Tahun 4"
 * @param {string} input.topic - E.g. "Rumah Puluh dan Sa"
 * @param {string} [input.learning_standard] - E.g. "1.4.1 Menyatakan nilai tempat..."
 * @param {string} [input.language="Bahasa Melayu Malaysia"]
 * @returns {string} System & user prompt for LLM generation
 */
export function generateAdventurePackagePrompt({
  subject = "Matematik",
  year_level = "Tahun 1",
  topic = "Rumah Puluh dan Sa",
  learning_standard = "",
  language = "Bahasa Melayu Malaysia"
}) {
  return `
Anda ialah AI Pedagogi KSSR StudyQuest. Hasilkan pakej pengembaraan pembelajaran penuh (AdventurePackage) mengikut spesifikasi JSON schema rasmi StudyQuest.

[MAKLUMAT INPUT]:
- Subjek: ${subject}
- Tahap: ${year_level}
- Tajuk: ${topic}
- Standard Pembelajaran: ${learning_standard || "Standard KSSR yang berkaitan"}
- Bahasa: ${language}
- Maskot: Otan 🦧 (Friendly & Encouraging Learning Companion)
- Sasaran Umur: Murid 7-12 Tahun (Pendidikan Rendah Malaysia)

[STRUKTUR OUTPUT PERLU MEMATUHI 6 SEKSYEN UTAMA]:
1. "world": { "world_name", "world_icon", "theme", "description" }
2. "adventure_story": { "title", "introduction", "problem", "mission_goal" }
3. "otan_companion": { "greeting", "encouragement" [], "hint_messages" [], "celebration_messages" [] }
4. "mission_journey": Array 4 Misi Berperingkat (DISCOVER, INTERACT, PRACTICE, CHALLENGE)
   - Setiap misi mempunyai { "mission_id", "title", "stage", "objective", "content_blocks", "activity_type", "reward" }
5. "assessment": { "quiz" [], "ai_explanation", "mastery_condition" }
6. "completion_report": { "skills_mastered" [], "improvement_area", "next_recommended_adventure" }

Sila pastikan bahasa yang digunakan adalah Bahasa Melayu Malaysia yang mesra, mudah difahami, dan ceria.
`.trim();
}

/**
 * Validates whether an object adheres to basic AdventurePackage structure requirements.
 * 
 * @param {Object} pkg - Object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAdventurePackage(pkg) {
  const errors = [];
  if (!pkg || typeof pkg !== "object") {
    return { valid: false, errors: ["Pakej mestilah sebuah objek JSON."] };
  }

  const requiredSections = [
    "world",
    "adventure_story",
    "otan_companion",
    "mission_journey",
    "assessment",
    "completion_report"
  ];

  requiredSections.forEach(section => {
    if (!pkg[section]) {
      errors.push(`Seksyen wajib '${section}' tidak wujud.`);
    }
  });

  if (Array.isArray(pkg.mission_journey)) {
    if (pkg.mission_journey.length < 4) {
      errors.push("Seksyen 'mission_journey' sekurang-kurangnya mesti mengandungi 4 misi.");
    }
    const stages = pkg.mission_journey.map(m => m.stage);
    ["DISCOVER", "INTERACT", "PRACTICE", "CHALLENGE"].forEach(reqStage => {
      if (!stages.includes(reqStage)) {
        errors.push(`Misi peringkat '${reqStage}' tiada dalam mission_journey.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Service function: Generates a complete, KSSR-compliant AdventurePackage JSON.
 * Serves as the primary entrypoint for Content Studio / AI Adventure Generator service.
 *
 * @param {Object} params
 * @param {string} params.subject
 * @param {string} params.year_level
 * @param {string} params.topic
 * @param {string} [params.learning_standard]
 * @param {string} [params.language="Bahasa Melayu Malaysia"]
 * @returns {Promise<Object>} AdventurePackage JSON
 */
export async function createAdventurePackage({
  subject = "Matematik",
  year_level = "Tahun 1",
  topic = "Rumah Puluh dan Sa",
  learning_standard = "1.4.1 Menyatakan nilai tempat dan nilai digit bagi sebarang nombor",
  language = "Bahasa Melayu Malaysia"
}) {
  // Construct KSSR compliant AdventurePackage structure directly
  const packageResult = {
    world: {
      world_name: `Dunia ${subject}`,
      world_icon: subject.toLowerCase().includes("sains") ? "🔬" : "🌎",
      theme: `Pengembaraan ${topic} ${year_level}`,
      description: `Sertai Otan 🦧 meneroka konsep ${topic} mengikut Kurikulum Standard Sekolah Rendah (KSSR).`
    },
    adventure_story: {
      title: `Misteri ${topic}`,
      introduction: `Hai Pengembara! Selamat datang ke ${year_level}. Hari ini kita akan membongkar rahsia ${topic} bersama Otan!`,
      problem: `Kunci utama ${topic} tersembunyi di sebalik 4 cabaran rimba ilmu!`,
      mission_goal: `Selesaikan keempat-empat misi kembara untuk menguasai ${topic} dan menerima Lencana Kencana!`
    },
    otan_companion: {
      greeting: `Hai Pengembara! Otan sedia membantu kamu meneroka ${topic} hari ini!`,
      encouragement: [
        "Tak mengapa Pengembara. Mari Otan bantu kamu cuba cara lain.",
        "Setiap kesilapan adalah langkah menuju kejayaan!",
        "Teruskan berusaha, Otan yakin kamu pasti boleh!"
      ],
      hint_messages: [
        "Fikirkan nilai tempat dan nilai digit bagi setiap angka.",
        "Perhatikan kumpulan 10 item untuk memudahkan kiraan.",
        "Lihat carta visual Otan dengan teliti."
      ],
      celebration_messages: [
        "Hebat Pengembara! Otan bangga dengan usaha kamu!",
        "Luar biasa! Jawapan yang amat tepat dan bijak!",
        "Syabas! Kamu kini pakar dalam topik ini!"
      ]
    },
    mission_journey: [
      {
        mission_id: `misi-1-discover`,
        title: `Penemuan Konsep ${topic}`,
        stage: "DISCOVER",
        objective: `Meneroka dan memahami asas ${topic}.`,
        content_blocks: [
          {
            type: "text",
            content: `Mari kita fahami asas ${topic} bersama Otan!`
          }
        ],
        activity_type: "visual_discovery",
        reward: {
          xp: 50,
          coins: 15,
          badge: "Peneroka Alam"
        }
      },
      {
        mission_id: `misi-2-interact`,
        title: `Terokai Visual Interaktif`,
        stage: "INTERACT",
        objective: `Menguji susunan dan gerak kerja visual ${topic}.`,
        content_blocks: [
          {
            type: "interactive",
            content: `Gerakkan objek untuk membina kefahaman ${topic}.`
          }
        ],
        activity_type: "interactive_drag_drop",
        reward: {
          xp: 75,
          coins: 20,
          badge: "Pakar Interaktif"
        }
      },
      {
        mission_id: `misi-3-practice`,
        title: `Latihan Pengukuhan Kembara`,
        stage: "PRACTICE",
        objective: `Menjawab soalan-soalan latihan bagi mengukuhkan kefahaman.`,
        content_blocks: [
          {
            type: "quiz_practice",
            content: `Selesaikan soalan pengukuhan berikut.`
          }
        ],
        activity_type: "guided_practice",
        reward: {
          xp: 100,
          coins: 25,
          badge: "Wira Latihan"
        }
      },
      {
        mission_id: `misi-4-challenge`,
        title: `Cabaran Boss Utama: ${topic}`,
        stage: "CHALLENGE",
        objective: `Menunjukkan penguasaan penuh dalam cabaran akhir.`,
        content_blocks: [
          {
            type: "boss_challenge",
            content: `Kalahkan cabaran Boss dengan jawapan yang tepat!`
          }
        ],
        activity_type: "boss_quiz",
        reward: {
          xp: 150,
          coins: 40,
          badge: "Juara Kembara"
        }
      }
    ],
    assessment: {
      quiz: [
        {
          question: `Apakah konsep utama bagi ${topic}?`,
          options: [
            "Memahami nilai dan kedudukan",
            "Menghafal tanpa memahami",
            "Mengaburkan angka",
            "Tiada jawapan tepat"
          ],
          correct_index: 0,
          explanation: `Penguasaan ${topic} memerlukan kefahaman nilai dan kedudukan yang betul.`
        }
      ],
      ai_explanation: `Murid telah menunjukkan kefahaman yang kukuh dalam ${topic} (${learning_standard}).`,
      mastery_condition: {
        min_accuracy: 0.75,
        pass_score: 80
      }
    },
    completion_report: {
      skills_mastered: [
        `Penguasaan Asas ${topic}`,
        `Aplikasi Standard Pembelajaran ${learning_standard.split(" ")[0] || ""}`
      ],
      improvement_area: "Latihan berterusan untuk kepantasan menjawab.",
      next_recommended_adventure: {
        world_name: `Dunia ${subject}`,
        adventure_title: `Pengembaraan Lanjutan ${topic}`,
        topic_slug: topic.toLowerCase().replace(/\s+/g, "-")
      }
    }
  };

  const validation = validateAdventurePackage(packageResult);
  if (!validation.valid) {
    console.warn("AdventurePackage Validation Warnings:", validation.errors);
  }

  return packageResult;
}

export { adventureSchema };
