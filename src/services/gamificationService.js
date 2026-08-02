import gamificationRules from '../data/gamificationRules.json';
import worldMap from '../data/worldMap.json';
import { generateRecommendations } from './recommendationEngine';

/**
 * Calculates XP and Stars for a given lesson result.
 */
export const calculateRewards = (lessonResult) => {
  let xp = 0;
  let stars = 0;

  if (lessonResult.completed) {
    xp += gamificationRules.rewards.lesson_completion.xp;
    stars += gamificationRules.rewards.lesson_completion.stars;
  }

  if (lessonResult.widgetsSuccessful > 0) {
    xp += (gamificationRules.rewards.widget_success.xp * lessonResult.widgetsSuccessful);
  }

  if (lessonResult.masteryImproved) {
    xp += gamificationRules.rewards.assessment_improvement.xp;
    stars += gamificationRules.rewards.assessment_improvement.stars;
  }

  // Add streak bonus if applicable (simplified)
  if (lessonResult.streakActive) {
    xp += gamificationRules.rewards.daily_streak_bonus.xp;
    stars += gamificationRules.rewards.daily_streak_bonus.stars;
  }

  return { xp, stars };
};

/**
 * Calculates level based on total XP.
 */
export const calculateLevel = (totalXp) => {
  const base = gamificationRules.levels.base_xp_required;
  const multiplier = gamificationRules.levels.multiplier_per_level;
  
  let level = 1;
  let xpRequiredForNextLevel = base;
  
  while (totalXp >= xpRequiredForNextLevel) {
    level++;
    xpRequiredForNextLevel = Math.floor(xpRequiredForNextLevel * multiplier);
  }
  
  // Previous level requirement calculation for progress bar
  let prevLevelRequirement = 0;
  if (level > 1) {
    let tempLevel = 1;
    let tempReq = base;
    while (tempLevel < level - 1) {
      tempLevel++;
      tempReq = Math.floor(tempReq * multiplier);
    }
    prevLevelRequirement = tempReq;
  }

  const xpProgressInCurrentLevel = totalXp - prevLevelRequirement;
  const xpNeededForCurrentLevel = xpRequiredForNextLevel - prevLevelRequirement;
  const progressPercentage = (xpProgressInCurrentLevel / xpNeededForCurrentLevel) * 100;

  return { 
    level, 
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    xpRequiredForNextLevel
  };
};

/**
 * Converts a raw SP recommendation into an engaging narrative quest.
 */
export const generateQuestNarrative = (recommendation) => {
  if (!recommendation) return { title: "Teroka Dunia", description: "Bebas meneroka dunia pembelajaran." };
  
  // Map technical SP to narrative
  const mapping = {
    "SP 1.4.1": { title: "Cabaran Kampung Nombor", desc: "Selamatkan 20 robot dengan memahami nilai tempat." },
    "SP 1.5.1": { title: "Misi Nilai Tempat", desc: "Bantu penduduk kampung menyusun rumah mereka mengikut saiz." },
    "SP 2.1.1": { title: "Misi Menambah", desc: "Kumpulkan bahan api kapal angkasa dengan operasi tambah." },
    "SP 2.1.2": { title: "Cabaran Bandar", desc: "Kira jumlah kenderaan di Bandar Matematik." }
  };
  
  const narrative = mapping[recommendation.sp_code] || { 
    title: "Misi Khas", 
    desc: `Kuasai kemahiran rahsia kod ${recommendation.sp_code}.` 
  };

  return narrative;
};

/**
 * Determines the current world based on student mastery profile.
 */
export const getCurrentWorld = (studentMasteryProfile) => {
  let highestWorld = worldMap[0]; // Default to World 1

  for (const world of worldMap) {
    if (world.unlock_requirement.type === "default") continue;
    
    if (world.unlock_requirement.type === "mastery") {
      const requiredTopic = world.unlock_requirement.topic;
      const requiredThreshold = world.unlock_requirement.threshold;
      
      // Simulate checking if the student met the threshold for the required topic
      // In a real app, this queries the studentMasteryProfile structure
      // We assume studentMasteryProfile maps topic names to mastery percentages
      const topicMastery = studentMasteryProfile[requiredTopic] || 0;
      
      if (topicMastery >= requiredThreshold) {
        highestWorld = world;
      } else {
        // Stop checking higher worlds if this one isn't unlocked
        break;
      }
    }
  }

  return highestWorld;
};
