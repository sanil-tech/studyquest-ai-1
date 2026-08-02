/**
 * Content Factory Service
 * Automates the identification of missing curriculum content and manages the AI generation queue.
 */
import rules from '../data/contentFactoryRules.json';
import kssrTahun1 from '../data/kssr_matematik_tahun_1.json';

// Simulated state for demonstration
let missingSpQueue = [
  { sp_code: "1.4.1", topic: "Nilai Tempat", subject: "Matematik", year: "Tahun 1" },
  { sp_code: "1.5.1", topic: "Membundar Nombor", subject: "Matematik", year: "Tahun 1" },
  { sp_code: "2.1.2", topic: "Tolak Asas", subject: "Matematik", year: "Tahun 1" }
];

let approvalQueue = [
  { id: "L_NEW_1", sp_code: "1.2.2", title: "Banding Dua Nombor", status: "QUALITY_CHECK", scores: { alignment: 90, pedagogy: 85, assessment: 100 } }
];

export const analyzeCurriculumGaps = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate total SPs in curriculum
  const totalSps = kssrTahun1.topics.flatMap(t => t.standard_pembelajaran).length;
  const coveredSps = totalSps - missingSpQueue.length - approvalQueue.length;
  
  return {
    totalSps,
    coveredSps,
    missingSps: missingSpQueue.length,
    pendingApprovalSps: approvalQueue.length,
    completionPercentage: Math.round((coveredSps / totalSps) * 100)
  };
};

export const getMissingSps = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...missingSpQueue];
};

export const triggerGeneration = async (spCode) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulating AI call
  
  // Remove from missing queue
  missingSpQueue = missingSpQueue.filter(sp => sp.sp_code !== spCode);
  
  // Add to approval queue with simulated quality pass
  const newLesson = {
    id: `L_NEW_${Date.now()}`,
    sp_code: spCode,
    title: `Generated Lesson for ${spCode}`,
    status: "QUALITY_CHECK",
    scores: { alignment: 95, pedagogy: 88, assessment: 100 }
  };
  
  approvalQueue.push(newLesson);
  return newLesson;
};

export const getApprovalQueue = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...approvalQueue];
};

export const approveLesson = async (lessonId) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = approvalQueue.findIndex(l => l.id === lessonId);
  if (index > -1) {
    const lesson = approvalQueue[index];
    lesson.status = "APPROVED";
    // In reality, this would now move to the resourceLibraryService
    approvalQueue.splice(index, 1);
    return lesson;
  }
  throw new Error("Lesson not found in queue.");
};
