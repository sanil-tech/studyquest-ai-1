/**
 * Alpha Operations Service
 * Manages the Founder Acceptance Test, Alpha user telemetry, and Bug Triage.
 */

// Simulated Acceptance Test State
let acceptanceTests = [
  { id: 'auth_flow', name: 'Authentication Flow', description: 'Parent registration, OTP, and Child Profile creation.', passed: true },
  { id: 'routing_engine', name: 'Diagnostic Routing', description: 'Diagnostic score correctly maps to taxonomy SP.', passed: true },
  { id: 'content_delivery', name: 'Content Retrieval', description: 'Interactive widgets load without 500 errors.', passed: true },
  { id: 'tutor_logic', name: 'AI Tutor Logic', description: 'Tutor provides conceptual hint, not direct answer.', passed: true },
  { id: 'telemetry_sync', name: 'Parent Telemetry', description: 'Mastery updates successfully sync to Parent Dashboard.', passed: true }
];

// Simulated Alpha User Telemetry
let alphaUsers = [
  { id: 'U001', family: 'Ahmad Family', child: 'Ali (Tahun 1)', logins: 4, lessonsCompleted: 3, tutorInvocations: 1, status: 'ACTIVE' },
  { id: 'U002', family: 'Lim Family', child: 'Mei Mei (Tahun 1)', logins: 5, lessonsCompleted: 5, tutorInvocations: 0, status: 'ACTIVE' },
  { id: 'U003', family: 'Raju Family', child: 'Karthik (Tahun 1)', logins: 1, lessonsCompleted: 0, tutorInvocations: 0, status: 'AT_RISK' },
  { id: 'U004', family: 'Tan Family', child: 'Jia En (Tahun 1)', logins: 2, lessonsCompleted: 1, tutorInvocations: 4, status: 'STRUGGLING' },
  { id: 'U005', family: 'Siti Family', child: 'Aisyah (Tahun 1)', logins: 0, lessonsCompleted: 0, tutorInvocations: 0, status: 'PENDING_ONBOARDING' }
];

// Simulated Bug Backlog
let bugBacklog = [
  { id: 'BUG-001', reporter: 'System', description: 'Lesson Retrieval Timeout on SP 1.2.1', priority: 'P0', status: 'OPEN' },
  { id: 'BUG-002', reporter: 'Lim Family', description: 'Cikgu AI explanation too wordy.', priority: 'P1', status: 'IN_PROGRESS' },
  { id: 'BUG-003', reporter: 'Ahmad Family', description: 'Gamification animation lag on older iPad.', priority: 'P2', status: 'BACKLOG' }
];

export const getAcceptanceTests = async () => {
  await new Promise(r => setTimeout(r, 200));
  return [...acceptanceTests];
};

export const passAcceptanceTest = async (testId) => {
  await new Promise(r => setTimeout(r, 400));
  const test = acceptanceTests.find(t => t.id === testId);
  if (test) test.passed = true;
  return [...acceptanceTests];
};

export const getAlphaUsers = async () => {
  await new Promise(r => setTimeout(r, 300));
  return [...alphaUsers];
};

export const getBugBacklog = async () => {
  await new Promise(r => setTimeout(r, 300));
  return [...bugBacklog];
};

export const calculateLaunchReadiness = () => {
  const passedCount = acceptanceTests.filter(t => t.passed).length;
  return Math.round((passedCount / acceptanceTests.length) * 100);
};
