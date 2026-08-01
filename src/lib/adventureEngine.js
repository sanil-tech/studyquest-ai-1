// src/lib/adventureEngine.js
/**
 * StudyQuest Learning Adventure Engine
 * 
 * Transforms flat lesson content blocks and quizzes into a gamified
 * RPG-style adventure journey with missions, discovery stages, and Cikgu Rusa AI guidance.
 */

/**
 * Stage types mapped from block types
 */
const STAGE_MAPPINGS = {
  TEXT_MARKDOWN: { stage: "DISCOVER", icon: "📖", defaultTitle: "Terokai Konsep" },
  NOTE: { stage: "DISCOVER", icon: "📝", defaultTitle: "Nota Kembara" },
  VIDEO_EMBED: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  VIDEO: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  INFOGRAPHIC: { stage: "DISCOVER", icon: "🎨", defaultTitle: "Peta Visual" },
  IMAGE: { stage: "DISCOVER", icon: "🖼️", defaultTitle: "Peta Visual" },

  MINDMAP: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },
  MIND_MAP: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },
  FLASHCARD_DECK: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },
  FLASHCARD: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },
  INTERACTIVE_GAME: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  GAME: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  ACTIVITY: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },

  WORKSHEET: { stage: "PRACTICE", icon: "📑", defaultTitle: "Lembaran Kerja Pengembara" },
  QUIZ: { stage: "CHALLENGE", icon: "👑", defaultTitle: "Cabaran Boss Utama" }
};

/**
 * Transforms raw content_blocks and quiz into structured Missions for Learning Adventure
 * 
 * @param {Array} contentBlocks - Array of block items from getLearningPackage
 * @param {Object} packageData - Full package object from getLearningPackage
 * @returns {Object} Structured Adventure object with world, mascot, and missions
 */
export function transformBlocksToMissions(contentBlocks = [], packageData = {}) {
  const subjectDisplay = packageData?.subject_display || packageData?.subject || "Pembelajaran";
  const lessonTitle = packageData?.lesson_title || "Misi Utama";
  const topicName = packageData?.topic || lessonTitle;
  const description = packageData?.lesson_description || `Kembara interaktif bagi menguasai ${topicName}.`;

  const worldName = `Dunia ${subjectDisplay}`;
  
  const mascot = {
    name: "Otan",
    avatar: "🦧",
    role: "Rakan Pengembaraan Pengembara",
    personality: "Mesra, Ceria, Suka Membantu, Memberi Galakan",
    greeting: `Hai Pengembara! Otan jumpa misi baru untuk kamu di ${worldName}!`
  };

  const missions = [];
  let missionCounter = 1;

  // Process content blocks into missions
  if (Array.isArray(contentBlocks) && contentBlocks.length > 0) {
    contentBlocks.forEach((block) => {
      const typeInfo = STAGE_MAPPINGS[block.block_type] || {
        stage: "DISCOVER",
        icon: "🌟",
        defaultTitle: "Misi Modul"
      };

      const missionTitle = block.title || typeInfo.defaultTitle;
      const xp = getXpRewardForStage(typeInfo.stage);
      const coins = getCoinsRewardForStage(typeInfo.stage);

      missions.push({
        id: `mission-${missionCounter}`,
        number: missionCounter,
        title: `Misi ${missionCounter}: ${missionTitle}`,
        stage: typeInfo.stage,
        icon: typeInfo.icon,
        description: getMissionDescription(typeInfo.stage, missionTitle),
        status: missionCounter === 1 ? "active" : "locked",
        blocks: [block],
        quizItems: [],
        reward: {
          xp,
          coins,
          badge: null
        },
        xpReward: xp,
        coinsReward: coins,
        unlocked: missionCounter === 1, // First mission unlocked by default
        completed: false
      });

      missionCounter++;
    });
  }

  // Add final Quiz as Boss Challenge Mission if quiz exists
  const quizItems = packageData?.quiz || [];
  if (Array.isArray(quizItems) && quizItems.length > 0) {
    const isOnlyMission = missions.length === 0;
    missions.push({
      id: `mission-boss`,
      number: missionCounter,
      title: `👑 Misi Boss: Ujian Kejuaraan ${topicName}`,
      stage: "CHALLENGE",
      icon: "👑",
      description: "Buktikan penguasaan topik ini untuk menewaskan cabaran boss dan mendapat ganjaran kejuaraan!",
      status: isOnlyMission ? "active" : "locked",
      blocks: [],
      quizItems: quizItems,
      reward: {
        xp: 150,
        coins: 30,
        badge: `${subjectDisplay} Master`
      },
      xpReward: 150,
      coinsReward: 30,
      badgeReward: `${subjectDisplay} Master`,
      unlocked: isOnlyMission,
      completed: false
    });
  }

  // Fallback if no blocks or quiz found
  if (missions.length === 0) {
    missions.push({
      id: `mission-1`,
      number: 1,
      title: `Misi 1: Modul Kembara ${lessonTitle}`,
      stage: "DISCOVER",
      icon: "🌟",
      description: "Mulai perjalanan kembara untuk menguasai topik ini.",
      status: "active",
      blocks: [],
      quizItems: [],
      reward: {
        xp: 50,
        coins: 10,
        badge: null
      },
      xpReward: 50,
      coinsReward: 10,
      unlocked: true,
      completed: false
    });
  }

  return {
    world: {
      name: worldName,
      theme: subjectDisplay.toLowerCase(),
      mascot
    },
    adventure: {
      title: lessonTitle,
      description
    },
    guide: {
      mascot,
      personality: "Mesra, Ceria, Suka Membantu, Memberi Galakan"
    },
    worldName,
    adventureTitle: lessonTitle,
    mascot,
    totalMissions: missions.length,
    totalXpAvailable: missions.reduce((sum, m) => sum + (m.reward?.xp || m.xpReward || 0), 0),
    totalCoinsAvailable: missions.reduce((sum, m) => sum + (m.reward?.coins || m.coinsReward || 0), 0),
    missions
  };
}

