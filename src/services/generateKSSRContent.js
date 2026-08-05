// src/services/generateKSSRContent.js

/**
 * GENERATE_KSSR_LESSON_PROMPT
 * Enjin Penjana Kandungan AI Adaptif KSSR (Tahun 1 - 6)
 */
export const GENERATE_KSSR_LESSON_PROMPT = (dskpTitle, spCode, targetTP, widgetFocus) => {
  return `
Anda ialah "Suku Penyu" 🐢, seorang AI Tutor KSSR yang sangat mesra, ceria, dan pandai menerangkan konsep matematik kepada kanak-kanak sekolah rendah (umur 7-9 tahun).

TUGAS UTAMA:
Jana modul pembelajaran 5-Langkah KSSR berasaskan parameter berikut:
- Tajuk DSKP / SP Code: ${spCode} - ${dskpTitle}
- Sasaran Tahap Penguasaan: ${targetTP}
- Widget Fokus Utama: ${widgetFocus || 'auto'}

------------------------------------------------------------------
🚨 PERATURAN KETAT PEDAGOGI & BAHASA (CHILD-FRIENDLY RULES) 🚨
------------------------------------------------------------------

1. BAHASA MESRA BUDAK (ELAKKAN BAHASA ROBOT/AKADEMIK):
   - HARAM menggunakan frasa raw DSKP seperti "${dskpTitle}" secara berulang-ulang dalam dialog atau tajuk.
   - PERLU menukar tajuk rasmi kepada frasa santai kanak-kanak. 
     * Contoh Buruk: "Mari kita kaji Menyatakan kuantiti secara membandingkan banyak atau sedikit"
     * Contoh Baik: "Jom Kawan! Mana Lagi Banyak, Mana Lagi Sedikit?"
   - DILARANG menggunakan istilah akademik tinggi seperti: "Perwakilan Visual", "Kumpulan Pembanding", "Mitos & Fakta", "Analisis Konsep", "Aplikasi Kehidupan Harian".
   - Gunakan ayat pendek (maksimum 8-10 perkataan per ayat).

2. REALISTIK & DILARANG GUNA TEXT DUMMY:
   - DILARANG SAMA SEKALI menghasilkan jawapan seperti "Pilihan A (Jawapan Tepat)", "Kategori 1", atau "Pilihan B".
   - Tulis soalan, pilihan jawapan, dan nota penjelasan yang SEBENAR dan konkrit.

3. KONSISTENSI CPA (CONCRETE - PICTORIAL - ABSTRACT):
   - Jika tajuk berkaitan "Banding Kuantiti" / "Tambah" / "Tolak", gunakan contoh objek sebenar yang kanak-kanak kenal (Contoh: Biskut, Belon, Epal, Kucing).

4. PEMADANAN WIDGET INTERAKTIF SEBENAR:
   - Jika widgetFocus adalah 'base_ten_blocks', jana soalan nilai tempat/bina nombor yang relevan.
   - Jika tajuk adalah perbandingan/pengasingan, utamakan widget 'drag_and_drop' atau 'matching_cards' dengan data sebenar.

------------------------------------------------------------------
FORMAT OUTPUT (MUST RETURN VALID JSON ONLY, NO MARKDOWN CODEBLOCKS)
------------------------------------------------------------------

{
  "lesson_title": "Tajuk Mesra Budak yang Menarik (Contoh: Misi Banding Belon Suku!)",
  "sp_code": "${spCode}",
  "target_tp": "${targetTP}",
  "steps": [
    {
      "step_number": 1,
      "type": "INTRO",
      "title": "Pengenalan Misi",
      "suku_dialogue": "Hai Kawan! Saya Suku Penyu 🐢. Hari ini kita nak bantu Suku kira belon-belon comel ini. Jom!",
      "audio_tts_text": "Hai Kawan! Saya Suku Penyu. Hari ini kita nak bantu Suku kira belon-belon comel ini. Jom!"
    },
    {
      "step_number": 2,
      "type": "VISUAL_GUIDE",
      "title": "Panduan Visual",
      "concept_title": "Mari Bandingkan!",
      "description": "Lihat 5 biji epal merah di sebelah kiri dan 2 biji epal hijau di sebelah kanan. 5 epal adalah LEBIH BANYAK daripada 2 epal!",
      "visual_prompt": "Vector illustration for kids showing 5 red apples on the left side and 2 green apples on the right side, bright colorful cartoon style",
      "quick_tip": "Petua Suku: Kumpulan yang ada bilangan nombor lebih besar adalah LEBIH BANYAK!"
    },
    {
      "step_number": 3,
      "type": "CONCEPT_SUMMARY",
      "title": "Nota Peringatan",
      "summary_points": [
        "Banyak = Bilangan objek yang lebih besar",
        "Sedikit = Bilangan objek yang lebih kecil",
        "Sama Banyak = Bilangan objek yang tidak ada bezanya"
      ]
    },
    {
      "step_number": 4,
      "type": "EDUGAME_WIDGET",
      "title": "Aktiviti Interaktif",
      "widget_type": "${widgetFocus && widgetFocus !== 'auto' ? widgetFocus : 'drag_and_drop'}",
      "widget_config": {
        "instruction": "Sila padankan atau susun mengikut arahan dengan betul!",
        "target_number": 34,
        "items": [
          {"id": "item-1", "label": "🍎 8 Biji Epal", "category": "Banyak"},
          {"id": "item-2", "label": "🍎 2 Biji Epal", "category": "Sedikit"}
        ]
      }
    },
    {
      "step_number": 5,
      "type": "CHECKPOINT_QUIZ",
      "title": "Ujian Misi",
      "question": "Suku ada 7 biji gula-gula. Ali ada 3 biji gula-gula. Siapa yang ada gula-gula LEBIH BANYAK?",
      "options": [
        {"id": "opt_a", "text": "Suku Penyu (7 biji)", "is_correct": true, "explanation": "Tepat sekali! 7 adalah lebih besar daripada 3."},
        {"id": "opt_b", "text": "Ali (3 biji)", "is_correct": false, "explanation": "Kurang tepat, 3 adalah lebih sedikit daripada 7."}
      ]
    }
  ]
}
`;
};

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
 * Dynamically resolves real-world anchors, stories, mascot dialogues, widgets, and quiz questions for ANY topic.
 */
