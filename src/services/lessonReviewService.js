/**
 * Service for Gold Standard Lesson Validation.
 * Allows human reviewers to score generated lessons and extract templates.
 */
import benchmark from '../data/lessonQualityBenchmark.json';
import batchData from '../data/pilotContentBatch001.json';

// Simulating the Batch 001 lessons that require review
let reviewQueue = batchData.targets.map(t => ({
  ...t,
  id: `L_${t.sp_code.replace(/\./g, '')}_v1`,
  status: "PENDING_REVIEW",
  scores: null,
  finalScore: 0,
  isGoldTemplate: false
}));

export const getReviewQueue = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...reviewQueue];
};

export const getBenchmarkMetrics = () => {
  return benchmark.metrics;
};

export const evaluateLesson = async (lessonId, scores) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = reviewQueue.findIndex(l => l.id === lessonId);
  if (index === -1) throw new Error("Lesson not found");

  const lesson = reviewQueue[index];
  
  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;
  
  benchmark.metrics.forEach(m => {
    const rawScore = scores[m.id] || 0;
    weightedSum += rawScore * m.weight;
    totalWeight += m.weight;
  });
  
  const finalScore = Math.round(weightedSum / totalWeight);
  
  // Apply Quality Gates
  if (finalScore >= benchmark.quality_gates.GOLD_STANDARD) {
    lesson.status = "GOLD_CANDIDATE";
  } else if (finalScore >= benchmark.quality_gates.APPROVED) {
    lesson.status = "APPROVED";
  } else {
    lesson.status = "REPAIR_REQUIRED";
  }
  
  lesson.scores = scores;
  lesson.finalScore = finalScore;
  
  return { ...lesson };
};

export const markAsGoldTemplate = async (lessonId) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = reviewQueue.findIndex(l => l.id === lessonId);
  if (index === -1) throw new Error("Lesson not found");
  
  const lesson = reviewQueue[index];
  if (lesson.status !== "GOLD_CANDIDATE") {
    throw new Error("Only GOLD_CANDIDATE lessons can become templates.");
  }
  
  lesson.isGoldTemplate = true;
  lesson.status = "APPROVED_AS_TEMPLATE";
  
  // In a real system, this would extract the structural JSON of the lesson 
  // and send it back to the aiContentEngine for future few-shot prompting.
  
  return { ...lesson };
};
