import retentionRules from '../data/retentionRules.json';

/**
 * Gets the daily goal status for a student.
 */
export const getDailyGoalStatus = (questsCompletedToday) => {
  const target = retentionRules.daily_goal.target_quests;
  const isCompleted = questsCompletedToday >= target;
  
  return {
    title: retentionRules.daily_goal.title,
    current: Math.min(questsCompletedToday, target),
    target: target,
    isCompleted
  };
};

/**
 * Calculates current active streak and checks for new milestone rewards.
 */
export const calculateStreak = (currentStreakDays) => {
  let milestone = null;
  
  // Check if current streak hits a milestone exactly
  if (retentionRules.streaks[currentStreakDays]) {
    milestone = retentionRules.streaks[currentStreakDays];
  }
  
  return {
    currentStreak: currentStreakDays,
    milestoneAchieved: milestone
  };
};

/**
 * Generates a contextual motivational message.
 * @param {'success' | 'comeback' | 'struggling'} state 
 */
export const generateMotivationMessage = (state) => {
  const messages = retentionRules.motivation_messages[state] || retentionRules.motivation_messages.success;
  // Pick a random message from the corresponding array
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Aggregates cohort retention analytics for the admin dashboard.
 * Simulates the dashboard logic over the 30-day pilot.
 */
export const calculateCohortRetention = (mockCohortData) => {
  // In a real environment, this calculates from Base44 queries mapping active logins over time.
  // For the MVP, we use simulated cohort aggregation.
  
  if (!mockCohortData || mockCohortData.length === 0) {
    return {
      dailyActiveStudents: 0,
      returningStudents: 0,
      averageStreak: 0,
      retention7Day: 0,
      retention30Day: 0,
      missionCompletionRate: 0
    };
  }
  
  let totalStreak = 0;
  let returningCount = 0;
  let retained7 = 0;
  let retained30 = 0;
  
  mockCohortData.forEach(student => {
    totalStreak += student.currentStreak;
    if (student.currentStreak > 1) returningCount++;
    if (student.daysActive >= 7) retained7++;
    if (student.daysActive >= 30) retained30++;
  });
  
  const total = mockCohortData.length;
  
  return {
    dailyActiveStudents: total,
    returningStudents: returningCount,
    averageStreak: Math.round(totalStreak / total),
    retention7Day: Math.round((retained7 / total) * 100),
    retention30Day: Math.round((retained30 / total) * 100),
    missionCompletionRate: 85 // Static simulated metric for MVP
  };
};