/**
 * Calculates current adventure progress based on completed block IDs and quiz status
 * 
 * @param {Object} adventure - Adventure object returned by transformBlocksToMissions
 * @param {Array<string>} completedBlockIds - List of block IDs completed by student
 * @param {boolean} quizCompleted - Whether final quiz is completed
 * @param {number} quizScore - Score percentage on quiz (0-100)
 * @returns {Object} Progress stats and updated missions with completed status
 */
export function calculateMissionProgress(adventure, completedBlockIds = [], quizCompleted = false, quizScore = 0) {
  if (!adventure || !Array.isArray(adventure.missions)) {
    return {
      percent: 0,
      completedCount: 0,
      totalCount: 0,
      currentActiveMissionId: null,
      updatedMissions: []
    };
  }

  const completedSet = new Set(completedBlockIds || []);
  let completedCount = 0;

  const updatedMissions = adventure.missions.map((mission) => {
    let isCompleted = false;

    if (mission.stage === "CHALLENGE") {
      isCompleted = Boolean(quizCompleted && quizScore >= 50);
    } else if (mission.blocks && mission.blocks.length > 0) {
      isCompleted = mission.blocks.every((b) => completedSet.has(b.id));
    }

    if (isCompleted) {
      completedCount++;
    }

    return {
      ...mission,
      completed: isCompleted,
      status: isCompleted ? "completed" : mission.status
    };
  });

  // Apply unlock chain: Mission N is unlocked if Mission N-1 is completed
  let previousCompleted = true; // First mission unlocks automatically
  const unlockedMissions = updatedMissions.map((mission, idx) => {
    const unlocked = idx === 0 || previousCompleted;
    if (!mission.completed) {
      previousCompleted = false;
    }
    const status = mission.completed ? "completed" : (unlocked ? "active" : "locked");
    return {
      ...mission,
      unlocked,
      status
    };
  });

  const totalCount = unlockedMissions.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Find current active mission (first unlocked but not completed, or last if all completed)
  const activeMission = unlockedMissions.find((m) => m.unlocked && !m.completed) || unlockedMissions[unlockedMissions.length - 1];

  return {
    percent,
    completedCount,
    totalCount,
    currentActiveMissionId: activeMission ? activeMission.id : null,
    isFullyMastered: completedCount === totalCount && totalCount > 0,
    updatedMissions
  };
}

/**
 * Dynamically updates unlock status of missions
 * 
 * @param {Array} missions - Mission list
 * @param {Array<string>} completedMissionIds - List of completed mission IDs
 * @returns {Array} Updated missions array
 */
export function unlockNextMission(missions = [], completedMissionIds = []) {
  const completedSet = new Set(completedMissionIds || []);
  let prevComplete = true;

  return missions.map((m, idx) => {
    const isCompleted = completedSet.has(m.id) || m.completed;
    const isUnlocked = idx === 0 || prevComplete;
    if (!isCompleted) {
      prevComplete = false;
    }
    return {
      ...m,
      completed: isCompleted,
      unlocked: isUnlocked,
      status: isCompleted ? "completed" : (isUnlocked ? "active" : "locked")
    };
  });
}

/**
 * Calculates XP and Coins earned for completing a specific mission stage
 * 
 * @param {Object} mission - The mission object
 * @param {boolean} isFirstClear - Whether this is the first time student clears it
 * @returns {Object} { xp, coins, bonusText }
 */
export function calculateAdventureReward(mission, isFirstClear = true) {
  if (!mission) return { xp: 0, coins: 0, bonusText: "" };

  const multiplier = isFirstClear ? 1.5 : 0.5;
  const xp = Math.round((mission.reward?.xp || mission.xpReward || 40) * multiplier);
  const coins = Math.round((mission.reward?.coins || mission.coinsReward || 5) * (isFirstClear ? 1 : 0.5));
  const bonusText = isFirstClear ? "Bonus Kembara Pertama! 🎉" : "Kembara Semula 🔁";

  return {
    xp,
    coins,
    bonusText,
    badge: isFirstClear ? (mission.reward?.badge || mission.badgeReward) : null
  };
}

