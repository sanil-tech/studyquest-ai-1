import { buildLearningJourney } from "./learningJourneyEngine.js";
import { analyzeLearningProfile } from "./learningProfileEngine.js";

/**
 * StudyQuest Passport & Adventure Home Experience Engine (Phase 7A)
 * 
 * Pure service layer that synthesizes student profile history, rewards, progress,
 * and achievements into an interactive Passport & Adventure Home Experience model.
 * 
 * Compatible with:
 * - Learning Journey Engine
 * - Reward System (200 XP = 1 Level)
 * - Pure functions only (Zero React or API side-effects)
 */

/**
 * Calculates current student level based on total XP (200 XP per level).
 * 
 * @param {number} xp - Total XP accumulated
 * @returns {number} Level (1+)
 */
export function calculateLevel(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return Math.floor(safeXp / 200) + 1;
}

/**
 * Calculates XP progress details toward the next level.
 * 
 * @param {number} xp - Total XP
 * @param {number} [level] - Current level (auto calculated if omitted)
 * @returns {Object} { currentLevelXp, nextLevelXp, progressPercent, xpToNextLevel }
 */
export function calculatePassportProgress(xp = 0, level = null) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const currentLevel = level || calculateLevel(safeXp);
  const currentLevelBaseXp = (currentLevel - 1) * 200;
  const nextLevelXp = currentLevel * 200;
  const currentLevelXp = safeXp - currentLevelBaseXp;
  const xpToNextLevel = Math.max(0, 200 - currentLevelXp);
  const progressPercent = Math.min(100, Math.round((currentLevelXp / 200) * 100));

  return {
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    xpToNextLevel
  };
}

/**
 * Generates an adaptive Daily Mission based on current learning journey stats.
 * 
 * @param {Object} [learningJourney] - Learning Journey Engine output
 * @returns {Object} Daily Mission object
 */
export function generateDailyMission(learningJourney = null) {
  const momentum = learningJourney?.learning_momentum || "STABLE";
  const retention = learningJourney?.retention_score ?? 70;

  if (retention < 60) {
    return {
      id: "daily_boss_quest",
      title: "Selesaikan Cabaran Boss Kembara",
      description: "Jawab soalan cabaran utama untuk mengukuhkan memori ingatan topik!",
      rewardXp: 120,
      rewardCoins: 30,
      progressPercent: 0,
      isCompleted: false,
      targetType: "BOSS_QUEST"
    };
  }

  if (momentum === "RISING") {
    return {
      id: "daily_perfect_quiz",
      title: "Raih Skor Sempurna (100%)",
      description: "Jawab 1 kuiz tanpa sebarang kesilapan untuk bonus Daun Emas!",
      rewardXp: 150,
      rewardCoins: 40,
      progressPercent: 0,
      isCompleted: false,
      targetType: "PERFECT_QUIZ"
    };
  }

  return {
    id: "daily_complete_mission",
    title: "Lengkapkan 1 Misi Kembara Hari Ini",
    description: "Selesaikan sekurang-kurangnya 1 misi kembara bersama Otan!",
    rewardXp: 100,
    rewardCoins: 25,
    progressPercent: 0,
    isCompleted: false,
    targetType: "COMPLETE_MISSION"
  };
}

/**
 * Generates an encouraging, personalized greeting from Otan mascot.
 * 
 * @param {Object} [journey] - Learning journey summary
 * @param {Object} [student] - Student profile object
 * @returns {string} Otan greeting text
 */
export function generateOtanGreeting(journey = null, student = null) {
  const name = student?.name || student?.full_name || "Pengembara";
  const streak = student?.streak_days || student?.streak || 0;
  const momentum = journey?.learning_momentum || "STABLE";

  if (streak >= 3) {
    return `Selamat kembali, ${name}! 🦧🔥 Hebat! Kamu sudah mengekalkan ${streak} hari berturut-turut! Mari teruskan kecemerlangan hari ini!`;
  }

  if (momentum === "RISING") {
    return `Hai Wira ${name}! 🦧🌟 Otan bangga dengan semangat kamu yang semakin meningkat. Kembara pintar menantikan anda!`;
  }

  return `Hai ${name}! 🦧 Selamat datang ke Pasport Kembara StudyQuest. Otan sedia membimbing anda meneroka dunia ilmu hari ini!`;
}

/**
 * Recommends the next primary World (subject) for student exploration.
 * 
 * @param {Object} [learningJourney] - Learning Journey analysis
 * @returns {Object} World recommendation
 */
