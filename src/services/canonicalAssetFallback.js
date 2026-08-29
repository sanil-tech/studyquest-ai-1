// src/services/canonicalAssetFallback.js
/**
 * Canonical Asset Fallback & Reference Library
 * Provides pre-calibrated, KSSR DSKP-aligned 7-block lesson assets
 * for immediate interactive preview and assessment in Admin Content Studio.
 */

export const CANONICAL_FALLBACK_SP_MAP = {
  "1.1.1": {
    topic: "Nombor hingga 100",
    subtopic: "Banyak dan Sedikit",
    sp_code: "1.1.1",
    sk_code: "1.1",
    subject: "Matematik",
    grade: "Tahun 1",
    curriculum: "KSSR Semakan",
    blocks: {
      LESSON_HOOK: {
        id: "ast_1_1_1_hook",
        asset_type: "LESSON_HOOK",
        block_type: "STORY_HOOK",
        title: "Kembara Mencari Kerang di Pantai Suku",
        status: "draft",
        quality_score: 96,
        content_markdown: "Hai Kawan! Saya Suku Penyu 🐢. Hari ini Suku pergi ke pantai dan jumpa dua timbunan kerang yang sangat cantik. Satu timbunan ada banyak kerang, dan satu lagi cuma ada sedikit. Jom bantu Suku bezakan mana satu yang banyak!",
        voice_script: "Hai Kawan! Saya Suku Penyu. Jom bantu Suku bezakan timbunan kerang di pantai!",
        payload: {
          title: "Kembara Mencari Kerang di Pantai Suku",
          story_hook: "Suku Penyu sedang mengumpul kerang berwarna-warni di tepi pantai. Suku ada dua bakul: satu bakul penuh dengan kerang (banyak), dan satu bakul lagi cuma ada 2 biji kerang (sedikit).",
          mascot_dialogue: "Hai {student_name}! Boleh tolong Suku pilih bakul yang ada BANYAK kerang tak? Jom kita mulakan pengembaraan!",
          help_continuation: "Bantu Suku Penyu dengan memerhatikan bilangan objek dalam setiap kumpulan dan bandingkan kuantitinya.",
          visual_description: "Suku Penyu the friendly cartoon turtle standing on a tropical beach next to two wooden baskets, one overflowing with colorful sea shells and one containing just two shells, bright 3D cartoon style",
          image_prompt: "Cute 3D cartoon baby sea turtle on sunny beach with two baskets of shells, high quality educational illustration",
          dialogue_template: "Hai {student_name}! Jom bantu Suku bezakan banyak dan sedikit!",
          topic: "Nombor hingga 100",
          subject: "Matematik",
          grade: "Tahun 1"
        }
      },
      LESSON_OBJECTIVE: {
        id: "ast_1_1_1_objective",
        asset_type: "LESSON_OBJECTIVE",
        block_type: "LEARNING_OBJECTIVE",
        title: "Objektif Pembelajaran: Membanding Kuantiti",
        status: "draft",
        quality_score: 98,
        content_markdown: "Saya boleh membandingkan dua kumpulan objek untuk menyatakan kumpulan yang banyak atau sedikit.",
        voice_script: "Saya boleh membandingkan dua kumpulan objek untuk menyatakan kumpulan yang banyak atau sedikit.",
        payload: {
          title: "Objektif Pembelajaran",
          i_can_statement: "Saya boleh membandingkan dua kumpulan objek untuk menentukan banyak atau sedikit.",
          tp_badge: "TP1",
          focus_skill: "Membanding Kuantiti Secara Intuitif"
        }
      },
      CONCEPT: {
        id: "ast_1_1_1_concept",
        asset_type: "CONCEPT",
        block_type: "CONCEPT_CPA",
        title: "Konsep CPA: Banyak, Sedikit & Sama Banyak",
        status: "draft",
        quality_score: 95,
        content_markdown: "Konsep Perbandingan Kuantiti:\n- **Banyak**: Kumpulan dengan kuantiti yang lebih besar.\n- **Sedikit**: Kumpulan dengan kuantiti yang lebih kecil.\n- **Sama Banyak**: Kedua-dua kumpulan mempunyai bilangan objek yang sama.",
        voice_script: "Banyak bermaksud bilangan yang lebih besar, sedikit bermaksud bilangan yang lebih kecil.",
        payload: {
          title: "Konsep CPA: Kenali Banyak dan Sedikit",
          concept_model: "compare_quantities",
          concrete: {
            title: "1. Konkrit (Lihat & Kira Objek)",
            explanation: "Tengok 7 biji epal merah di sebelah kiri 🍎🍎🍎🍎🍎🍎🍎 dan 2 biji epal hijau di sebelah kanan 🍏🍏. 7 epal adalah BANYAK, 2 epal adalah SEDIKIT.",
            visual_type: "comparison",
            count_a: 7,
            count_b: 2,
            label_a: "Kumpulan A: 7 Epal (BANYAK)",
            label_b: "Kumpulan B: 2 Epal (SEDIKIT)",
            object_emoji: "🍎"
          },
          pictorial: {
            title: "2. Bergambar (Padanan Satu-ke-Satu)",
            explanation: "Padankan satu epal merah dengan satu epal hijau. Kumpulan merah ada baki yang tidak berpasangan, jadi kumpulan merah adalah LEBIH BANYAK!",
            visual_type: "comparison",
            count_top: 7,
            count_bottom: 2,
            label_top: "7 Epal Merah",
            label_bottom: "2 Epal Hijau"
          },
          abstract: {
            title: "3. Abstrak (Simbol & Istilah Matematik)",
            explanation: "Gunakan perkataan BANYAK untuk kuantiti lebih, dan SEDIKIT untuk kuantiti kurang.",
            key_term: "Banyak & Sedikit",
            key_definition: "Banyak = Kuantiti Lebih. Sedikit = Kuantiti Kurang."
          }
        }
      },
      WORKED_EXAMPLE: {
        id: "ast_1_1_1_example",
        asset_type: "WORKED_EXAMPLE",
        block_type: "WORKED_EXAMPLE",
        title: "Contoh Penyelesaian: Banding Biskut Siti & Ali",
        status: "draft",
        quality_score: 94,
        content_markdown: "Siti ada sepinggan biskut coklat (8 keping), manakala Ali ada 3 keping biskut. Pinggan siapakah yang mempunyai biskut LEBIH BANYAK?",
        voice_script: "Mari kita selesaikan bersama Siti dan Ali!",
        payload: {
          title: "Contoh Langkah demi Langkah",
          problem_statement: "Siti ada 8 keping biskut 🍪. Ali ada 3 keping biskut 🍪. Siapa yang ada biskut LEBIH BANYAK?",
          solution_steps: [
            "Langkah 1: Kira biskut Siti di piring pertama — ada 8 keping 🍪🍪🍪🍪🍪🍪🍪🍪.",
            "Langkah 2: Kira biskut Ali di piring kedua — ada 3 keping 🍪🍪🍪.",
            "Langkah 3: Bandingkan — 8 adalah lebih besar daripada 3. Maka, Siti ada biskut BANYAK!"
          ],
          common_mistake: "Jangan keliru dengan saiz pinggan; kita mesti mengira bilangan objek sebenar!",
          correct_reasoning: "8 keping biskut adalah kuantiti yang lebih banyak daripada 3 keping biskut.",
          visual_aid: {
            type: "comparison",
            left_count: 8,
            right_count: 3,
            left_label: "Siti (8 biskut)",
            right_label: "Ali (3 biskut)",
            object_emoji: "🍪"
          }
        }
      },
      GUIDED_PRACTICE: {
        id: "ast_1_1_1_practice",
        asset_type: "GUIDED_PRACTICE",
        block_type: "INTERACTIVE_PRACTICE",
        title: "Aktiviti Interaktif: Asingkan Banyak & Sedikit",
        status: "draft",
        quality_score: 92,
        content_markdown: "Tolak atau tekan kad objek ke dalam kotak kategori 'Banyak' atau 'Sedikit'.",
        voice_script: "Tolong Suku Penyu asingkan kumpulan yang banyak dan sedikit!",
        payload: {
          title: "Latihan Interaktif Bersama Suku",
          widget_type: "drag_and_drop",
          instruction: "Asingkan kumpulan objek di bawah ke dalam kategori 'BANYAK' atau 'SEDIKIT'!",
          seed_data: {
            categories: ["BANYAK", "SEDIKIT"],
            items: [
              { id: "item-1", label: "🌟🌟🌟🌟🌟🌟🌟🌟 8 Bintang", category: "BANYAK" },
              { id: "item-2", label: "🌟🌟 2 Bintang", category: "SEDIKIT" },
              { id: "item-3", label: "🎈🎈🎈🎈🎈🎈 6 Belon", category: "BANYAK" },
              { id: "item-4", label: "🎈 1 Belon", category: "SEDIKIT" }
            ]
          }
        }
      },
      QUIZ_QUESTION: {
        id: "ast_1_1_1_quiz",
        asset_type: "QUIZ_QUESTION",
        block_type: "KNOWLEDGE_CHECK",
        title: "Semakan Pengetahuan (Quiz Formatif)",
        status: "draft",
        quality_score: 95,
        content_markdown: "Soalan 1: Antara Kumpulan A (9 guli) dan Kumpulan B (4 guli), yang manakah SEDIKIT?",
        voice_script: "Jawab soalan uji minda ini untuk mendapatkan mata XP!",
        payload: {
          title: "Ujian Minda Suku Penyu",
          questions: [
            {
              stem: "Kumpulan A ada 9 biji guli 🔵🔵🔵🔵🔵🔵🔵🔵🔵. Kumpulan B ada 4 biji guli 🔵🔵🔵🔵. Kumpulan manakah yang SEDIKIT?",
              options: [
                "Kumpulan A (9 biji)",
                "Kumpulan B (4 biji)",
                "Kedua-duanya sama"
              ],
              correct_index: 1,
              explanation: "Tepat sekali! 4 biji guli adalah kuantiti yang lebih sedikit berbanding 9 biji guli."
            },
            {
              stem: "Pak Abu petik 10 biji manggis 🫐. Pak Ali petik 10 biji manggis 🫐. Apakah perbandingan kuantiti manggis mereka?",
              options: [
                "Pak Abu lebih banyak",
                "Pak Ali lebih banyak",
                "Sama banyak"
              ],
              correct_index: 2,
              explanation: "Hebat! Kerana kedua-dua Pak Abu dan Pak Ali mempunyai 10 biji manggis, kuantiti mereka adalah SAMA BANYAK."
            }
          ]
        }
      },
      REFLECTION: {
        id: "ast_1_1_1_reflection",
        asset_type: "REFLECTION",
        block_type: "KEY_TAKEAWAY",
        title: "Rumusan Kunci & Refleksi Misi",
        status: "draft",
        quality_score: 97,
        content_markdown: "Rumusan Hari Ini:\n1. BANYAK = Kumpulan dengan bilangan lebih besar.\n2. SEDIKIT = Kumpulan dengan bilangan lebih kecil.\n3. SAMA BANYAK = Kuantiti yang setara tanpa perbezaan.",
        voice_script: "Tahniah kawan! Anda telah berjaya menguasai kemahiran membanding kuantiti hari ini.",
        payload: {
          title: "Tahniah! Anda Hebat!",
          summary_points: [
            "Banyak ialah kumpulan yang mempunyai lebih banyak bilangan objek.",
            "Sedikit ialah kumpulan yang mempunyai lebih kurang bilangan objek.",
            "Sama banyak ialah apabila dua kumpulan mempunyai bilangan yang sama tepat."
          ],
          mascot_celebration: "Suku Penyu bangga dengan anda! Anda sudah bersedia untuk Misi Seterusnya!",
          badge_earned: "Pakar Kuantiti Intuitif 🏅"
        }
      }
    }
  }
};

