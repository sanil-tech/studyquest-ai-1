/**
 * Service to manage real-world deployment readiness.
 * Includes cost tracking, device performance simulation, and lesson versioning.
 */
import rules from '../data/pilotReadinessRules.json';

// Simulated database of lesson versions
let lessonVersions = [
  { id: "L_101", version: "v1.0.0", generated_date: "2024-03-01", approved_by: "System", changes: "Initial generation", status: "APPROVED" },
  { id: "L_102", version: "v1.1.0", generated_date: "2024-03-05", approved_by: null, changes: "AI Repair: Added interactive widget", status: "TESTING" },
  { id: "L_103", version: "v1.0.0", generated_date: "2024-03-10", approved_by: null, changes: "Initial generation", status: "DRAFT" }
];

export const getCostMetrics = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simulated AI usage
  const generatedLessons = 45;
  const cachedLessons = 155; // Lessons served from cache don't cost tokens
  const avgTokensPerLesson = 3500;
  
  const estimatedTokens = generatedLessons * avgTokensPerLesson;
  const estimatedCostMyr = estimatedTokens * rules.thresholds.token_cost_per_1k * 4.7; // Approx conversion to MYR

  return {
    generatedCount: generatedLessons,
    cachedCount: cachedLessons,
    estimatedTokens,
    estimatedCostMyr: estimatedCostMyr.toFixed(2),
    status: estimatedCostMyr < 100 ? "Healthy" : "Warning: High Spend"
  };
};

export const getDeviceTestResults = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    { device: "Android Tablet (Low End)", loadTimeMs: 2800, avgFps: 32, status: "PASS" },
    { device: "iPad (Standard)", loadTimeMs: 1200, avgFps: 60, status: "PASS" },
    { device: "Mobile Browser (4G)", loadTimeMs: 3100, avgFps: 30, status: "WARNING" }, // > 3000ms threshold
    { device: "Desktop (Chrome)", loadTimeMs: 800, avgFps: 60, status: "PASS" }
  ];
};

export const getLessonVersions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...lessonVersions];
};

export const updateLessonStatus = async (lessonId, newStatus) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const lesson = lessonVersions.find(l => l.id === lessonId);
  if (lesson) {
    lesson.status = newStatus;
    if (newStatus === "APPROVED") {
      lesson.approved_by = "Admin_User";
    }
  }
  return lesson;
};

export const getLaunchReadiness = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Simulated aggregation of all previous validation states
  return {
    system: { status: "PASS", detail: "DB and Auth online." },
    content: { status: "PASS", detail: "Taxonomy alignment verified." },
    assessment: { status: "PASS", detail: "Scoring logic validated." },
    aiTutor: { status: "PASS", detail: "Escalation paths tested." },
    device: { status: "WARNING", detail: "Mobile browser loads >3s." }
  };
};
