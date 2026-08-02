/**
 * Service for aggregating and managing Pilot Operations telemetry.
 * Integrates with retentionService, feedbackService, parentInsightService, etc.
 */
import demoStudents from '../data/demoStudents.json';
import { getPilotFeedbackMetrics } from './feedbackService';

// Simulated Operations Issue DB
let MOCK_ISSUES = [
  { id: 1, category: "Technical", description: "iPad Mini 4 cannot render widget 2.1", status: "Investigating", date: new Date().toISOString() },
  { id: 2, category: "Content", description: "Typo in Soalan 4 for Nilai Tempat", status: "Resolved", date: new Date(Date.now() - 86400000).toISOString() }
];

export const getPilotOverviewMetrics = async () => {
  // Aggregate data from feedback service and local demo data
  const feedback = await getPilotFeedbackMetrics();
  
  // Calculate mock averages from demoStudents
  const avgStreak = Math.round(demoStudents.reduce((acc, curr) => acc + curr.learning_history.current_streak, 0) / demoStudents.length) || 0;
  
  // Simulating baseline to current gain
  const avgGain = 18; // MVP Mock

  return {
    totalFamilies: feedback.familyCount,
    totalChildren: feedback.activeStudents,
    activeToday: Math.round(feedback.activeStudents * 0.65), // 65% DAU mock
    weeklyActive: Math.round(feedback.activeStudents * 0.90), // 90% WAU mock
    averageStreak: avgStreak,
    averageMasteryGain: avgGain,
    parentSatisfaction: feedback.parentSatisfactionScore
  };
};

export const getStudentHealthList = async () => {
  // In reality, this evaluates conditions in pilotOperationsRules.json against retention/mastery data.
  return demoStudents.map(student => {
    let health = "healthy";
    let flags = [];

    if (student.learning_history.current_streak === 0) {
      health = "needs_attention";
      flags.push("Inactive 3+ days");
    }
    
    if (student.learning_history.ai_hints_used > 50) {
      health = "needs_attention";
      flags.push("High AI Dependency");
    }

    if (student.learning_history.lessons_completed === 0 && student.learning_history.current_streak === 0) {
      health = "critical";
      flags.push("Stopped Learning");
    }

    return {
      id: student.id,
      name: student.name,
      level: student.level,
      healthStatus: health,
      flags
    };
  });
};

export const getPilotActivityFeed = async () => {
  // Simulated real-time feed
  return [
    { id: 101, text: "Ali completed Nilai Tempat mission", type: "learning", time: "2 min ago" },
    { id: 102, text: "Siti requested AI Tutor 3 times", type: "struggle", time: "15 min ago" },
    { id: 103, text: "Parent (Ahmad) submitted feedback (5/5)", type: "feedback", time: "1 hour ago" },
    { id: 104, text: "New family registered: Tan Family", type: "admin", time: "3 hours ago" }
  ];
};

export const getPilotIssues = async () => {
  return [...MOCK_ISSUES];
};

export const createPilotIssue = async (issueData) => {
  const newIssue = {
    id: Date.now(),
    ...issueData,
    status: "Open",
    date: new Date().toISOString()
  };
  MOCK_ISSUES = [newIssue, ...MOCK_ISSUES];
  return newIssue;
};

export const updatePilotIssueStatus = async (issueId, newStatus) => {
  const index = MOCK_ISSUES.findIndex(i => i.id === issueId);
  if (index !== -1) {
    MOCK_ISSUES[index].status = newStatus;
  }
  return MOCK_ISSUES[index];
};
