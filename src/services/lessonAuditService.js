/**
 * Service to audit the lesson library for completeness, DSKP alignment, and quality.
 */
import auditRules from '../data/lessonAuditRules.json';
import kssrTahun1 from '../data/kssr_matematik_tahun_1.json';

// Simulated Lesson Library Data
let MOCK_LESSONS = [
  { id: "L_101", title: "Mengenal Nombor 1-10", sp_code: "1.1.1", status: "Healthy", score: 92, missing_elements: [] },
  { id: "L_102", title: "Operasi Tambah Asas", sp_code: "2.1.1", status: "Repair Required", score: 45, missing_elements: ["assessment_questions", "interactive_widget"] },
  { id: "L_103", title: "Bentuk 3D", sp_code: "INVALID_CODE", status: "Repair Required", score: 30, missing_elements: ["mastery_link"] }
];

export const runLibraryAudit = async () => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate scan

  const total = MOCK_LESSONS.length;
  const healthy = MOCK_LESSONS.filter(l => l.status === "Healthy").length;
  const repair = MOCK_LESSONS.filter(l => l.status === "Repair Required").length;
  
  // Calculate unmapped by checking against kssr taxonomy
  const validSpCodes = kssrTahun1.topics.flatMap(t => t.standard_pembelajaran.map(sp => sp.code));
  const unmapped = MOCK_LESSONS.filter(l => !validSpCodes.includes(l.sp_code)).length;

  return {
    totalLessons: total,
    bySubject: { "Matematik": total },
    byYear: { "Tahun 1": total },
    healthyCount: healthy,
    repairCount: repair,
    unmappedCount: unmapped,
    overallHealthScore: Math.round(MOCK_LESSONS.reduce((acc, curr) => acc + curr.score, 0) / total)
  };
};

export const getCurriculumCoverage = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mapping SP codes from KSSR data to actual lesson counts
  const coverage = kssrTahun1.topics.map(topic => {
    return {
      topicName: topic.name,
      sps: topic.standard_pembelajaran.map(sp => {
        const lessonCount = MOCK_LESSONS.filter(l => l.sp_code === sp.code).length;
        return {
          code: sp.code,
          description: sp.description,
          lessonCount,
          status: lessonCount > 0 ? "Covered" : "Missing"
        };
      })
    };
  });

  return coverage;
};

export const getRepairQueue = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_LESSONS.filter(l => l.status === "Repair Required");
};

export const generateRepairInstruction = (lesson) => {
  let prompt = `REPAIR REQUIRED FOR LESSON: ${lesson.title} (${lesson.sp_code})\n\n`;
  if (lesson.sp_code === "INVALID_CODE") {
    prompt += `- Lesson mapped to invalid SP code. Re-align with KSSR Taxonomy.\n`;
  }
  if (lesson.missing_elements.length > 0) {
    prompt += `- Missing critical structural elements: ${lesson.missing_elements.join(', ')}. Regenerate these sections immediately to ensure assessment readiness.`;
  }
  return prompt;
};