export function recommendNextWorld(learningJourney = null) {
  const focus = learningJourney?.recommended_focus;
  if (focus?.subject) {
    return {
      world_name: `Dunia ${focus.subject}`,
      subject: focus.subject,
      topic: focus.topic,
      reason: focus.reason || "Dicadangkan khas oleh AI berdasarkan prestasi kembara anda.",
      priority: focus.priority || "MEDIUM"
    };
  }

  return {
    world_name: "Dunia Matematik",
    subject: "Matematik",
    topic: "Rumah Puluh dan Sa",
    reason: "Sesuai untuk mengukuhkan asas pengiraan dan nilai tempat bersama Otan.",
    priority: "MEDIUM"
  };
}

/**
 * Calculates world completion metrics for a subject based on profile history.
 * 
 * @param {string} subject - Subject name (e.g., "Matematik", "Sains")
 * @param {Array<Object>} [profileHistory=[]] - Student profile snapshots
 * @returns {Object} World Completion details
 */
export function calculateWorldCompletion(subject = "Matematik", profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return {
      completionPercent: 0,
      masteryLevel: "BEGINNER",
      completedMissionsCount: 0,
      status: subject === "Matematik" ? "UNLOCKED" : "LOCKED"
    };
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const topics = latest.topics || {};

  let totalAcc = 0;
  let count = 0;
  let missions = 0;

  Object.keys(topics).forEach((key) => {
    const t = topics[key];
    if (t.subject === subject || subject === "Matematik") {
      totalAcc += t.accuracyPercent || 0;
      count += 1;
      missions += t.completedMissionsCount || 0;
    }
  });

  const avgAcc = count > 0 ? Math.round(totalAcc / count) : 0;
  const completionPercent = Math.min(100, Math.round((missions / Math.max(1, count * 4)) * 100));

  let status = "LOCKED";
  if (completionPercent >= 100) {
    status = "COMPLETED";
  } else if (completionPercent > 0 || subject === "Matematik" || subject === "Sains") {
    status = "IN_PROGRESS";
  } else {
    status = "UNLOCKED";
  }

  const analysis = analyzeLearningProfile(latest);

  return {
    completionPercent: count > 0 ? completionPercent : (subject === "Matematik" ? 25 : 0),
    masteryLevel: count > 0 ? analysis.mastery_level : "BEGINNER",
    completedMissionsCount: missions,
    status
  };
}

/**
 * Extracts recent achievements, badges, and stamps from profile history.
 * 
 * @param {Array<Object>} [profileHistory=[]] - Profile history snapshots
 * @returns {Array<Object>} List of recent achievement objects
 */
export function generateRecentAchievements(profileHistory = []) {
  if (!Array.isArray(profileHistory) || profileHistory.length === 0) {
    return [
      {
        id: "ach_welcome",
        title: "Peneroka Pertama KSSR",
        icon: "🧭",
        date: new Date().toISOString().split("T")[0],
        xpEarned: 50,
        description: "Mendaftar dan memulakan Pasport Kembara StudyQuest!"
      }
    ];
  }

  const latest = profileHistory[profileHistory.length - 1] || {};
  const overallStats = latest.overallStats || {};
  const achievements = [
    {
      id: "ach_welcome",
      title: "Peneroka Pertama KSSR",
      icon: "🧭",
      date: latest.createdAt ? latest.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
      xpEarned: 50,
      description: "Memulakan kembara pertama bersama Otan!"
    }
  ];

  if (overallStats.totalMissionsCompleted >= 1) {
    achievements.push({
      id: "ach_first_mission",
      title: "Wira Misi Sulung",
      icon: "🌟",
      date: latest.updatedAt ? latest.updatedAt.split("T")[0] : new Date().toISOString().split("T")[0],
      xpEarned: 100,
      description: "Berjaya menyelesaikan misi kembara pertama!"
    });
  }

  if (overallStats.averageAccuracyPercent >= 80) {
    achievements.push({
      id: "ach_mastery_mind",
      title: "Pakar Ketepatan",
      icon: "🎯",
      date: latest.updatedAt ? latest.updatedAt.split("T")[0] : new Date().toISOString().split("T")[0],
      xpEarned: 150,
      description: "Mencapai ketepatan jawapan 80% dan ke atas!"
    });
  }

  return achievements;
}

