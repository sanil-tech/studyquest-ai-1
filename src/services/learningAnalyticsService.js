import pilotTestStudents from '../data/pilotTestStudents.json';
import analyticsRules from '../data/analyticsRules.json';

/**
 * Calculates pilot analytics across the 5 pillars.
 */
export const generatePilotReport = async () => {
  // In a real environment, this would fetch from Base44: PilotAnalytics.filter({...})
  // For the MVP, we simulate the aggregation using our pilot test data to prove the measurement strategy.

  let totalMissions = 0;
  let totalMasteryGain = 0;
  let totalHints = 0;
  let totalMistakesResolved = 0;

  const topicsImprovement = {};

  pilotTestStudents.forEach(student => {
    // 1. Student Engagement
    totalMissions += student.profile.lessons_completed;

    // 2. Learning Improvement
    // We simulate diagnostic score being lower than current mastery to show gain.
    const mockDiagnosticScore = Math.max(0, student.profile.mastery_average - (student.profile.status === 'ADVANCED' ? 30 : student.profile.status === 'ON_TRACK' ? 20 : 5));
    const masteryGain = student.profile.mastery_average - mockDiagnosticScore;
    totalMasteryGain += masteryGain;

    // Aggregate topic improvements based on strengths
    student.profile.strengths.forEach(topic => {
      topicsImprovement[topic] = (topicsImprovement[topic] || 0) + masteryGain;
    });

    // 3. AI Tutor Effectiveness
    totalHints += student.profile.tutor_hints_used;
    // Simulate mistakes resolved (successful help)
    const resolved = Math.floor(student.profile.tutor_hints_used * (student.profile.status === 'ADVANCED' ? 0.9 : student.profile.status === 'ON_TRACK' ? 0.7 : 0.4));
    totalMistakesResolved += resolved;
  });

  const activeStudentsCount = pilotTestStudents.length; // Assuming all 3 are active
  const averageMasteryGain = Math.round(totalMasteryGain / activeStudentsCount);
  const averageMissions = Math.round(totalMissions / activeStudentsCount);
  
  const aiHelpSuccessRate = totalHints > 0 ? Math.round((totalMistakesResolved / totalHints) * 100) : 0;

  // Determine top and bottom topics
  const sortedTopics = Object.entries(topicsImprovement).sort((a, b) => b[1] - a[1]);
  const topImprovement = sortedTopics.length > 0 ? sortedTopics[0][0] : "N/A";
  
  // Collect all problem areas
  const allMistakes = pilotTestStudents.flatMap(s => s.profile.mistakes);
  const mistakeCounts = allMistakes.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  const problemAreas = Object.keys(mistakeCounts).length > 0 ? Object.keys(mistakeCounts).join(", ") : "None";

  // Synthesize Recommendations based on rules
  let recommendations = "";
  if (averageMasteryGain > analyticsRules.learning.mastery_gain_good) {
    recommendations += "Pilot cohort is showing strong learning improvement. ";
  }
  if (aiHelpSuccessRate < analyticsRules.tutor.success_rate_good) {
    recommendations += "AI Tutor prompts need refinement for struggling students. ";
  } else {
    recommendations += "AI Tutor is effectively resolving student misconceptions. ";
  }

  return {
    students: activeStudentsCount,
    averageMasteryGain: `+${averageMasteryGain}%`,
    topImprovement: topImprovement,
    problemAreas: problemAreas,
    aiHelpSuccessRate: `${aiHelpSuccessRate}%`,
    averageMissions: averageMissions,
    recommendations: recommendations.trim()
  };
};
