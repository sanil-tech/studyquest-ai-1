// src/lib/adventureEngine.js
import { replaceStudentVariables } from "./personalize";

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
  TEXT: { stage: "DISCOVER", icon: "📖", defaultTitle: "Terokai Konsep" },
  text_markdown: { stage: "DISCOVER", icon: "📖", defaultTitle: "Terokai Konsep" },
  note: { stage: "DISCOVER", icon: "📝", defaultTitle: "Nota Kembara" },
  text: { stage: "DISCOVER", icon: "📖", defaultTitle: "Terokai Konsep" },

  VIDEO_EMBED: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  VIDEO: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  video_embed: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  video: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  VIDEO_SCRIPT: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },
  video_script: { stage: "DISCOVER", icon: "🎬", defaultTitle: "Tonton & Elusif" },

  INFOGRAPHIC: { stage: "DISCOVER", icon: "🎨", defaultTitle: "Peta Visual" },
  IMAGE: { stage: "DISCOVER", icon: "🖼️", defaultTitle: "Peta Visual" },
  infographic: { stage: "DISCOVER", icon: "🎨", defaultTitle: "Peta Visual" },
  image: { stage: "DISCOVER", icon: "🖼️", defaultTitle: "Peta Visual" },

  AI_EXPLANATION: { stage: "DISCOVER", icon: "🤖", defaultTitle: "Penerangan Pintar AI" },
  ai_explanation: { stage: "DISCOVER", icon: "🤖", defaultTitle: "Penerangan Pintar AI" },

  TEACHER_GUIDE: { stage: "DISCOVER", icon: "📚", defaultTitle: "Panduan Pembelajaran" },
  teacher_guide: { stage: "DISCOVER", icon: "📚", defaultTitle: "Panduan Pembelajaran" },

  COMMON_MISTAKES: { stage: "INTERACT", icon: "⚠️", defaultTitle: "Kesilapan Lazim" },
  common_mistakes: { stage: "INTERACT", icon: "⚠️", defaultTitle: "Kesilapan Lazim" },

  MINDMAP: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },
  MIND_MAP: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },
  mindmap: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },
  mind_map: { stage: "INTERACT", icon: "🧠", defaultTitle: "Peta Minda Interaktif" },

  FLASHCARD_DECK: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },
  FLASHCARD: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },
  FLASHCARDS: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },
  flashcard: { stage: "INTERACT", icon: "🎴", defaultTitle: "Kad Minda Memori" },

  INTERACTIVE_GAME: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  GAME: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  ACTIVITY: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },
  ACTIVITIES: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },
  interactive_game: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  game: { stage: "INTERACT", icon: "🎮", defaultTitle: "Cabaran Permainan" },
  activity: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },
  activities: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },
  INTERACTIVE: { stage: "INTERACT", icon: "🎮", defaultTitle: "Aktiviti Interaktif" },
  interactive: { stage: "INTERACT", icon: "🎮", defaultTitle: "Aktiviti Interaktif" },
  LESSON_ACTIVITY: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },
  lesson_activity: { stage: "INTERACT", icon: "⚡", defaultTitle: "Aktiviti Pembelajaran" },

  INTERACTIVE_PLACE_VALUE: { stage: "INTERACT", icon: "🎮", defaultTitle: "Aktiviti Nilai Tempat" },
  interactive_place_value: { stage: "INTERACT", icon: "🎮", defaultTitle: "Aktiviti Nilai Tempat" },
  BOSS_CHALLENGE: { stage: "INTERACT", icon: "👑", defaultTitle: "Cabaran Interaktif" },
  boss_challenge: { stage: "INTERACT", icon: "👑", defaultTitle: "Cabaran Interaktif" },
  DRAG_DROP: { stage: "INTERACT", icon: "🧩", defaultTitle: "Aktiviti Suai Padan" },
  drag_drop: { stage: "INTERACT", icon: "🧩", defaultTitle: "Aktiviti Suai Padan" },
  MATCHING_GAME: { stage: "INTERACT", icon: "🧩", defaultTitle: "Permainan Padanan" },
  matching_game: { stage: "INTERACT", icon: "🧩", defaultTitle: "Permainan Padanan" },

  REFLECTION: { stage: "INTERACT", icon: "💭", defaultTitle: "Refleksi Kendiri" },
  reflection: { stage: "INTERACT", icon: "💭", defaultTitle: "Refleksi Kendiri" },

  WORKSHEET: { stage: "PRACTICE", icon: "📑", defaultTitle: "Lembaran Kerja Pengembara" },
  worksheet: { stage: "PRACTICE", icon: "📑", defaultTitle: "Lembaran Kerja Pengembara" },
  PRACTICE: { stage: "PRACTICE", icon: "📑", defaultTitle: "Latihan Pengukuhan" },
  practice: { stage: "PRACTICE", icon: "📑", defaultTitle: "Latihan Pengukuhan" },
  EXERCISE: { stage: "PRACTICE", icon: "📑", defaultTitle: "Latihan Pengukuhan" },
  exercise: { stage: "PRACTICE", icon: "📑", defaultTitle: "Latihan Pengukuhan" },

  QUIZ: { stage: "CHALLENGE", icon: "👑", defaultTitle: "Cabaran Boss Utama" },
  quiz: { stage: "CHALLENGE", icon: "👑", defaultTitle: "Cabaran Boss Utama" }
};

