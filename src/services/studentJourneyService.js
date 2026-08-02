import { generateRecommendations, recommendDailyMission } from './recommendationEngine';
import { getResourceBySP } from './resourceLibraryService';
import { createDiagnosticAssessment } from './diagnosticAssessmentService';
import { getSPDetails } from './taxonomyService';
import { createStudent, getStudent } from './database/studentRepository';
import { saveMastery, getStudentMastery, getWeakAreas } from './database/masteryRepository';
import { calculateOverallProgress, saveMissionProgress } from './database/progressRepository';

/**
 * Student Journey Service
 * 
 * Sits above all intelligence engines to present a clean, gamified, and 
 * simplified interface for the Student Dashboard UI.
 * 
 * Hides complex SP codes, taxonomy hierarchies, and raw scores from children,
 * translating them into "Missions", "XP", and actionable steps.
 */

// In-memory store for active missions
const activeMissions = {};

/**
 * Initializes a new student into the StudyQuest ecosystem.
 * If they have no mastery data, it forces a diagnostic assessment.
 */
export const initializeStudentJourney = async (studentId, studentName, curriculum, subject, yearLevel) => {
  const progress = await calculateOverallProgress(studentId);
  
  // Ensure student exists in DB
  let student = await getStudent(studentId);
  if (!student) {
    student = await createStudent(studentId, studentName, curriculum, yearLevel);
  }

  if (progress.totalInteractedSPs === 0) {
    // Brand new student needs a diagnostic test
    const diagnosticSession = createDiagnosticAssessment(studentId, curriculum, subject, yearLevel);
    return {
      status: 'NEEDS_DIAGNOSTIC',
      actionUrl: `/diagnostic/${diagnosticSession.sessionId}`,
      message: "Mari kita kenal pasti tahap kamu sebelum mula pengembaraan!"
    };
  }

  return {
    status: 'READY',
    actionUrl: `/home`,
    message: "Selamat kembali, Pengembara!"
  };
};

/**
 * Retrieves the exact payload needed to render the child-friendly Student Dashboard.
 */
export const getStudentHome = async (studentId, studentName, curriculum, grade, subject) => {
  const progress = await calculateOverallProgress(studentId);
  const weakSPs = await getWeakAreas(studentId);
  
  // Fetch raw recommendation data (Engine logic remains sync since it's just pure algorithms over data)
  const recs = generateRecommendations(studentId, curriculum, grade, subject);
  const dailyRec = recommendDailyMission(studentId, curriculum, grade, subject);

  // Translate to kid-friendly mission
  let todayMission = null;
  if (dailyRec.type !== "ALL_CAUGHT_UP") {
    const spResource = getResourceBySP(dailyRec.targetSP);
    todayMission = {
      id: `msn_${Date.now()}`,
      sp_code: dailyRec.targetSP,
      title: `Kuasai: ${spResource?.title || 'Cabaran Hari Ini'}`,
      description: spResource?.description || 'Selesaikan misi ini untuk mendapatkan ganjaran XP.',
      type: dailyRec.type === "REVISION" ? "Latihan Semula" : "Misi Baharu",
      resources: dailyRec.resources
    };
  }

  return {
    studentName,
    currentLevel: `${subject} ${grade}`,
    todayMission,
    masterySummary: `${progress.mastered} kemahiran dikuasai`,
    weakAreas: weakSPs.map(sp => getResourceBySP(sp.sp_code)?.title || sp.sp_code),
    strongAreas: [], // Deprecated for UI simplicity
    progressPercentage: progress.percentage,
    streak: 0, // Temporarily simplified
    xp: progress.mastered * 50, // Mock XP calc
    recommendedLesson: recs.nextLessons[0] || null,
    recommendedWidget: recs.widgets[0] || null,
    estimatedTime: `${recs.estimatedStudyTime} minit`,
    nextMilestone: progress.mastered + 1
  };
};

/**
 * Wrapper to fetch just the isolated daily mission.
 */