/**
 * Get canonical assets for a given SP code
 */
export function getCanonicalAssetsForSP(spCode) {
  const cleanCode = String(spCode || "").replace(/^SP\s*/i, "").trim();
  const found = CANONICAL_FALLBACK_SP_MAP[cleanCode];
  if (found) return found;

  // Generic fallback if specific SP is not custom seeded
  return {
    topic: "KSSR Kurikulum",
    subtopic: `Unit SP ${cleanCode}`,
    sp_code: cleanCode,
    sk_code: cleanCode.split(".").slice(0, 2).join("."),
    subject: "Matematik",
    grade: "Tahun 1",
    curriculum: "KSSR Semakan",
    blocks: {
      LESSON_HOOK: {
        id: `ast_${cleanCode}_hook`,
        asset_type: "LESSON_HOOK",
        block_type: "STORY_HOOK",
        title: `Pengenalan Misi SP ${cleanCode}`,
        status: "draft",
        quality_score: 95,
        content_markdown: `Hai Kawan! Saya Suku Penyu 🐢. Mari kita mulakan pengembaraan pembelajaran kemahiran SP ${cleanCode}!`,
        voice_script: `Hai Kawan! Saya Suku Penyu. Jom belajar SP ${cleanCode} bersama-sama!`,
        payload: {
          title: `Pengenalan Misi SP ${cleanCode}`,
          story_hook: `Suku Penyu mengajak anda meneroka topik pembelajaran baharu bagi SP ${cleanCode}.`,
          mascot_dialogue: `Hai {student_name}! Jom kita kuasai kemahiran ini bersama-sama!`,
          visual_description: "Suku Penyu standing in a colorful learning classroom with animated maths numbers and fun props, 3D cartoon style",
          image_prompt: "Cute 3D cartoon turtle learning with math objects in bright sunny room",
          topic: "Matematik KSSR",
          subject: "Matematik",
          grade: "Tahun 1"
        }
      },
      LESSON_OBJECTIVE: {
        id: `ast_${cleanCode}_objective`,
        asset_type: "LESSON_OBJECTIVE",
        block_type: "LEARNING_OBJECTIVE",
        title: `Objektif Pembelajaran SP ${cleanCode}`,
        status: "draft",
        quality_score: 95,
        content_markdown: `Saya boleh menguasai kemahiran standard pembelajaran SP ${cleanCode}.`,
        voice_script: `Saya boleh menguasai kemahiran standard pembelajaran SP ${cleanCode}.`,
        payload: {
          title: "Objektif Pembelajaran",
          i_can_statement: `Saya boleh menguasai kemahiran SP ${cleanCode} dengan yakin.`,
          tp_badge: "TP1",
          focus_skill: `Standard Pembelajaran ${cleanCode}`
        }
      },
      CONCEPT: {
        id: `ast_${cleanCode}_concept`,
        asset_type: "CONCEPT",
        block_type: "CONCEPT_CPA",
        title: `Penerokaan Konsep SP ${cleanCode}`,
        status: "draft",
        quality_score: 94,
        content_markdown: `Penerokaan konsep asas Konkrit, Bergambar dan Abstrak bagi SP ${cleanCode}.`,
        voice_script: `Mari fahami konsep utama ini bersama-sama.`,
        payload: {
          title: `Konsep Utama SP ${cleanCode}`,
          concept_model: "count_and_name",
          concrete: {
            title: "1. Konkrit (Objek Sebenar)",
            explanation: "Perhatikan objek pembelajaran di skrin anda dan kira bilangannya.",
            visual_type: "single_count",
            count: 5,
            label: "5 Objek Pembelajaran",
            object_emoji: "⭐"
          },
          pictorial: {
            title: "2. Bergambar (Rajah Visual)",
            explanation: "Gunakan rajah atau susunan visual untuk memahami konsep ini dengan mudah.",
            visual_type: "single_count",
            count: 5,
            label: "Susunan Objek Bergambar"
          },
          abstract: {
            title: "3. Abstrak (Simbol)",
            explanation: "Gunakan angka dan simbol matematik yang tepat.",
            key_term: `SP ${cleanCode}`,
            key_definition: `Konsep penting dalam Standard Pembelajaran ${cleanCode}.`
          }
        }
      },
      WORKED_EXAMPLE: {
        id: `ast_${cleanCode}_example`,
        asset_type: "WORKED_EXAMPLE",
        block_type: "WORKED_EXAMPLE",
        title: `Contoh Praktikal SP ${cleanCode}`,
        status: "draft",
        quality_score: 93,
        content_markdown: `Mari kita lihat contoh penyelesaian langkah demi langkah untuk SP ${cleanCode}.`,
        voice_script: `Mari kita lihat contoh ini.`,
        payload: {
          title: "Contoh Penyelesaian Langkah demi Langkah",
          problem_statement: `Bagaimanakah cara menyelesaikan soalan berkaitan kemahiran SP ${cleanCode}?`,
          solution_steps: [
            "Langkah 1: Baca dan fahami arahan soalan dengan teliti.",
            "Langkah 2: Kenal pasti kata kunci dan maklumat yang diberi.",
            "Langkah 3: Tuliskan jawapan yang betul mengikut kaedah yang dipelajari."
          ],
          common_mistake: "Elakkan gopoh semasa mengira atau membuat pilihan jawapan.",
          correct_reasoning: "Semak semula langkah penyelesaian untuk memastikan jawapan tepat."
        }
      },
      GUIDED_PRACTICE: {
        id: `ast_${cleanCode}_practice`,
        asset_type: "GUIDED_PRACTICE",
        block_type: "INTERACTIVE_PRACTICE",
        title: `Latihan Interaktif SP ${cleanCode}`,
        status: "draft",
        quality_score: 92,
        content_markdown: `Lakukan aktiviti interaktif ini untuk mengukuhkan kefahaman anda.`,
        voice_script: `Jom buat latihan interaktif ini!`,
        payload: {
          title: "Aktiviti Interaktif",
          widget_type: "matching",
          instruction: "Tekan kad untuk memadankan pasangan yang tepat!",
          seed_data: {
            pairs: [
              { image: "⭐⭐⭐", label: "3 Bintang" },
              { image: "⭐⭐⭐⭐⭐", label: "5 Bintang" },
              { image: "⭐", label: "1 Bintang" }
            ]
          }
        }
      },
      QUIZ_QUESTION: {
        id: `ast_${cleanCode}_quiz`,
        asset_type: "QUIZ_QUESTION",
        block_type: "KNOWLEDGE_CHECK",
        title: `Semakan Pengetahuan SP ${cleanCode}`,
        status: "draft",
        quality_score: 95,
        content_markdown: `Jawab soalan formatif ini untuk menguji tahap penguasaan anda.`,
        voice_script: `Jawab soalan ini untuk menguji kepintaran anda!`,
        payload: {
          title: "Semakan Pengetahuan",
          questions: [
            {
              stem: `Pilih jawapan yang paling tepat berdasarkan kemahiran SP ${cleanCode}:`,
              options: ["Pilihan A (Tepat)", "Pilihan B", "Pilihan C"],
              correct_index: 0,
              explanation: "Jawapan ini tepat berdasarkan konsep yang telah dipelajari."
            }
          ]
        }
      },
      REFLECTION: {
        id: `ast_${cleanCode}_reflection`,
        asset_type: "REFLECTION",
        block_type: "KEY_TAKEAWAY",
        title: `Rumusan & Refleksi SP ${cleanCode}`,
        status: "draft",
        quality_score: 96,
        content_markdown: `Rumusan bagi kemahiran SP ${cleanCode}.`,
        voice_script: `Tahniah atas usaha gigih anda!`,
        payload: {
          title: "Rumusan Misi",
          summary_points: [
            `Kemahiran SP ${cleanCode} telah berjaya dipelajari.`,
            "Ingat petua kunci dan aplikasikan dalam latihan harian.",
            "Teruskan usaha untuk mencapai tahap penguasaan terbaik!"
          ],
          mascot_celebration: "Suku Penyu sangat gembira dengan kemajuan anda!",
          badge_earned: `Pakar SP ${cleanCode} 🌟`
        }
      }
    }
  };
}
