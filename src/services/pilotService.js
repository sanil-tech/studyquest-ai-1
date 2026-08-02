import pilotCurriculum from '../data/pilotCurriculum.json';
import pilotTestStudents from '../data/pilotTestStudents.json';
import { getStudent, createStudent } from './database/studentRepository';
import { getStudentMastery, getWeakAreas } from './database/masteryRepository';
import { getLearningHistory } from './database/progressRepository';
import { getDiagnosticHistory } from './database/assessmentRepository';
import { getTutorInteractions } from './database/tutorRepository';
import { generateRecommendations } from './recommendationEngine';

/**
 * Initializes a new student into the pilot program.
 */
export const initializePilotStudent = async (studentId, name) => {
  let student = await getStudent(studentId);
  if (!student) {
    student = await createStudent(studentId, name, "KSSR", "Tahun 1");
  }

  const diagnostics = await getDiagnosticHistory(studentId);
  const needsDiagnostic = !diagnostics || diagnostics.length === 0;

  return {
    student,
    needsDiagnostic,
    nextAction: needsDiagnostic ? 'START_DIAGNOSTIC' : 'GENERATE_PATH',
    curriculum: pilotCurriculum
  };
};

/**
 * Generates the daily mission "Cabaran Hari Ini" based on mastery and the pilot curriculum.
 */
export const getDailyMission = async (studentId) => {
  // Use existing intelligence engine to decide the SP
  const recommendations = await generateRecommendations(studentId, "Matematik", "Tahun 1");
  
  if (!recommendations || recommendations.length === 0) {
    // Fallback to the first topic in the pilot curriculum if no data exists
    const firstTopic = pilotCurriculum.topics[0];
    return {
      title: "Cabaran Hari Ini",
      mission: `Misi: Kenali ${firstTopic.topic}`,
      sp_code: firstTopic.sp_codes[0],
      widget: firstTopic.widget_types[0],
      rewards: {
        stars: 50,
        xp: 100,
        badge: "Peneroka Baru"
      }
    };
  }

  // Use the top recommendation
  const topRec = recommendations[0];
  const matchedTopic = pilotCurriculum.topics.find(t => t.sp_codes.includes(topRec.sp_code)) || pilotCurriculum.topics[0];
  
  return {
    title: "Cabaran Hari Ini",
    mission: `Misi: Kuasai ${matchedTopic.topic} (${topRec.sp_code})`,
    sp_code: topRec.sp_code,
    widget: matchedTopic.widget_types[0],
    rewards: {
      stars: topRec.priority === 'CRITICAL' ? 100 : 50, // More rewards for tackling weak areas
      xp: topRec.priority === 'CRITICAL' ? 250 : 150,
      badge: topRec.priority === 'CRITICAL' ? "Pemulihan Bijak" : "Penjelajah Kuat"
    }
  };
};

/**
 * Aggregates all data into the Parent Progress Report specific for the Pilot MVP.
 */
export const getPilotProgressReport = async (studentId) => {
  // Check if it's a mocked test student first
  const mockStudent = pilotTestStudents.find(s => s.id === studentId);
  if (mockStudent) {
    return {
      student_name: mockStudent.name,
      lessons_completed: mockStudent.profile.lessons_completed,
      mastery_percentage: mockStudent.profile.mastery_average,
      strengths: mockStudent.profile.strengths,
      improvement_areas: mockStudent.profile.mistakes,
      ai_tutor_usage: mockStudent.profile.tutor_hints_used,
      recommended_parent_activity: mockStudent.profile.status === 'STRUGGLING' 
        ? "Lakukan latihan mengira fizikal bersama anak (guna guli atau blok)."
        : "Tahniah! Anak anda menunjukkan prestasi baik. Galakkan mereka terus mencuba."
    };
  }

  // Real Database Flow
  const student = await getStudent(studentId);
  const weakAreas = await getWeakAreas(studentId) || [];
  const history = await getLearningHistory(studentId) || [];
  const tutorLogs = await getTutorInteractions(studentId) || [];

  // Calculate overall mastery average for Tahun 1 Math
  let totalScore = 0;
  let count = 0;
  for (const topic of pilotCurriculum.topics) {
    for (const sp of topic.sp_codes) {
      const mastery = await getStudentMastery(studentId, sp);
      if (mastery) {
        totalScore += mastery.mastery_percentage;
        count++;
      }
    }
  }
  const masteryAvg = count === 0 ? 0 : Math.round(totalScore / count);

  return {
    student_name: student ? student.name : "Unknown",
    lessons_completed: history.length,
    mastery_percentage: masteryAvg,
    strengths: count > 0 && weakAreas.length === 0 ? ["Prestasi Baik Secara Umum"] : [],
    improvement_areas: weakAreas.map(w => w.sp_code),
    ai_tutor_usage: tutorLogs.length,
    recommended_parent_activity: weakAreas.length > 0 
      ? `Bantu anak anda ulang kaji tajuk yang berkaitan dengan ${weakAreas[0].sp_code}.` 
      : "Teruskan memberi sokongan! Anak anda berada di landasan yang betul."
  };
};