function resolveDynamicTopicContext(subject = "Matematik", grade = "Tahun 1", topicTitle = "Nombor hingga 100", spCode = "1.1.1", spDescription = "") {
  const tLower = (topicTitle || "").toLowerCase() + " " + (spDescription || "").toLowerCase();
  const isMath = (subject || "").toLowerCase().includes("matematik");
  const isScience = (subject || "").toLowerCase().includes("sains");
  const isBM = (subject || "").toLowerCase().includes("bahasa melayu");
  const isEnglish = (subject || "").toLowerCase().includes("english");

  // 1. WANG / MONEY
  if (tLower.includes("wang") || tLower.includes("duit") || tLower.includes("ringgit") || tLower.includes("sen") || tLower.includes("money")) {
    return {
      theme: "Kedai Kembara Suku",
      worldIcon: "🪙",
      storyHook: "Di Kedai Kembara Suku Penyu 🐢, Suku sedang mengira wang syiling 10 sen, 20 sen, dan 50 sen serta wang kertas untuk membeli kelengkapan sekolah!",
      helpContinuation: "Untuk membantu Suku Penyu memilih wang yang betul, mari kita pelajari nilai mata wang Malaysia dan cara mengira wang baki bersama-sama!",
      mascotDialogue: "Hai kawan-kawan! Jom kita bantu Suku mengenal pasti nilai mata wang Malaysia dan mengira wang baki dengan tepat!",
      visualMethod: "Suku meletakkan wang syiling 50 sen dan 20 sen di atas meja kedai untuk dikira.",
      leftGroup: "50 sen & 20 sen",
      rightGroup: "10 sen & 5 sen",
      stepsList: ["1. Kenal pasti nilai wang syiling/kertas", "2. Tambahkan nilai wang bersama-sama", "3. Kira baki wang secara berhati-hati"],
      myth: "Adakah 20 sen lebih besar nilainya daripada 50 sen?",
      fact: "50 sen mempunyai nilai yang lebih tinggi daripada 20 sen!",
      widgetType: "money_counter",
      instruction: "Bantu Suku mengira dan memilih duit syiling yang betul.",
      practiceTarget: { targetNumber: 70, targetSentence: "Suku membayar tujuh puluh sen di kedai" },
      flashcards: [
        { term: "Nilai Wang", definition: "Kadar harga atau jumlah wang syiling dan wang kertas." },
        { term: "Wang Baki", definition: "Baki wang yang dipulangkan selepas membuat pembayaran." }
      ],
      gameItems: ["10 sen", "50 sen", "RM5"],
      quizQuestion: "Suku membeli pensel berharga 50 sen dan memegang 70 sen. Berapakah baki wang Suku?",
      quizOptions: ["10 sen", "20 sen", "30 sen"],
      quizCorrectIdx: 1,
      quizExplanation: "70 sen tolak 50 sen meninggalkan baki 20 sen!"
    };
  }

  // 2. MASA DAN WAKTU / TIME
  if (tLower.includes("masa") || tLower.includes("waktu") || tLower.includes("jam") || tLower.includes("minit") || tLower.includes("hari") || tLower.includes("time") || tLower.includes("clock")) {
    return {
      theme: "Jam Kembara Masa",
      worldIcon: "⏰",
      storyHook: "Di Jam Kembara Masa, Suku Penyu 🐢 sedang memerhati jarum jam dan jarum minit untuk menentukan waktu aktiviti harian!",
      helpContinuation: "Untuk membantu Suku Penyu menyusun waktu aktiviti harian dengan betul, mari kita pelajari cara membaca muka jam dan menentukan masa bersama-sama!",
      mascotDialogue: "Hai kawan-kawan! Jom kita belajar membaca muka jam dan menyatakan waktu pagi, tengah hari, dan malam!",
      visualMethod: "Muka jam analog dengan jarum pendek menunjuk jam dan jarum panjang menunjuk minit.",
      leftGroup: "Waktu Pagi (8:00 AM)",
      rightGroup: "Waktu Petang (4:00 PM)",
      stepsList: ["1. Lihat jarum pendek untuk menentukan jam", "2. Lihat jarum panjang untuk menentukan minit", "3. Sebut waktu dengan tepat"],
      myth: "Adakah jarum panjang menunjuk jam?",
      fact: "Jarum pendek menunjuk jam, manakala jarum panjang menunjuk minit!",
      widgetType: "clock_face",
      instruction: "Pusingkan jarum jam untuk menunjukkan waktu yang tepat.",
      practiceTarget: { targetNumber: 8, targetSentence: "Suku bangun tidur pada pukul lapan pagi" },
      flashcards: [
        { term: "Jarum Jam", definition: "Jarum pendek yang menunjuk bilangan jam pada muka jam." },
        { term: "Jarum Minit", definition: "Jarum panjang yang menunjuk bilangan minit." }
      ],
      gameItems: ["Pagi (8:00)", "Tengah Hari (12:00)", "Malam (8:00)"],
      quizQuestion: "Jarum pendek menunjuk angka 8 dan jarum panjang menunjuk angka 12. Pukul berapakah itu?",
      quizOptions: ["Pukul 8:00", "Pukul 12:00", "Pukul 4:00"],
      quizCorrectIdx: 0,
      quizExplanation: "Jarum pendek pada angka 8 dan jarum panjang pada angka 12 menunjukkan Pukul 8:00!"
    };
  }

  // 3. BENTUK GEOMETRI (2D & 3D) / SHAPES
  if (tLower.includes("bentuk") || tLower.includes("geometri") || tLower.includes("kubus") || tLower.includes("kuboid") || tLower.includes("sfera") || tLower.includes("segi") || tLower.includes("bulat") || tLower.includes("shape")) {
    return {
      theme: "Taman Geometri 3D",
      worldIcon: "📐",
      storyHook: "Di Taman Geometri, Suku Penyu 🐢 sedang mengelaskan bongkah tiga dimensi seperti kubus, kuboid, sfera, dan silinder!",
      helpContinuation: "Untuk membantu Suku Penyu mengisipadu dan menyusun bentuk 3D, mari kita kuasai ciri-ciri permukaan rata, bucu, dan tepi bentuk ini bersama-sama!",
      mascotDialogue: "Hai kawan-kawan! Jom kita terokai permukaan rata, permukaan melengkung, bucu, dan sisi bagi bentuk 3D!",
      visualMethod: "Bongkah 3D berwarna-warni yang menunjukkan permukaan rata dan bucu secara jelas.",
      leftGroup: "Bentuk Permukaan Rata (Kubus)",
      rightGroup: "Bentuk Permukaan Melengkung (Sfera)",
      stepsList: ["1. Perhatikan bilangan permukaan rata", "2. Kira bilangan bucu dan tepi", "3. Namakan bentuk 3D tersebut"],
      myth: "Adakah sfera mempunyai permukaan rata?",
      fact: "Sfera hanya mempunyai satu permukaan melengkung dan tiada bucu!",
      widgetType: "shape_sorter",
      instruction: "Kelaskan bentuk 3D ke dalam bakul yang betul.",
      practiceTarget: { targetNumber: 6, targetSentence: "Kubus mempunyai enam permukaan rata" },
      flashcards: [
        { term: "Permukaan Rata", definition: "Bahagian rata pada bongkah tiga dimensi." },
        { term: "Bucu", definition: "Titik pertemuan antara tepi-tepi bentuk 3D." }
      ],
      gameItems: ["Kubus (6 Permukaan)", "Sfera (0 Bucu)", "Silinder"],
      quizQuestion: "Berapakah bilangan permukaan rata yang terdapat pada sebuah kubus?",
      quizOptions: ["4 permukaan", "6 permukaan", "8 permukaan"],
      quizCorrectIdx: 1,
      quizExplanation: "Sebuah kubus mempunyai tepat 6 permukaan rata yang sama saiz!"
    };
  }

  // 4. PECAHAN / FRACTIONS
  if (tLower.includes("pecahan") || tLower.includes("perdua") || tLower.includes("perempat") || tLower.includes("fraction")) {
    return {
      theme: "Dapur Pecahan Suku",
      worldIcon: "🍕",
      storyHook: "Di Dapur Pecahan, Suku Penyu 🐢 sedang memotong kek dan pizza kepada bahagian satu per dua dan satu per empat!",
      helpContinuation: "Untuk membantu Suku Penyu membahagikan makanan secara adil kepada rakan-rakan, mari kita pelajari konsep pecahan satu per dua dan satu per empat bersama-sama!",
      mascotDialogue: "Hai kawan-kawan! Jom kita belajar memotong dan membahagi makanan secara adil menggunakan pecahan!",
      visualMethod: "Pizza bulat yang dibahagikan kepada 2 bahagian sama besar (1/2) dan 4 bahagian (1/4).",
      leftGroup: "Satu Perdua (1/2)",
      rightGroup: "Satu Perempat (1/4)",
      stepsList: ["1. Potong objek kepada bahagian sama saiz", "2. Kira bahagian yang dipilih", "3. Tuliskan dalam bentuk pecahan"],
      myth: "Adakah 1/4 lebih besar daripada 1/2?",
      fact: "1/2 adalah bahagian yang lebih besar daripada 1/4!",
      widgetType: "fraction_slicer",
      instruction: "Potong pizza untuk menunjukkan pecahan 1/2.",
      practiceTarget: { targetFraction: "1/2", shapeType: "circle" },
      flashcards: [
        { term: "Pengangka", definition: "Nombor di bahagian atas pecahan yang menunjukkan bahagian dipilih." },
        { term: "Penyebut", definition: "Nombor di bahagian bawah yang menunjukkan jumlah keseluruhan bahagian." }
      ],
      gameItems: ["Satu Perdua (1/2)", "Satu Perempat (1/4)", "Tiga Perempat (3/4)"],
      quizQuestion: "Jika sebiji kek dibahagikan kepada 2 bahagian yang sama besar, apakah nama satu bahagian tersebut?",
      quizOptions: ["Satu Perempat", "Satu Perdua", "Tiga Perempat"],
      quizCorrectIdx: 1,
      quizExplanation: "Satu daripada 2 bahagian yang sama saiz dipanggil Satu Perdua (1/2)!"
    };
  }

  // 5. PERNAFASAN / SAINS
  if (isScience || tLower.includes("pernafasan") || tLower.includes("organ") || tLower.includes("tumbuhan") || tLower.includes("haiwan") || tLower.includes("sains")) {
    return {
      theme: "Makmal Penerokaan Sains",
      worldIcon: "🔬",
      storyHook: `Di Makmal Sains, Suku Penyu 🐢 sedang menyiasat fenomena alam dan mengumpul pemerhatian bagi tajuk ${topicTitle}!`,
      mascotDialogue: `Hai kawan-kawan! Jom kita jalankan inkuiri sains berpandu untuk meneroka tajuk ${topicTitle}!`,
      visualMethod: `Diagram visual interaktif yang menunjukkan proses dan carta pengelasan bagi ${topicTitle}.`,
      leftGroup: `Pemerhatian A (${topicTitle})`,
      rightGroup: `Pemerhatian B (${topicTitle})`,
      stepsList: [`1. Perhatikan ciri-ciri utama ${topicTitle}`, `2. Kelaskan mengikut sifat fizikal`, `3. Buat kesimpulan pemerhatian`],
      myth: `Adakah semua organ mempunyai fungsi yang sama?`,
      fact: `Setiap organ sains mempunyai fungsi khusus yang saling melengkapi!`,
      widgetType: "organ_system_explorer",
      instruction: `Teroka diagram interaktif sains bagi tajuk ${topicTitle}.`,
      practiceTarget: { targetNumber: 1, targetSentence: `Murid menjalankan penyiasatan sains ${topicTitle}` },
      flashcards: [
        { term: topicTitle, definition: `Konsep sains utama yang diterokai dalam penyiasatan harian.` },
        { term: "Pemerhatian Sains", definition: `Proses menggunakan deria untuk mengumpul maklumat.` }
      ],
      gameItems: [`Ciri 1 (${topicTitle})`, `Ciri 2 (${topicTitle})`, `Ciri 3 (${topicTitle})`],
      quizQuestion: `Apakah langkah pertama yang betul semasa membuat penyiasatan sains bagi ${topicTitle}?`,
      quizOptions: [`Membaca arahan & membuat pemerhatian`, `Mengabaikan bukti`, `Membuat andaian tanpa ujian`],
      quizCorrectIdx: 0,
      quizExplanation: `Pemerhatian yang teliti ialah langkah asas utama dalam kaedah sains!`
    };
  }

  // 6. BAHASA MELAYU / ENGLISH
  if (isBM || isEnglish || tLower.includes("tatabahasa") || tLower.includes("ayat") || tLower.includes("bacaan") || tLower.includes("words") || tLower.includes("vocabulary")) {
    const isEng = isEnglish || tLower.includes("english") || tLower.includes("words");
    return {
      theme: isEng ? "English Adventure World" : "Rumah Bacaan Bahasa",
      worldIcon: "📚",
      storyHook: isEng
        ? `At the Adventure Classroom, Suku Penyu 🐢 is learning vocabulary and building sentence frames for ${topicTitle}!`
        : `Di Rumah Bacaan Bahasa, Suku Penyu 🐢 sedang menyusun perkataan menjadi ayat yang indah dan gramatis bagi tajuk ${topicTitle}!`,
      mascotDialogue: isEng
        ? `Hello friends! Let's learn new words and build awesome sentences with Suku!`
        : `Hai kawan-kawan! Jom kita susun perkataan dan bina ayat yang lengkap bersama Suku!`,
      visualMethod: isEng
        ? `Interactive word cards and picture clues to pair vocabulary accurately.`
        : `Kad perkataan berwarna-warni yang disusun mengikut subjek, kata kerja, dan objek.`,
      leftGroup: isEng ? "Subject & Verb" : "Subjek (Ahmad/Suku)",
      rightGroup: isEng ? "Object & Context" : "Predikat (membaca buku)",
      stepsList: isEng
        ? ["1. Identify target vocabulary", "2. Arrange words in correct order", "3. Read out loud clearly"]
        : ["1. Kenal pasti subjek dan kata kerja", "2. Susun perkataan mengikut struktur gramatis", "3. Baca ayat dengan sebutan lancar"],
      myth: isEng ? "Can a sentence start without a capital letter?" : "Adakah kata nama khas ditulis dengan huruf kecil?",
      fact: isEng ? "Every proper sentence begins with a capital letter!" : "Kata nama khas sentiasa ditulis dengan huruf besar di hadapan!",
      widgetType: isEng ? "word_matching" : "sentence_builder",
      instruction: isEng ? "Drag words to complete the sentence frame." : "Susun perkataan berikut menjadi ayat yang lengkap.",
      practiceTarget: { targetSentence: isEng ? "Suku loves reading story books every day" : "Ahmad membaca buku cerita di perpustakaan sekolah" },
      flashcards: [
        { term: isEng ? "Vocabulary" : "Kata Nama", definition: isEng ? "Target words used to build clear sentences." : "Perkataan yang menamakan orang, tempat, atau benda." },
        { term: isEng ? "Sentence Frame" : "Struktur Ayat", definition: isEng ? "Correct pattern used to compose English sentences." : "Susunan perkataan berstruktur gramatis." }
      ],
      gameItems: isEng ? ["Reading", "Writing", "Speaking"] : ["Subjek", "Kata Kerja", "Objek"],
      quizQuestion: isEng
        ? "Which word correctly completes the sentence: 'Suku ___ a book'?"
        : "Antara perkataan berikut, yang manakah merupakan Kata Nama Khas?",
      quizOptions: isEng ? ["reads", "reading", "readed"] : ["Sekolah SK Taman Ilmu", "buku", "pensel"],
      quizCorrectIdx: 0,
      quizExplanation: isEng
        ? "'reads' is the correct simple present tense form for Suku!"
        : "'Sekolah SK Taman Ilmu' ialah Kata Nama Khas dan ditulis dengan huruf besar!"
    };
  }

  // 7. DEFAULT DYNAMIC TOPIC ANCHOR (NOMBOR / GENERIC)
  const isFruitShopTopic = tLower.includes("buah") || tLower.includes("epal") || tLower.includes("kuantiti") || tLower.includes("bilang") || tLower.includes("nombor") || isMath;
  
  if (isFruitShopTopic) {
    return {
      theme: `Kedai Buah Pak Cik Abu`,
      worldIcon: "🍎",
      storyHook: `Suku Penyu 🐢 sedang membantu Pak Cik Abu di kedai buah. Ada 3 bakul besar yang berisi 10 biji epal setiap satu dan 5 biji epal lagi di atas meja. Suku Penyu 🐢 perlu tahu jumlah semua epal itu untuk diletakkan tanda harga.`,
      helpContinuation: `Untuk membantu Suku Penyu membilang dan meletakkan tanda harga epal Pak Cik Abu dengan tepat, mari kita kuasai kemahiran ${spDescription || topicTitle} bersama-sama!`,
      mascotDialogue: `Hai kawan-kawan! Jom kita bantu Pak Cik Abu mengira jumlah epal di dalam bakul dan di atas meja!`,
      visualMethod: `Pak Cik Abu meletakkan 3 bakul besar berisi 10 biji epal dan 5 biji epal di atas meja kayu.`,
      leftGroup: `3 Bakul Epal (10 + 10 + 10 = 30)`,
      rightGroup: `5 Epal di Atas Meja`,
      stepsList: [`1. Kira epal dalam setiap bakul (30 biji)`, `2. Tambahkan epal di atas meja (5 biji)`, `3. Jumlahkan semua sekali (35 biji)`],
      myth: `Adakah kita perlu mengira epal satu demi satu dari awal?`,
      fact: `Kita boleh mengira secara sepuluh-sepuluh (10, 20, 30) dan tambah 5!`,
      widgetType: "base_ten_blocks",
      instruction: `Bantu Suku membilang dan menyusun bakul epal untuk Pak Cik Abu.`,
      practiceTarget: { targetNumber: 35, targetSentence: `Suku mengira tiga puluh lima biji epal di kedai Pak Cik Abu` },
      flashcards: [
        { term: "Kumpulan Sepuluh", definition: "Bungkusan atau bakul yang mengandungi 10 objek." },
        { term: "Sa (Unit)", definition: "Bilangan objek tunggal yang tinggal." }
      ],
      gameItems: ["3 Bakul (30)", "5 Epal Meja (5)", "Jumlah (35)"],
      quizQuestion: "Suku Penyu membantu Pak Cik Abu mengira 3 bakul berisi 10 biji epal dan 5 biji epal di atas meja. Berapakah jumlah semua epal?",
      quizOptions: ["35 biji epal", "30 biji epal", "25 biji epal"],
      quizCorrectIdx: 0,
      quizExplanation: "3 bakul x 10 = 30 epal, tambah 5 epal di atas meja = 35 biji epal kesemuanya!"
    };
  }

  return {
    theme: `Dunia ${subject}`,
    worldIcon: isMath ? "🔢" : "🌎",
    storyHook: `Suku Penyu 🐢 sedang membantu rakan-rakan di sekolah untuk menyusun objek dan menyelesaikan misi ${spDescription || topicTitle}!`,
    helpContinuation: `Untuk membantu Suku Penyu menyelesaikan cabaran ini dengan lancar, mari kita pelajari dan kuasai konsep asas ${spDescription || topicTitle} bersama-sama!`,
    mascotDialogue: `Hai kawan-kawan! Saya Suku Penyu 🐢. Jom kita kembara dan menguasai ${spDescription || topicTitle} bersama-sama!`,
    visualMethod: `Suku meletakkan perwakilan visual objek bagi tajuk ${spDescription || topicTitle} untuk dikaji dan dikira.`,
    leftGroup: `Kumpulan Utama A (${spDescription || topicTitle})`,
    rightGroup: `Kumpulan Pembanding B (${spDescription || topicTitle})`,
    stepsList: [`1. Perhatikan perwakilan visual ${spDescription || topicTitle}`, `2. Terapkan kaedah asas pengiraan`, `3. Semak jawapan anda dengan teliti`],
    myth: `Adakah kuantiti yang lebih besar bermaksud bilangan yang lebih sedikit?`,
    fact: `Kuantiti yang lebih besar sentiasa mewakili bilangan yang lebih banyak!`,
    widgetType: "base_ten_blocks",
    instruction: `Bantu Suku membilang dan menyusun objek mengikut jumlah ${spDescription || topicTitle}.`,
    practiceTarget: { targetNumber: 34, targetSentence: `Suku menguasai pembelajaran ${spDescription || topicTitle}` },
    flashcards: [
      { term: spDescription || topicTitle, definition: `Istilah dan konsep utama yang diterokai dalam tajuk ini.` },
      { term: "Kuantiti", definition: `Jumlah atau bilangan objek yang kita ukur dan kira.` }
    ],
    gameItems: [`Kategori 1`, `Kategori 2`, `Kategori 3`],
    quizQuestion: `Apakah jawapan yang tepat bagi latihan ${spDescription || topicTitle} di bawah?`,
    quizOptions: [`Jawapan Tepat`, `Pilihan Kurang Tepat`, `Pilihan Salah`],
    quizCorrectIdx: 0,
    quizExplanation: `Mengikut konsep asas tajuk ${spDescription || topicTitle}, jawapan ini adalah tepat!`
  };
}

