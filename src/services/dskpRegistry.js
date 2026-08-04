// src/services/dskpRegistry.js
// Centralized KSSR Semakan Curriculum & DSKP Taxonomy Registry Service

/**
 * Extended Master DSKP Topic & SK/SP Registry
 * Guarantees rich DSKP mappings for Matematik, Sains, Bahasa Melayu, and English across Tahun 1-6.
 */
const EXTENDED_DSKP_TAXONOMY = {
  "Matematik": {
    "Tahun 1": [
      { topic: "Nombor hingga 100", sk_code: "1.1", sk_title: "Kuantiti Secara Intuitif", sp_code: "1.1.1", title: "Menyatakan kuantiti secara membandingkan banyak atau sedikit" },
      { topic: "Nombor hingga 100", sk_code: "1.2", sk_title: "Nilai Nombor", sp_code: "1.2.1", title: "Menamai nombor hingga 100 mengikut kumpulan objek" },
      { topic: "Nombor hingga 100", sk_code: "1.4", sk_title: "Nilai Tempat dan Nilai Digit", sp_code: "1.4.1", title: "Menyatakan nilai tempat (puluh dan sa) dan nilai digit" },
      { topic: "Tambah dan Tolak", sk_code: "2.1", sk_title: "Konsep Tambah dan Tolak", sp_code: "2.1.1", title: "Menggunakan perbendaharaan kata dan simbol + dan =" },
      { topic: "Tambah dan Tolak", sk_code: "2.2", sk_title: "Tambah dalam Lingkungan 100", sp_code: "2.2.1", title: "Menambah dua nombor tanpa dan dengan kumpul semula" },
      { topic: "Pecahan", sk_code: "3.1", sk_title: "Pecahan Wajar", sp_code: "3.1.1", title: "Mengenal pasti setengah, suku, satu perdua, dan satu perempat" },
      { topic: "Wang", sk_code: "4.1", sk_title: "Wang Kertas dan Syiling", sp_code: "4.1.1", title: "Mengenal pasti duit syiling (5c, 10c, 20c, 50c) dan wang kertas (RM1, RM5, RM10)" },
      { topic: "Masa dan Waktu", sk_code: "5.1", sk_title: "Muka Jam dan Waktu", sp_code: "5.1.1", title: "Menyebut dan menulis waktu dalam jam dan setengah jam" },
      { topic: "Bentuk", sk_code: "7.1", sk_title: "Bentuk 3D & 2D", sp_code: "7.1.1", title: "Menamakan bentuk kubus, kuboid, piramid, silinder dan sfera" }
    ],
    "Tahun 2": [
      { topic: "Nombor hingga 1000", sk_code: "1.1", sk_title: "Nilai Nombor hingga 1000", sp_code: "1.1.1", title: "Menamakan nombor hingga 1000 mengikut kumpulan objek" },
      { topic: "Tambah, Tolak, Darab dan Bahagi", sk_code: "2.1", sk_title: "Tambah dalam Lingkungan 1000", sp_code: "2.1.1", title: "Menambah dua nombor mengumpul semula hingga 1000" },
      { topic: "Pecahan dan Perpuluhan", sk_code: "3.1", sk_title: "Pecahan Wajar", sp_code: "3.1.1", title: "Mengenal pasti dan menyebut pecahan wajar penyebut hingga 10" },
      { topic: "Wang", sk_code: "4.1", sk_title: "Tambah dan Tolak Wang", sp_code: "4.1.1", title: "Menambah dan menolak nilai wang hingga RM100" }
    ],
    "Tahun 3": [
      { topic: "Nombor hingga 10,000", sk_code: "1.1", sk_title: "Nilai Nombor hingga 10,000", sp_code: "1.1.1", title: "Menamai nombor hingga 10,000 dan membilang secara tertib" },
      { topic: "Pecahan, Perpuluhan & Peratus", sk_code: "3.1", sk_title: "Pecahan Tak Wajar", sp_code: "3.1.1", title: "Mengenal pasti pecahan tak wajar dan nombor bercampur" }
    ],
    "Tahun 4": [
      { topic: "Nombor hingga 100,000", sk_code: "1.6", sk_title: "Operasi Asas Nombor Besar", sp_code: "1.6.1", title: "Operasi asas melibatkan nombor hingga 100,000 dan KBAT" },
      { topic: "Masa dan Waktu", sk_code: "4.1", sk_title: "Penukaran Unit Masa", sp_code: "4.1.1", title: "Menukar unit masa melibatkan jam, hari, minggu, bulan dan tahun" }
    ],
    "Tahun 5": [
      { topic: "Nombor hingga 1,000,000", sk_code: "1.1", sk_title: "Nilai Nombor hingga 1,000,000", sp_code: "1.1.1", title: "Membaca, menyebut dan menulis sebarang nombor hingga 1,000,000" }
    ],
    "Tahun 6": [
      { topic: "Nombor Bulat dan Pecahan Juta", sk_code: "1.1", sk_title: "Nombor Juta", sp_code: "1.1.1", title: "Menyelesaikan ayat matematik melibatkan pecahan juta" }
    ]
  },
  "Sains": {
    "Tahun 1": [
      { topic: "Kemahiran Proses Sains", sk_code: "1.1", sk_title: "Memerhati dan Berkomunikasi", sp_code: "1.1.1", title: "Memerhati menggunakan deria yang terlibat untuk mengumpul maklumat" },
      { topic: "Manusia dan Deria", sk_code: "2.1", sk_title: "Deria Manusia", sp_code: "2.1.1", title: "Mengenal pasti lima deria utama manusia dan fungsinya" },
      { topic: "Benda Hidup dan Bukan Hidup", sk_code: "3.1", sk_title: "Ciri Benda Hidup", sp_code: "3.1.1", title: "Membandingkan dan membezakan benda hidup dan benda bukan hidup" }
    ],
    "Tahun 2": [
      { topic: "Tumbesaran Manusia & Haiwan", sk_code: "4.1", sk_title: "Peringkat Tumbesaran", sp_code: "4.1.1", title: "Menyatakan peringkat tumbesaran manusia dan haiwan" }
    ],
    "Tahun 3": [
      { topic: "Gigi dan Pemakanan", sk_code: "3.1", sk_title: "Set Gigi Manusia", sp_code: "3.1.1", title: "Membanding dan membezakan set gigi susu dan set gigi kekal" }
    ],
    "Tahun 4": [
      { topic: "Pernafasan Manusia", sk_code: "2.1", sk_title: "Organ Pernafasan", sp_code: "2.1.1", title: "Mengenal pasti organ yang terlibat dalam proses pernafasan manusia" }
    ],
    "Tahun 5": [
      { topic: "Sistem Rangka & Peredaran Darah", sk_code: "2.1", sk_title: "Sistem Rangka Manusia", sp_code: "2.1.1", title: "Mengenal pasti fungsi sistem rangka utama manusia" }
    ],
    "Tahun 6": [
      { topic: "Mikroorganisma", sk_code: "3.1", sk_title: "Hidupan Seni", sp_code: "3.1.1", title: "Mengenal pasti jenis mikroorganisma melalui pemerhatian" }
    ]
  },
  "Bahasa Melayu": {
    "Tahun 1": [
      { topic: "Mendengar dan Memahami", sk_code: "1.1", sk_title: "Mendengar dan Menyebut", sp_code: "1.1.1", title: "Mendengar, memahami dan menyebut abjad, suku kata dan perkataan" },
      { topic: "Membaca Ayat", sk_code: "2.1", sk_title: "Asas Membaca", sp_code: "2.1.1", title: "Membaca dan memahami perkataan dan ayat tunggal" },
      { topic: "Tatabahasa", sk_code: "5.1", sk_title: "Kata Nama Am & Khas", sp_code: "5.1.1", title: "Memahami dan menggunakan kata nama am dan kata nama khas" }
    ],
    "Tahun 2": [
      { topic: "Kemahiran Membaca & Menulis", sk_code: "2.2", sk_title: "Membaca Perenggan", sp_code: "2.2.1", title: "Membaca dan memahami maklumat daripada petikan" }
    ],
    "Tahun 3": [
      { topic: "Tatabahasa & Imbuhan", sk_code: "5.2", sk_title: "Kata Kerja & Imbuhan Awalan", sp_code: "5.2.1", title: "Memahami dan menggunakan kata kerja mengikut konteks" }
    ],
    "Tahun 4": [
      { topic: "Penulisan Karangan", sk_code: "3.2", sk_title: "Menulis Karangan Berpandu", sp_code: "3.2.1", title: "Membina dan menulis jawapan pemahaman dan karangan pendek" }
    ],
    "Tahun 5": [
      { topic: "Apresiasi Bahasa & Peribahasa", sk_code: "4.1", sk_title: "Seni Bahasa", sp_code: "4.1.1", title: "Memahami dan menyatakan maksud peribahasa dalam petikan" }
    ],
    "Tahun 6": [
      { topic: "Tatabahasa Aras Tinggi", sk_code: "5.3", sk_title: "Ayat Majmuk & Ayat Aktif", sp_code: "5.3.1", title: "Memahami dan membina pelbagai jenis ayat majmuk" }
    ]
  },
  "English": {
    "Tahun 1": [
      { topic: "Phonics and Greeting", sk_code: "1.1", sk_title: "Recognise Sounds and Greetings", sp_code: "1.1.1", title: "Recognise and reproduce target language phonemes accurately" },
      { topic: "Vocabulary & Classroom", sk_code: "2.1", sk_title: "Basic Reading", sp_code: "2.1.1", title: "Read and understand simple phrase frames and vocabulary" }
    ],
    "Tahun 2": [
      { topic: "Daily Routines & Hobbies", sk_code: "1.2", sk_title: "Listening & Speaking", sp_code: "1.2.1", title: "Understand main points of simple short stories and routines" }
    ],
    "Tahun 3": [
      { topic: "Time and Activities", sk_code: "2.2", sk_title: "Reading Comprehension", sp_code: "2.2.1", title: "Read and comprehend short texts about daily activities" }
    ],
    "Tahun 4": [
      { topic: "Past Events & History", sk_code: "3.1", sk_title: "Guided Writing", sp_code: "3.1.1", title: "Write simple guided paragraphs using simple past tense" }
    ],
    "Tahun 5": [
      { topic: "World of Knowledge", sk_code: "2.3", sk_title: "Informational Text", sp_code: "2.3.1", title: "Read and extract key details from non-fiction articles" }
    ],
    "Tahun 6": [
      { topic: "Advanced Composition", sk_code: "3.3", sk_title: "Creative Writing", sp_code: "3.3.1", title: "Compose creative short stories and opinion essays" }
    ]
  }
};