/**
 * Transforms raw content_blocks and quiz into structured Missions for Learning Adventure
 * 
 * @param {Array} contentBlocks - Array of block items from getLearningPackage
 * @param {Object} packageData - Full package object from getLearningPackage
 * @param {string} studentName - Current personalized student name
 * @returns {Object} Structured Adventure object with world, mascot, and missions
 */
export function transformBlocksToMissions(contentBlocks = [], packageData = {}, studentName = "Pengembara") {
  console.log("[STUDYQUEST DATA FLOW AUDIT]", {
    step: "2_transformBlocksToMissions_input",
    studentName,
    studentNameSource: {
      passedStudentName: studentName,
      packageStudentContext: packageData?.student_context
    },
    rawContentBlocks: contentBlocks,
    activitiesSource: {
      packageActivities: packageData?.activities,
      packageActivity: packageData?.activity,
      blockActivities: contentBlocks?.filter(b => String(b.block_type).toUpperCase().includes("ACTIVIT"))
    },
    videoPayload: {
      packageVideoUrl: packageData?.video_url,
      packageYoutubeUrl: packageData?.youtube_url,
      videoBlocks: contentBlocks?.filter(b => String(b.block_type).toUpperCase().includes("VIDEO"))
    },
    quizAssessmentId: {
      assessments: packageData?.assessments,
      primaryAssessmentId: packageData?.assessments?.[0]?.id,
      quizBlock: contentBlocks?.filter(b => String(b.block_type).toUpperCase().includes("QUIZ"))
    }
  });

  const subjectDisplay = replaceStudentVariables(packageData?.subject_display || packageData?.subject || "Pembelajaran", studentName);
  const lessonTitle = replaceStudentVariables(packageData?.lesson_title || "Misi Utama", studentName);
  const topicName = replaceStudentVariables(packageData?.topic || lessonTitle, studentName);
  const rawDescription = packageData?.lesson_description || `Kembara interaktif bagi menguasai ${topicName}.`;
  const description = replaceStudentVariables(rawDescription, studentName);

  const worldName = `Dunia ${subjectDisplay}`;
  
  const mascot = {
    name: "Otan",
    avatar: "🦧",
    role: "Rakan Pengembaraan Pengembara",
    personality: "Mesra, Ceria, Suka Membantu, Memberi Galakan",
    greeting: replaceStudentVariables(`Hai ${studentName}! Otan jumpa misi baru untuk kamu di ${worldName}!`, studentName)
  };

  // 1. Gather all potential blocks
  const rawBlocks = [...(Array.isArray(contentBlocks) ? contentBlocks : [])];

  // Fold packageData.activities / packageData.activity into blocks if missing
  if (packageData?.activities && Array.isArray(packageData.activities) && packageData.activities.length > 0) {
    packageData.activities.forEach((act, idx) => {
      const exists = rawBlocks.some(b => b.id === act.id || String(b.block_type).toUpperCase().includes("ACTIVIT"));
      if (!exists) {
        rawBlocks.push({
          id: act.id || `activity-${idx + 1}`,
          block_type: "ACTIVITY",
          title: act.title || "Aktiviti Pembelajaran Interaktif",
          payload: act
        });
      }
    });
  } else if (packageData?.activity && typeof packageData.activity === "object") {
    const act = packageData.activity;
    const exists = rawBlocks.some(b => b.id === act.id || String(b.block_type).toUpperCase().includes("ACTIVIT"));
    if (!exists) {
      rawBlocks.push({
        id: act.id || `activity-1`,
        block_type: "ACTIVITY",
        title: act.title || "Aktiviti Pembelajaran Interaktif",
        payload: act
      });
    }
  }

  // 2. Deduplicate VIDEO / VIDEO_SCRIPT blocks & attach fallback packageData.video_url
  const fallbackVideoUrl = packageData?.video_url || packageData?.youtube_url || null;
  const processedBlocks = [];
  let existingVideoBlock = null;

  rawBlocks.forEach((block) => {
    let typeUpper = (block.block_type || "").toUpperCase();
    if (typeUpper === "VIDEO_EMBED" || typeUpper === "VIDEO_SCRIPT" || typeUpper === "SCRIPT") {
      typeUpper = "VIDEO";
    }

    if (typeUpper === "VIDEO") {
      const bPayload = typeof block.payload === "string"
        ? (() => { try { return JSON.parse(block.payload); } catch { return {}; } })()
        : (block.payload || {});

      const vUrl = bPayload.video_url || bPayload.youtube_url || bPayload.media_url || block.video_url || fallbackVideoUrl || "";
      const vScript = bPayload.video_script || bPayload.voice_script || bPayload.script || block.content_markdown || "";

      if (existingVideoBlock) {
        // Merge into existing video block to avoid duplicate video missions!
        if (!existingVideoBlock.payload.video_url && vUrl) {
          existingVideoBlock.payload.video_url = vUrl;
          existingVideoBlock.payload.youtube_url = vUrl;
        }
        if (!existingVideoBlock.payload.video_script && vScript) {
          existingVideoBlock.payload.video_script = vScript;
        }
        if (!existingVideoBlock.payload.summary && (bPayload.summary || vScript)) {
          existingVideoBlock.payload.summary = bPayload.summary || vScript;
        }
      } else {
        existingVideoBlock = {
          ...block,
          block_type: "VIDEO",
          title: (!block.title || block.title === "Skrip Video (AI)" || block.title === "Skrip Video") ? "Taklimat Video" : block.title,
          payload: {
            video_url: vUrl,
            youtube_url: vUrl,
            video_script: vScript,
            summary: bPayload.summary || vScript || ""
          }
        };
        processedBlocks.push(existingVideoBlock);
      }
    } else {
      processedBlocks.push({
        ...block,
        block_type: typeUpper
      });
    }
  });

  const missions = [];
  let missionCounter = 1;

  // Process content blocks into missions
  if (processedBlocks.length > 0) {
    processedBlocks.forEach((block) => {
      const typeInfo = STAGE_MAPPINGS[block.block_type] || {
        stage: "DISCOVER",
        icon: "🌟",
        defaultTitle: "Misi Modul"
      };

      const rawTitle = block.title || typeInfo.defaultTitle;
      const cleanTitle = replaceStudentVariables(rawTitle, studentName);
      const missionTitle = `Misi ${missionCounter}: ${cleanTitle}`;
      const xp = getXpRewardForStage(typeInfo.stage);
      const coins = getCoinsRewardForStage(typeInfo.stage);

      missions.push({
        id: `mission-${missionCounter}`,
        number: missionCounter,
        title: missionTitle,
        stage: typeInfo.stage,
        icon: typeInfo.icon,
        description: replaceStudentVariables(getMissionDescription(typeInfo.stage, cleanTitle), studentName),
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
      title: replaceStudentVariables(`👑 Misi Boss: Ujian Kejuaraan ${topicName}`, studentName),
      stage: "CHALLENGE",
      icon: "👑",
      description: replaceStudentVariables("Buktikan penguasaan topik ini untuk menewaskan cabaran boss dan mendapat ganjaran kejuaraan!", studentName),
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
      title: replaceStudentVariables(`Misi 1: Modul Kembara ${lessonTitle}`, studentName),
      stage: "DISCOVER",
      icon: "🌟",
      description: replaceStudentVariables("Mulai perjalanan kembara untuk menguasai topik ini.", studentName),
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

  const result = {
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

  console.log("[STUDYQUEST DATA FLOW AUDIT]", {
    step: "3_transformBlocksToMissions_output",
    generatedMissions: result.missions
  });

  return result;
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
