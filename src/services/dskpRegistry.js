// src/services/dskpRegistry.js
// Centralized KSSR Semakan & KSSM DSKP Official Taxonomy Registry Service

import officialTaxonomy from "@/data/officialCurriculumTaxonomy.json";

export const OFFICIAL_TAXONOMY_TREE = officialTaxonomy;

/**
 * Returns list of available curriculums (e.g. ["KSSR Semakan", "KSSM"])
 */
export function getTaxonomyCurriculums() {
  const list = Array.from(new Set(officialTaxonomy.map(item => item.curriculum).filter(Boolean)));
  return list.length > 0 ? list : ["KSSR Semakan", "KSSM"];
}

/**
 * Returns available levels for a given curriculum (e.g., Tahun 1-6 for KSSR Semakan, Tingkatan 1-5 for KSSM)
 */
export function getTaxonomyLevels(curriculum = "KSSR Semakan") {
  const filtered = officialTaxonomy.filter(item => item.curriculum === curriculum);
  const levels = Array.from(new Set(filtered.map(item => item.level).filter(Boolean)));
  if (levels.length > 0) return levels;

  return curriculum === "KSSM"
    ? ["Tingkatan 1", "Tingkatan 2", "Tingkatan 3", "Tingkatan 4", "Tingkatan 5"]
    : ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];
}

/**
 * Returns available subjects for a curriculum & level
 */
export function getTaxonomySubjects(curriculum = "KSSR Semakan", level = "Tahun 1") {
  let filtered = officialTaxonomy;
  if (curriculum) filtered = filtered.filter(i => i.curriculum === curriculum);
  if (level) filtered = filtered.filter(i => i.level === level);

  const subjects = Array.from(new Set(filtered.map(i => i.subject).filter(Boolean)));
  return subjects.length > 0 ? subjects : ["Matematik", "Sains", "Bahasa Melayu", "English"];
}

/**
 * Returns available domains (Bidang Pembelajaran) for curriculum, level & subject
 */
export function getTaxonomyDomains(curriculum = "KSSR Semakan", level = "Tahun 1", subject = "Matematik") {
  const entry = officialTaxonomy.find(
    i => (i.curriculum === curriculum || !curriculum) && i.level === level && i.subject === subject
  );

  if (entry && entry.domains && entry.domains.length > 0) {
    return entry.domains.map(d => d.name);
  }

  // Fallbacks by subject
  if (subject === "Matematik") return ["Nombor dan Operasi", "Sukatan dan Geometri", "Statistik dan Kebarangkalian"];
  if (subject === "Sains") return ["Inkuiri Dalam Sains", "Sains Hayat", "Sains Fizikal", "Sains Bahan", "Bumi dan Angkasa"];
  if (subject === "Bahasa Melayu") return ["Kemahiran Mendengar dan Bertutur", "Kemahiran Membaca", "Kemahiran Menulis", "Tatabahasa"];
  return ["Bidang Utama"];
}

/**
 * Returns available topics for curriculum, level, subject & domain
 */
export function getTaxonomyTopics(curriculum = "KSSR Semakan", level = "Tahun 1", subject = "Matematik", domain = "") {
  // Support legacy signature (subject, year)
  if (typeof curriculum === "string" && !["KSSR Semakan", "KSSM"].includes(curriculum)) {
    subject = curriculum;
    level = level || "Tahun 1";
    curriculum = level.startsWith("Tingkatan") ? "KSSM" : "KSSR Semakan";
  }

  const entry = officialTaxonomy.find(
    i => (i.curriculum === curriculum || !curriculum) && i.level === level && i.subject === subject
  );

  if (entry && entry.domains) {
    let topics = [];
    entry.domains.forEach(d => {
      if (!domain || d.name === domain) {
        d.topics.forEach(t => topics.push(t.topic_name));
      }
    });
    if (topics.length > 0) return Array.from(new Set(topics));
  }

  return ["Nombor Bulat hingga 100", "Tambah dan Tolak", "Pecahan", "Wang"];
}

/**
 * Returns subtopics for curriculum, level, subject, domain & topic
 */