/**
 * Returns available subjects list
 */
export function getTaxonomySubjects() {
  return Object.keys(EXTENDED_DSKP_TAXONOMY);
}

/**
 * Returns available years for a subject
 */
export function getTaxonomyYears(subject = "Matematik") {
  const subObj = EXTENDED_DSKP_TAXONOMY[subject] || EXTENDED_DSKP_TAXONOMY["Matematik"];
  return Object.keys(subObj);
}

/**
 * Returns all SP entries for a subject and year
 */
export function getSPEntries(subject = "Matematik", year = "Tahun 1") {
  const subObj = EXTENDED_DSKP_TAXONOMY[subject] || {};
  return subObj[year] || [];
}

/**
 * Returns distinct topics for a subject and year
 */
export function getTaxonomyTopics(subject = "Matematik", year = "Tahun 1") {
  const entries = getSPEntries(subject, year);
  const topics = Array.from(new Set(entries.map(e => e.topic).filter(Boolean)));
  return topics.length > 0 ? topics : ["Nombor dan Operasi"];
}

/**
 * Returns distinct SKs for a topic
 */
export function getTaxonomySKs(subject = "Matematik", year = "Tahun 1", topic = "") {
  const entries = getSPEntries(subject, year);
  const filtered = topic ? entries.filter(e => e.topic === topic) : entries;

  const skMap = new Map();
  filtered.forEach(e => {
    if (e.sk_code && !skMap.has(e.sk_code)) {
      skMap.set(e.sk_code, { sk_code: e.sk_code, title: e.sk_title || `SK ${e.sk_code}` });
    }
  });

  const result = Array.from(skMap.values());
  return result.length > 0 ? result : [{ sk_code: "1.1", title: "Standard Kandungan Utama" }];
}

/**
 * Returns SP list for a specific SK code
 */
export function getTaxonomySPs(subject = "Matematik", year = "Tahun 1", topic = "", skCode = "") {
  const entries = getSPEntries(subject, year);
  let filtered = entries;

  if (topic) filtered = filtered.filter(e => e.topic === topic);
  if (skCode) filtered = filtered.filter(e => e.sk_code === skCode);

  return filtered.length > 0 ? filtered : [{ sp_code: "1.1.1", title: `Kemahiran Asas ${topic || subject}` }];
}

/**
 * Returns SP Detail Object for a given SP Code
 */
export function getSPDetail(spCode = "1.1.1") {
  for (const sub of Object.keys(EXTENDED_DSKP_TAXONOMY)) {
    for (const yr of Object.keys(EXTENDED_DSKP_TAXONOMY[sub])) {
      const found = EXTENDED_DSKP_TAXONOMY[sub][yr].find(e => e.sp_code === spCode);
      if (found) return { ...found, subject: sub, year: yr };
    }
  }
  return null;
}
