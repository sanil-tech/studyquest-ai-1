/**
 * MVP Stabilization Service
 * Monitors system health, data integrity, and provides a final demo orchestrator.
 */
import demoStudents from '../data/demoStudents.json';
import { systemHealthRules as rules } from '../data/domainRules.js';

// Simulated Error Log
const MOCK_ERRORS = [
  { id: 1, type: "API_TIMEOUT", module: "AI_Content_Engine", message: "OpenAI generation timed out (>1500ms)", date: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, type: "MISSING_DATA", module: "Base44_Repo", message: "SP Code 1.1.2 mapping missing in Resource Library", date: new Date(Date.now() - 7200000).toISOString() }
];

export const runSystemHealthCheck = async () => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulating checks
  
  return {
    status: "operational",
    components: [
      { name: "Database (Base44)", status: "healthy", latency: "45ms" },
      { name: "Auth Service", status: "healthy", uptime: "99.9%" },
      { name: "AI Content Engine", status: "degraded", issue: "Elevated latency detected" },
      { name: "Curriculum Taxonomy", status: "healthy", coverage: "KSSR Tahun 1 Matematik 100%" }
    ]
  };
};

export const runDataIntegrityCheck = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));

  let issues = [];
  const reqFields = rules.data_integrity.student_required_fields;

  demoStudents.forEach(student => {
    // Check missing fields
    reqFields.forEach(field => {
      if (!student[field]) {
        issues.push(`Student ${student.id} missing required field: ${field}`);
      }
    });

    // Check broken relationships (simulated logic)
    if (!student.mastery_state || student.mastery_state.overall === undefined) {
      issues.push(`Student ${student.id} has corrupted mastery state.`);
    }
  });

  return {
    totalScanned: demoStudents.length,
    issuesFound: issues.length,
    issuesList: issues
  };
};

export const getErrorLog = async () => {
  return [...MOCK_ERRORS];
};

/**
 * Orchestrates a simulated "Happy Path" demonstration for final QA.
 */
export const runFinalDemoScenario = async () => {
  const steps = [];
  
  const logStep = async (msg, delay = 500) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    steps.push({ time: new Date().toISOString(), message: msg });
  };

  await logStep("Starting Final Demo Scenario...");
  await logStep("1. Parent 'Ahmad' registered successfully.");
  await logStep("2. Created child profile 'Ali' (Tahun 1).");
  await logStep("3. Diagnostic Assessment completed. Baseline: 45%.");
  await logStep("4. AI generated 'Nilai Tempat' personalized mission.");
  await logStep("5. Ali completed mission. Requested AI Tutor 1 time.");
  await logStep("6. Mastery Engine updated. New Score: 52%.");
  await logStep("7. Parent Weekly Report generated.");
  await logStep("Final Demo Scenario completed successfully.");

  return steps;
};
