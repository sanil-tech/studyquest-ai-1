/**
 * Service to generate human-readable evidence of learning for parents.
 */
import demoStudents from '../data/demoStudents.json';
import { feedbackRules } from '../data/domainRules.js';

/**
 * Generates a chronological learning timeline for a given student.
 */
export const generateTimeline = (studentId) => {
  const student = demoStudents.find(s => s.id === studentId);
  if (!student) throw new Error("Student not found");

  const baseline = Math.max(0, student.mastery_state.overall - 37); // Simulated baseline
  const current = student.mastery_state.overall;

  return [
    {
      stage: "Sebelum (Baseline)",
      title: "Ujian Diagnostik Awal",
      description: `${student.name} memulakan perjalanan dengan penguasaan asas.`,
      score: `${baseline}%`
    },
    {
      stage: "Semasa (Aktiviti)",
      title: "Cabaran & AI Tutor",
      description: `Menyelesaikan ${student.learning_history.lessons_completed} cabaran dan mendapat ${student.learning_history.ai_hints_used} bantuan bimbingan.`,
      score: null
    },
    {
      stage: "Selepas (Peningkatan)",
      title: "Penguasaan Terkini",
      description: `${student.name} meningkat daripada ${baseline}% kepada ${current}%!`,
      score: `${current}%`,
      highlight: true
    }
  ];
};

/**
 * Generates a non-technical weekly progress report.
 */
export const generateWeeklyReport = (studentId) => {
  const student = demoStudents.find(s => s.id === studentId);
  if (!student) throw new Error("Student not found");

  return {
    greeting: `Laporan Mingguan untuk ${student.name}`,
    summary: `Minggu ini, ${student.name} telah menunjukkan semangat yang hebat.`,
    mastered: ["Asas Nombor", "Sistem Nilai Tempat"], // Simulated human-readable topics
    improving: ["Operasi Tambah (dengan bimbingan)"],
    recommendation: "Banyakkan memuji usaha mereka, dan galakkan bermain permainan nombor di rumah."
  };
};

/**
 * Evaluates if a student deserves a certificate for a specific topic.
 */
export const generateCertificate = (studentId, topicName) => {
  const student = demoStudents.find(s => s.id === studentId);
  if (!student) return null;

  // In reality, this queries the mastery engine for the specific topic.
  // Here we use the overall mastery state for the pilot MVP simulation.
  if (student.mastery_state.overall >= feedbackRules.certificate_thresholds.mastery_percentage) {
    return {
      earned: true,
      title: "Sijil Kecemerlangan",
      message: `${student.name} berjaya menguasai ${topicName} Tahun 1`,
      date: new Date().toLocaleDateString('ms-MY')
    };
  }

  return { earned: false };
};
