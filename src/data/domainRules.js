// src/data/domainRules.js
// Consolidated domain rules configuration module replacing 15 micro-JSON files

export const analyticsRules = {
  engagement: { active_threshold_minutes: 15, high_streak_days: 3 },
  learning: { mastery_gain_excellent: 30, mastery_gain_good: 15, velocity_high: 3, velocity_low: 1 },
  tutor: { success_rate_excellent: 80, success_rate_good: 50, max_hints_before_intervention: 5 },
  parent: { active_visits_per_week: 2 }
};

export const assessmentRules = {
  distractor_traps: {
    addition_overflow: "Memproses tambah tanpa mengumpul semula digit puluh",
    subtraction_underflow: "Menolak nombor kecil daripada nombor besar secara terbalik",
    place_value_swap: "Menukar kedudukan nilai tempat sa dan puluh"
  },
  mastery_thresholds: {
    tp1: 0,
    tp2: 40,
    tp3: 60,
    tp4: 75,
    tp5: 90,
    tp6: 98
  }
};

export const contentFactoryRules = {
  min_blocks: 8,
  required_blocks: [
    "STORY_HOOK",
    "LEARNING_OBJECTIVE",
    "CONCEPT_CPA",
    "WORKED_EXAMPLE",
    "INTERACTIVE_PRACTICE",
    "KNOWLEDGE_CHECK",
    "KEY_TAKEAWAY",
    "MISSION_COMPLETE"
  ]
};

export const contentQualityRules = {
  min_story_text_length: 20,
  min_cpa_explanation_length: 15,
  min_quiz_questions: 3
};

export const feedbackRules = {
  encouragements: [
    "Syabas! Jawapan anda sangat tepat!",
    "Bagus sekali! Suku Penyu sangat bangga dengan anda! 🐢",
    "Hebat! Teruskan usaha gigih ini!"
  ],
  retry_prompts: [
    "Mari cuba sekali lagi dengan teliti.",
    "Jangan risau, kesilapan adalah langkah pertama pembelajaran!",
    "Cuba baca semula petunjuk yang diberikan."
  ]
};

export const gamificationRules = {
  base_xp_per_block: 15,
  completion_bonus_xp: 50,
  perfect_quiz_bonus_xp: 30,
  base_coins_per_lesson: 25
};

export const lessonAuditRules = {
  strict_validation: true,
  auto_retry_failed_blocks: true
};

export const onboardingRules = {
  supported_grades: ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"],
  supported_subjects: ["Matematik", "Sains", "Bahasa Melayu", "English"]
};

export const parentInsightRules = {
  weekly_report_enabled: true,
  alert_on_tp_drop: true
};

export const pilotOperationsRules = {
  max_batch_size: 50,
  timeout_seconds: 30
};

export const pilotReadinessRules = {
  quality_threshold: 85,
  authenticity_threshold: 90
};

export const recommendationRules = {
  max_recommendations: 3,
  prioritize_weak_subtopics: true
};

export const retentionRules = {
  streak_milestones: [3, 7, 14, 30],
  streak_bonus_multiplier: 1.5
};

export const systemHealthRules = {
  check_interval_ms: 60000,
  max_error_rate_percent: 5
};

export const aiTutorRules = {
  mascot_junior: "Suku Penyu 🐢",
  mascot_senior: "Ejen Suku 🦊",
  max_dialogue_length: 120
};

export default {
  analyticsRules,
  assessmentRules,
  contentFactoryRules,
  contentQualityRules,
  feedbackRules,
  gamificationRules,
  lessonAuditRules,
  onboardingRules,
  parentInsightRules,
  pilotOperationsRules,
  pilotReadinessRules,
  recommendationRules,
  retentionRules,
  systemHealthRules,
  aiTutorRules
};