/**
 * Otan Personality System: Retrieves Otan dialogue and emotion state based on learning events.
 * 
 * @param {string} event - Event type ('MISSION_START' | 'WRONG_ANSWER' | 'HINT_REQUEST' | 'CORRECT_ANSWER' | 'MISSION_COMPLETE' | 'STREAK')
 * @param {string|Object} [context] - Optional context string or object
 * @returns {{ message: string, emotion: string }}
 */
export function getOtanDialogue(event, context = "") {
  const student = typeof context === "object" ? (context.studentName || "Pengembara") : (context || "Pengembara");

  switch (event) {
    case "MISSION_START":
      return {
        message: `Hai ${student}! Otan jumpa misi baru untuk kamu! Mari kita terokai rahsia ini bersama!`,
        emotion: "excited"
      };
    case "WRONG_ANSWER":
      return {
        message: `Tak mengapa ${student}. Mari Otan bantu kamu cuba cara lain.`,
        emotion: "thinking"
      };
    case "HINT_REQUEST":
      return {
        message: `Otan ada petunjuk menarik untuk kamu! Perhatikan konsep utama ini dengan teliti.`,
        emotion: "curious"
      };
    case "CORRECT_ANSWER":
      return {
        message: `Tepat sekali ${student}! Jawapan yang amat bijak!`,
        emotion: "happy"
      };
    case "MISSION_COMPLETE":
      return {
        message: `Hebat ${student}! Otan bangga dengan usaha kamu!`,
        emotion: "celebrate"
      };
    case "STREAK":
      return {
        message: `Luar biasa ${student}! Berjaya menjawab berturut-turut! Semangat kamu makin membara!`,
        emotion: "encourage"
      };
    default:
      return {
        message: `Hai ${student}! Otan sedia membantu pengembaraan kamu hari ini!`,
        emotion: "happy"
      };
  }
}

/**
 * Contextual Helper: Generates Otan AI guidance line for a mission stage or mistake
 * 
 * @param {string} stage - Mission stage (DISCOVER, INTERACT, PRACTICE, CHALLENGE)
 * @param {string} context - Specific context (e.g., 'start', 'success', 'mistake')
 * @returns {string} Motivational Malay phrase from Otan
 */
export function getOtanTip(stage, context = "start") {
  const tips = {
    DISCOVER: {
      start: "Hai Pengembara! Otan membantu kamu memahami maklumat ini dengan teliti!",
      success: "Hebat! Otan bangga dengan usaha kamu menguasai nota penemuan ini! 🌟",
      mistake: "Tak mengapa Pengembara. Mari Otan bantu kamu cuba cara lain."
    },
    INTERACT: {
      start: "Mari teroka visual interaktif ini bersama Otan! Gerakkan objek untuk memahami konsep.",
      success: "Hebat sekali! Visual minda kamu semakin tajam! 🧠",
      mistake: "Tak mengapa Pengembara. Mari Otan bantu kamu cuba cara lain."
    },
    PRACTICE: {
      start: "Masa untuk menguji kefahaman kamu! Otan yakin kamu boleh buat!",
      success: "Latihan selesai dengan cemerlang! XP bertambah! 📑",
      mistake: "Tak mengapa Pengembara. Setiap kesilapan adalah langkah menuju kejayaan."
    },
    CHALLENGE: {
      start: "Cabaran Boss Utama bermula! Otan ada bersama kamu!",
      success: "Luar biasa! Boss tewas dan Otan amat bangga dengan usaha kamu! 👑",
      mistake: "Tak mengapa Pengembara. Lihat petunjuk daripada Otan dan mari cuba bersama-sama."
    }
  };

  return tips[stage]?.[context] || "Teruskan semangat kembara kamu, Pengembara!";
}

export const getCikguRusaTip = getOtanTip;

/**
 * Private helper: Generates Malay mission descriptions based on stage & title
 */
function getMissionDescription(stage, title) {
  switch (stage) {
    case "DISCOVER":
      return `Buka rahsia "${title}" dan kumpul maklumat asas untuk perjalanan kembara kamu.`;
    case "INTERACT":
      return `Gunakan kuasa visual & memori untuk menguasai "${title}".`;
    case "PRACTICE":
      return `Selesaikan cabaran amali "${title}" untuk mengumpul mata XP bonus.`;
    case "CHALLENGE":
      return `Uji keupayaan penuh kamu dalam cabaran kejuaraan "${title}".`;
    default:
      return `Selesaikan Misi "${title}" untuk membuka laluan seterusnya.`;
  }
}

function getXpRewardForStage(stage) {
  switch (stage) {
    case "DISCOVER": return 30;
    case "INTERACT": return 50;
    case "PRACTICE": return 75;
    case "CHALLENGE": return 150;
    default: return 40;
  }
}

function getCoinsRewardForStage(stage) {
  switch (stage) {
    case "DISCOVER": return 5;
    case "INTERACT": return 10;
    case "PRACTICE": return 15;
    case "CHALLENGE": return 30;
    default: return 5;
  }
}