/**
 * Main Function: Builds complete Student Adventure Passport & Home Experience Data.
 * 
 * @param {Object} params
 * @param {Object} params.studentData - Student account metadata (id, name, total_xp, balance, streak_days, year_level, school)
 * @param {Array<Object>} [params.profileHistory=[]] - Historical StudentLearningProfile snapshots
 * @returns {Object} Complete Passport & Adventure Home Experience data object
 */
export function buildAdventurePassport({ studentData = {}, profileHistory = [] }) {
  const safeHistory = Array.isArray(profileHistory) ? profileHistory : [profileHistory];
  const learningJourney = buildLearningJourney(safeHistory);

  const xp = Math.max(0, Number(studentData.total_xp || studentData.xp) || 0);
  const coins = Math.max(0, Number(studentData.balance || studentData.coins) || 0);
  const streak = Math.max(0, Number(studentData.streak_days || studentData.streak) || 0);
  const level = calculateLevel(xp);
  const passportProgress = calculatePassportProgress(xp, level);

  const recentAchievements = generateRecentAchievements(safeHistory);
  const otanGreeting = generateOtanGreeting(learningJourney, studentData);
  const dailyMission = generateDailyMission(learningJourney);
  const recommendedNextWorld = recommendNextWorld(learningJourney);

  // KSSR Primary World Models
  const subjectsList = ["Matematik", "Sains", "Bahasa Melayu", "Bahasa Inggeris", "Sejarah"];
  const worldIcons = {
    Matematik: "🔢",
    Sains: "🔬",
    "Bahasa Melayu": "📚",
    "Bahasa Inggeris": "🔤",
    Sejarah: "🏛️"
  };

  const worlds = subjectsList.map((subj) => {
    const completionData = calculateWorldCompletion(subj, safeHistory);
    return {
      id: `world_${subj.toLowerCase().replace(/\s+/g, "_")}`,
      subject: subj,
      world_name: `Dunia ${subj}`,
      icon: worldIcons[subj] || "🌎",
      completionPercent: completionData.completionPercent,
      masteryLevel: completionData.masteryLevel,
      unlockedCollectibles: Math.floor((completionData.completionPercent / 100) * 5),
      status: completionData.status
    };
  });

  // Stamp and Badge Collections
  const badges = recentAchievements.map(ach => ({
    id: ach.id,
    name: ach.title,
    icon: ach.icon,
    description: ach.description,
    dateUnlocked: ach.date,
    category: "PASSPORT_STAMP"
  }));

  const collections = [
    { id: "col_otan_friend", name: "Lencana Sahabat Otan", worldSubject: "Matematik", icon: "🦧", isUnlocked: true, rarity: "COMMON" },
    { id: "col_number_master", name: "Kad Pakar Nombor", worldSubject: "Matematik", icon: "🔢", isUnlocked: xp >= 100, rarity: "RARE" },
    { id: "col_science_pioneer", name: "Set Kit Sains Rimba", worldSubject: "Sains", icon: "🔬", isUnlocked: xp >= 300, rarity: "EPIC" }
  ];

  const passportNumber = `SQP-${(studentData.id || "0000").toString().slice(-4).toUpperCase()}-${level}`;

  return {
    student: {
      id: studentData.id || "anon",
      name: studentData.name || studentData.full_name || "Wira KSSR",
      avatar: studentData.avatar_url || studentData.avatar || "🦧",
      year_level: studentData.year_level || "Tahun 1",
      school: studentData.school_name || "Sekolah Rendah KSSR"
    },
    level,
    xp,
    coins,
    streak,
    passport: {
      passportNumber,
      issueDate: studentData.created_at ? studentData.created_at.split("T")[0] : "2026-01-01",
      rankTitle: level >= 10 ? "Wira Agong KSSR" : level >= 5 ? "Pengembara Kanan" : "Pengembara Muda",
      stampsCount: recentAchievements.length,
      totalBadgesCount: badges.length
    },
    worlds,
    badges,
    collections,
    recentAchievements,
    nextAdventure: {
      world_name: recommendedNextWorld.world_name,
      adventure_title: `Pengembaraan ${recommendedNextWorld.topic}`,
      topic_slug: recommendedNextWorld.topic.toLowerCase().replace(/\s+/g, "-"),
      reason: recommendedNextWorld.reason
    },
    otanGreeting,
    dailyMission,
    passportProgress
  };
}

export default {
  calculateLevel,
  calculatePassportProgress,
  generateDailyMission,
  generateOtanGreeting,
  recommendNextWorld,
  calculateWorldCompletion,
  generateRecentAchievements,
  buildAdventurePassport
};