export const getTodayMission = (studentId, curriculum, grade, subject) => {
  const dailyRec = recommendDailyMission(studentId, curriculum, grade, subject);
  if (dailyRec.type === "ALL_CAUGHT_UP") return null;

  const spResource = getResourceBySP(dailyRec.targetSP);
  return {
    id: `msn_${Date.now()}`,
    sp_code: dailyRec.targetSP,
    title: `Kuasai: ${spResource?.title || 'Cabaran Hari Ini'}`,
    description: spResource?.description,
    tasks: [
      "Tonton penerangan",
      "Selesaikan aktiviti",
      "Kumpul XP"
    ]
  };
};

/**
 * Begins tracking a mission session.
 */
export const startMission = async (studentId, missionObj) => {
  activeMissions[studentId] = {
    ...missionObj,
    startTime: Date.now(),
    status: 'IN_PROGRESS'
  };
  return activeMissions[studentId];
};

/**
 * Records an atomic attempt during an active mission.
 */
export const recordMissionResult = async (studentId, isCorrect, timeSpent) => {
  const mission = activeMissions[studentId];
  if (!mission) throw new Error("Tiada misi aktif");

  // Route directly into Mastery Engine via Repository
  await saveMastery(studentId, mission.sp_code, isCorrect, timeSpent);
  return getStudentMastery(studentId, mission.sp_code);
};

/**
 * Finalizes the mission session and evaluates if the SP is now mastered.
 */
export const completeMission = async (studentId) => {
  const mission = activeMissions[studentId];
  if (!mission) throw new Error("Tiada misi aktif");

  mission.endTime = Date.now();
  mission.status = 'COMPLETED';

  const finalRecord = await getStudentMastery(studentId, mission.sp_code);
  
  // Persist the mission log
  const xp = finalRecord.current_status === 'MASTERED' ? 50 : 10;
  await saveMissionProgress(studentId, mission.id, mission.sp_code, true, finalRecord.mastery_percentage, xp);
  
  delete activeMissions[studentId];

  return {
    missionCompleted: true,
    newStatus: finalRecord.current_status,
    earnedXp: xp,
    confidence: finalRecord.confidence_level
  };
};

/**
 * Fetches the very next UI route action depending on the student state.
 */
export const getNextAction = (studentId, curriculum, grade, subject) => {
  const mission = getTodayMission(studentId, curriculum, grade, subject);
  if (mission) {
    return { action: 'START_MISSION', payload: mission };
  }
  return { action: 'VIEW_DASHBOARD' };
};

/**
 * Aggregates high-level progress for the child.
 */
export const getLearningProgress = async (studentId, curriculum, grade, subject) => {
  return await calculateOverallProgress(studentId);
};

/**
 * Maps out the sequential path generated by the recommendation engine.
 */
export const getRecommendedPath = (studentId, curriculum, grade, subject) => {
  return generateRecommendations(studentId, curriculum, grade, subject);
};

/**
 * Prepares the structural data payload required for a Parent Dashboard.
 * Translates raw tech data into parent-friendly insights.
 */
export const getStudySummary = async (studentId, studentName, curriculum, grade, subject) => {
  const progress = await calculateOverallProgress(studentId);
  const weakSPs = await getWeakAreas(studentId);
  
  return {
    studentName,
    curriculum,
    grade,
    subject,
    totalLearningTime: "1j 45m", // Mock aggregation
    masteryGrowth: "+5% minggu ini", // Mock delta
    weakTopics: weakSPs.map(sp => {
      const details = getSPDetails(sp.sp_code);
      return {
        sp_code: sp.sp_code,
        title: details?.title,
        status: "Perlu Perhatian"
      };
    }),
    completedMissions: progress.mastered,
    recommendedParentSupport: weakSPs.length > 0 
      ? `Bantu anak anda mengulangkaji topik: ${getSPDetails(weakSPs[0].sp_code)?.title}`
      : "Teruskan galakan! Anak anda berada di landasan yang tepat."
  };
};