/**
 * Builds a complete, valid 9-Step KSSR Mission Package adhering strictly to the Dual-Layer Data Schema.
 * Generates rich, authentic student-facing lesson scenes dynamically tailored to ANY selected Topic, SK, and SP.
 */
export function build9StepKSSRMissionPackage({
  spCode = "1.1.1",
  skCode = "1.1",
  grade = "Tahun 1",
  pbdTarget = "TP3",
  subject = "Matematik",
  topicTitle = "Nombor hingga 100",
  spDescription = "",
  widgetType = null,
  pedagogyContext = null
}) {
  const mode = getKSSRModeByGrade(grade);
  const mascotName = mode === "SENIOR" ? "Ejen Suku 🦊" : "Suku Penyu 🐢";

  // Resolve dynamic topic context
  const dynamicCtx = resolveDynamicTopicContext(subject, grade, topicTitle, spCode, spDescription);

  const realWorldAnchor = pedagogyContext?.real_world_context
    ? (Array.isArray(pedagogyContext.real_world_context) ? pedagogyContext.real_world_context[0] : pedagogyContext.real_world_context)
    : dynamicCtx.storyHook;

  const resolvedWidget = widgetType || pedagogyContext?.default_widget_type || dynamicCtx.widgetType;
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
      sp_title: spDescription || topicTitle,
      pedagogy_block: "MICRO_CPA_ENGAGEMENT",
      target_tp: pbdTarget
    },

    // ----------------------------------------------------
    // DUAL-LAYER SCHEMA: STUDENT-FACING INTERFACE TEXT
    // ----------------------------------------------------
    student_ui: {
      world_title: dynamicCtx.theme,
      mission_header: `Pengembaraan: ${topicTitle}`,
      mission_description: `Selamat datang ke ${grade}! Hari ini kita ada misi khas: meneroka dan menguasai ${topicTitle} bersama ${mascotName}.`,
      mascot_dialogue: mode === "SENIOR"
        ? `Hai! Saya Ejen Suku 🦊. Mari kita analisis dan selesaikan masalah ${topicTitle} ini bersama-sama!`
        : dynamicCtx.mascotDialogue,
      call_to_action: "Mula Kembara!"
    },

    // Top-Level Legacy & Compatibility Fields
    spCode,
    skCode,
    grade,
    mode,
    pbdTarget,
    world: {
      world_name: dynamicCtx.theme,
      world_icon: dynamicCtx.worldIcon,
      theme: `Pengembaraan ${topicTitle}`,
      description: `Bantu ${mascotName} meneroka ${topicTitle} dan mengumpul syiling emas!`
    },
    adventure_story: {
      title: `Kembara ${topicTitle}`,
      introduction: dynamicCtx.storyHook,
      problem: `Selesaikan cabaran interaktif bagi tajuk ${topicTitle} untuk memenuhi bakul ganjaran!`,
      mission_goal: `Kuasai kemahiran ${topicTitle} secara seronok dan berkesan!`
    },
    otan_companion: {
      greeting: mode === "SENIOR"
        ? "Salam Pengembara! Ejen Suku 🦊 sedia membantu anda menganalisis cabaran ini!"
        : dynamicCtx.mascotDialogue,
      encouragement: ["Bagus sekali!", `Kamu semakin hebat dalam ${topicTitle}!`, "Suku bangga dengan kamu!"],
      hint_messages: [`Fikirkan konsep asas ${topicTitle}.`, `Bandingkan pilihan dengan teliti.`],
      celebration_messages: [`Tahniah! Misi ${topicTitle} berjaya diselesaikan dengan cemerlang! 🎉`]
    },
    steps: [
      {
        step_number: 1,
        step_type: "BRIEFING",
        title: "Pengenalan Misi",
        payload: {
          story_hook: dynamicCtx.storyHook,
          help_continuation: dynamicCtx.helpContinuation || `Untuk membantu Suku Penyu menyelesaikan cabaran ini, mari kita pelajari dan kuasai subtopik ${topicTitle} bersama-sama!`,
          mascot_dialogue: mode === "SENIOR"
            ? `Hai {student_name}! Saya Ejen Suku 🦊. Jom kita rungkai cabaran ${topicTitle} ini!`
            : `Hai {student_name}! Saya Suku Penyu 🐢. Jom kita kembara dan menguasai ${topicTitle} bersama-sama!`,
          dialogue_template: mode === "SENIOR"
            ? `Hai {student_name}! Saya Ejen Suku 🦊. Jom kita rungkai cabaran ${topicTitle} ini!`
            : `Hai {student_name}! Saya Suku Penyu 🐢. Jom kita kembara dan menguasai ${topicTitle} bersama-sama!`,
          mascot_expression: "HAPPY_WAVING",
          audio_script: `Hai {student_name}! Selamat datang ke pengembaraan ${topicTitle}!`,
          theme: dynamicCtx.theme,
          visual_description: `3D Suku Penyu exploring ${topicTitle} world`
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
            content: { text: dynamicCtx.visualMethod }
          },
          {
            block_type: "COMPARISON_SPLIT",
            title: `Perbandingan Kuantiti`,
            content: { left: dynamicCtx.leftGroup, right: dynamicCtx.rightGroup }
          },
          {
            block_type: "STEP_BY_STEP",
            title: `Langkah Pembelajaran`,
            content: { steps: dynamicCtx.stepsList }
          },
          {
            block_type: "MYTH_BUSTER",
            title: `Mitos & Fakta ${topicTitle}`,
            content: { myth: dynamicCtx.myth, fact: dynamicCtx.fact }
          }
        ]
      },
      {
        step_number: 3,
        step_type: "LESSON",
        title: `Pecahan Konsep Utama: ${topicTitle}`,
        payload: {
          concept_summary: `Konsep ${topicTitle}: ${dynamicCtx.visualMethod} ${dynamicCtx.fact}`,
          key_points: [
            `Mengenal pasti ciri dan kaedah utama bagi ${topicTitle}.`,
            `Aplikasi dalam kehidupan harian: ${dynamicCtx.visualMethod}`,
            `Peraturan penting yang perlu diingati: ${dynamicCtx.fact}`
          ],
          infographic: {
            title: `Infografik Pembelajaran: ${topicTitle}`,
            key_takeaway: dynamicCtx.fact,
            visual_labels: [
              { icon: "💡", label: "Konsep Utama", text: dynamicCtx.visualMethod },
              { icon: "⚡", label: "Aplikasi Harian", text: `Penggunaan ${topicTitle} dalam situasi kehidupan harian` }
            ]
          }
        }
      },
      {
        step_number: 4,
        step_type: "PRACTICE",
        title: `Latihan Interaktif ${topicTitle}`,
        payload: {
          widget_type: resolvedWidget,
          instruction: dynamicCtx.instruction,
          interactive_data: { topic: topicTitle, ...dynamicCtx.practiceTarget }
        }
      },
      {
        step_number: 5,
        step_type: "FLASHCARDS",
        title: "Kad Imbasan Terma Utama",
        cards: dynamicCtx.flashcards
      },
      {
        step_number: 6,
        step_type: "MINI_GAME",
        title: "Permainan Mini Pembelajaran",
        payload: {
          game_type: "SortingGame",
          game_config: { items: dynamicCtx.gameItems, targetCategory: "Susunan Utama" }
        }
      },
      {
        step_number: 7,
        step_type: "QUIZ",
        title: "Soalan Cabaran Misi",
        questions: [
          {
            question: dynamicCtx.quizQuestion,
            options: dynamicCtx.quizOptions,
            correct_index: dynamicCtx.quizCorrectIdx,
            explanation: dynamicCtx.quizExplanation,
            tp_level: pbdTarget,
            subtopic_id: spCode,
            misconception_shield: dynamicCtx.myth
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
          mastery_summary: `Tahniah! Anda telah berjaya menguasai kemahiran ${topicTitle} dengan cemerlang! 🎉`
        }
      },
      {
        step_number: 9,
        step_type: "REWARD",
        title: "Ganjaran Lencana Misi",
        payload: {
          badge: `Wira ${topicTitle}`,
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
