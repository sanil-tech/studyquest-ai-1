/**
 * MVP Service for handling Pilot feedback from both parents and students.
 */

// Simulated storage for the pilot
const MOCK_FEEDBACK_DB = {
  student: [],
  parent: []
};

export const submitStudentFeedback = async (childId, emojiValueId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  MOCK_FEEDBACK_DB.student.push({
    childId,
    value: emojiValueId,
    timestamp: new Date().toISOString()
  });

  return { success: true };
};

export const submitParentFeedback = async (parentId, surveyResponses) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  MOCK_FEEDBACK_DB.parent.push({
    parentId,
    responses: surveyResponses,
    timestamp: new Date().toISOString()
  });

  return { success: true };
};

/**
 * Aggregates feedback for the Admin Pilot Dashboard
 */
export const getPilotFeedbackMetrics = async () => {
  // Simulate network
  await new Promise(resolve => setTimeout(resolve, 400));

  // In a real scenario, this processes MOCK_FEEDBACK_DB.
  // For MVP UI, returning simulated aggregated metrics.
  return {
    familyCount: 124,
    activeStudents: 118,
    parentSatisfactionScore: 4.8, // out of 5
    studentEnjoymentScore: 92, // % who clicked 'happy'
    commonComplaints: [
      "Perlu lebih banyak permainan interaktif",
      "Sukar log masuk pada tablet lama"
    ]
  };
};