export function getTaxonomySubtopics(curriculum = "KSSR Semakan", level = "Tahun 1", subject = "Matematik", domain = "", topic = "") {
  const entry = officialTaxonomy.find(
    i => (i.curriculum === curriculum || !curriculum) && i.level === level && i.subject === subject
  );

  if (entry && entry.domains) {
    let subtopics = [];
    entry.domains.forEach(d => {
      if (!domain || d.name === domain) {
        d.topics.forEach(t => {
          if (!topic || t.topic_name === topic) {
            t.subtopics.forEach(st => subtopics.push(st.name));
          }
        });
      }
    });
    if (subtopics.length > 0) return Array.from(new Set(subtopics));
  }

  return ["Membilang dan nilai nombor", "Operasi asas", "Penyelesaian masalah"];
}

/**
 * Returns Standard Pembelajaran (SP) entries
 */
export function getTaxonomySPs(curriculum = "KSSR Semakan", level = "Tahun 1", subject = "Matematik", domain = "", topic = "", subtopic = "", skCode = "") {
  // Legacy signature handling (subject, year, topic, skCode)
  if (typeof curriculum === "string" && !["KSSR Semakan", "KSSM"].includes(curriculum)) {
    subject = curriculum;
    level = level || "Tahun 1";
    topic = subject;
    skCode = domain;
    curriculum = level.startsWith("Tingkatan") ? "KSSM" : "KSSR Semakan";
    domain = "";
    subtopic = "";
  }

  const entry = officialTaxonomy.find(
    i => (i.curriculum === curriculum || !curriculum) && i.level === level && i.subject === subject
  );

  let spList = [];
  if (entry && entry.domains) {
    entry.domains.forEach(d => {
      if (!domain || d.name === domain) {
        d.topics.forEach(t => {
          if (!topic || t.topic_name === topic) {
            t.subtopics.forEach(st => {
              if (!subtopic || st.name === subtopic) {
                st.standard_learning.forEach(sp => {
                  if (!skCode || sp.sk_code === skCode) {
                    spList.push({
                      ...sp,
                      curriculum,
                      level,
                      subject,
                      domain: d.name,
                      topic: t.topic_name,
                      subtopic: st.name
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  if (spList.length > 0) return spList;

  return [
    {
      sk_code: "1.1",
      sk_title: "Standard Kandungan Utama",
      sp_code: "1.1.1",
      title: `Kemahiran Asas DSKP ${topic || subject}`,
      curriculum,
      level,
      subject,
      topic
    }
  ];
}

/**
 * Legacy compatibility helpers
 */
export function getTaxonomyYears(subject = "Matematik") {
  return ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6", "Tingkatan 1", "Tingkatan 2", "Tingkatan 3"];
}

export function getSPEntries(subject = "Matematik", year = "Tahun 1") {
  return getTaxonomySPs("KSSR Semakan", year, subject);
}

export function getTaxonomySKs(subject = "Matematik", year = "Tahun 1", topic = "") {
  const sps = getTaxonomySPs("KSSR Semakan", year, subject, "", topic);
  const skMap = new Map();
  sps.forEach(sp => {
    if (sp.sk_code && !skMap.has(sp.sk_code)) {
      skMap.set(sp.sk_code, { sk_code: sp.sk_code, title: sp.sk_title || `SK ${sp.sk_code}` });
    }
  });
  const res = Array.from(skMap.values());
  return res.length > 0 ? res : [{ sk_code: "1.1", title: "Standard Kandungan Utama" }];
}

export function getSPDetail(spCode = "1.1.1") {
  for (const entry of officialTaxonomy) {
    for (const d of entry.domains || []) {
      for (const t of d.topics || []) {
        for (const st of t.subtopics || []) {
          for (const sp of st.standard_learning || []) {
            if (sp.sp_code === spCode) {
              return {
                ...sp,
                curriculum: entry.curriculum,
                year: entry.level,
                subject: entry.subject,
                domain: d.name,
                topic: t.topic_name,
                subtopic: st.name
              };
            }
          }
        }
      }
    }
  }
  return null;
}

export default OFFICIAL_TAXONOMY_TREE;
