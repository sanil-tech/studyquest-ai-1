/**
 * Content Production Service
 * Executes batch generation pipelines for specific curriculum targets.
 */
import batchData from '../data/pilotContentBatch001.json';
import kssrTahun1 from '../data/kssr_matematik_tahun_1.json';

// Simulated database of current production state
let productionDb = batchData.targets.map(t => ({
  ...t,
  status: "MISSING",
  lesson_id: null,
  scores: null
}));

export const getBatchConfig = () => {
  return batchData;
};

export const getContentInventory = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const totalSps = kssrTahun1.topics.flatMap(t => t.standard_pembelajaran).length;
  const existingLessons = productionDb.filter(sp => sp.status === "RESOURCE_LIBRARY").length;
  const missingLessons = totalSps - existingLessons;
  
  return {
    totalSps,
    existingLessons,
    missingLessons,
    coveragePercentage: Math.round((existingLessons / totalSps) * 100)
  };
};

export const getBatchStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...productionDb];
};

export const validateAssessmentLinking = (generatedLesson) => {
  const reqs = batchData.assessment_requirements;
  // Simulated validation against the generated lesson object
  if (!generatedLesson.quiz_id && reqs.has_quiz_id) return false;
  if (generatedLesson.question_count < reqs.min_questions) return false;
  return true;
};

export const processSp = async (spCode) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = productionDb.findIndex(sp => sp.sp_code === spCode);
  if (index === -1) return null;
  
  const sp = productionDb[index];
  
  // Pipeline Transitions
  if (sp.status === "MISSING") {
    sp.status = "GENERATING";
  } else if (sp.status === "GENERATING") {
    sp.status = "QUALITY_CHECK";
    // Simulate generation attachment
    sp.lesson_id = `L_${sp.sp_code.replace(/\./g, '')}_v1`;
    sp.scores = { alignment: 95, pedagogy: 90 };
  } else if (sp.status === "QUALITY_CHECK") {
    // Simulate assessment linking validation
    const mockGeneratedLesson = { quiz_id: `QZ_${sp.lesson_id}`, question_count: 5 };
    
    if (validateAssessmentLinking(mockGeneratedLesson)) {
      sp.status = "APPROVED";
    } else {
      sp.status = "REJECTED";
    }
  } else if (sp.status === "APPROVED") {
    sp.status = "RESOURCE_LIBRARY";
  }
  
  return { ...sp };
};
