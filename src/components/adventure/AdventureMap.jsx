import React from "react";
import { motion } from "framer-motion";
import { Lock, Star, Compass, Play, Flame, Sparkles, Trophy } from "lucide-react";
import { replaceStudentVariables } from "@/lib/personalize";

/**
 * AdventureMap Component
 * 
 * Interactive quest path and visual learning world map for StudyQuest.
 * 
 * @param {Object} props
 * @param {Object} props.adventure - Adventure object (world, adventure title, missions)
 * @param {Object} props.progress - Progress stats (percent, completedCount, totalCount)
 * @param {Function} props.onSelectMission - Callback when student selects a mission node
 * @param {string} props.activeMissionId - Currently selected or active mission ID
 * @param {string} props.studentName - Personalized student name
 */
export function AdventureMap({
  adventure,
  progress = {},
  onSelectMission,
  activeMissionId,
  studentName = "Pengembara"
}) {
  if (!adventure || !Array.isArray(adventure.missions)) {
    return null;
  }

  const missions = adventure.missions;
  const worldName = replaceStudentVariables(adventure.world?.name || adventure.worldName || "Dunia Matematik", studentName);
  const adventureTitle = replaceStudentVariables(adventure.adventure?.title || adventure.adventureTitle || "Misi Adventure", studentName);
  const percent = progress.percent || 0;

  // Find active mission (selected or first unlocked & incomplete mission)
  const activeMission = missions.find(m => m.id === activeMissionId) ||
    missions.find(m => (m.unlocked || m.status === "active") && !m.completed && m.status !== "completed") ||
    missions.find(m => m.unlocked || m.status === "active") ||
    missions[0];

  const hasNewlyUnlocked = missions.some(m => (m.unlocked || m.status === "active") && !m.completed && m.stage !== "DISCOVER");

  const getNodeIcon = (stage, customIcon) => {
    if (customIcon) return customIcon;
    switch (stage) {
      case "DISCOVER": return "🌱";
      case "INTERACT": return "🏠";
      case "PRACTICE": return "🐊";
      case "CHALLENGE": return "🏰";
      default: return "🌟";
    }
  };

  return (
    <div className="w-full space-y-6 text-stone-100 max-w-2xl mx-auto">
      {/* 1. WORLD DISPLAY HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-stone-900 to-amber-950 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Compass className="w-4 h-4 text-amber-400" />
              🌎 {worldName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight">
              {adventureTitle}
            </h1>
          </div>

          {/* XP & Progress Meter */}
          <div className="flex items-center gap-3 bg-stone-900/90 p-3 rounded-2xl border border-amber-500/30 shrink-0">
            <div className="text-center px-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Kemajuan Kembara
              </span>
              <span className="text-lg font-black text-amber-400">
                {percent}%
              </span>
            </div>
            <div className="w-24 bg-stone-800 rounded-full h-3.5 border border-stone-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. UNLOCK EXPERIENCE CELEBRATION CALLOUT */}
      {hasNewlyUnlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-950 via-stone-900 to-orange-950 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 flex items-center justify-center text-2xl shrink-0 border border-amber-200 shadow-md">
            🦧
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 🎉 Misi Baru Dibuka!
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-100 truncate">
              Otan: "Pengembara! Cabaran baru menanti kamu!"
            </p>
          </div>
        </motion.div>
      )}

      {/* 3. CURRENT MISSION HIGHLIGHT CARD */}
      {activeMission && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-950/80 via-stone-900 to-amber-900/60 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/40 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> 🔥 Misi Aktif
            </span>
            <span className="text-xs font-bold text-amber-400 bg-stone-900 px-2.5 py-1 rounded-full border border-stone-800">
              {activeMission.stage}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
              <span>{getNodeIcon(activeMission.stage, activeMission.icon)}</span>
              {replaceStudentVariables(activeMission.title, studentName)}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
              {replaceStudentVariables(activeMission.description, studentName)}
            </p>
          </div>

          {/* Reward Preview */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Ganjaran:
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-900 px-3 py-1 rounded-xl border border-stone-800 text-xs font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              +{activeMission.reward?.xp || activeMission.xpReward || 50} XP
            </span>
            <span className="inline-flex items-center gap-1 bg-stone-900 px-3 py-1 rounded-xl border border-stone-800 text-xs font-bold text-amber-300">
              🪙 +{activeMission.reward?.coins || activeMission.coinsReward || 15}
            </span>
          </div>

          {/* Start Mission Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMission && onSelectMission(activeMission)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 border-b-4 border-amber-700 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            Mulakan Misi
          </motion.button>
        </motion.div>
      )}

      {/* 2. QUEST PATH JOURNEY NODES */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-5 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Peta Laluan Kembara
          </h3>
          <p className="text-xs text-stone-400 font-medium">
            Selesaikan misi mengikut urutan untuk membuka cabaran Boss!
          </p>
        </div>

        {/* Connected Journey Path List */}
        <div className="relative flex flex-col items-center py-4 space-y-3">
          {missions.map((mission, index) => {
            const isCompleted = mission.completed || mission.status === "completed";
            const isUnlocked = mission.unlocked || mission.status === "active";
            const isActive = activeMission?.id === mission.id;
            const isLast = index === missions.length - 1;

            return (
              <React.Fragment key={mission.id}>
                {/* Mission Node Component */}
                <motion.div
                  whileHover={isUnlocked ? { scale: 1.04 } : {}}
                  whileTap={isUnlocked ? { scale: 0.96 } : {}}
                  onClick={() => {
                    if (isUnlocked && onSelectMission) {
                      onSelectMission(mission);
                    }
                  }}
                  className={`relative w-full max-w-md p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    isActive
                      ? "bg-amber-950/60 border-amber-500 shadow-xl ring-2 ring-amber-500/40"
                      : isCompleted
                      ? "bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400"
                      : isUnlocked
                      ? "bg-stone-900 border-indigo-500/40 hover:border-indigo-400"
                      : "bg-stone-900/40 border-stone-800 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {/* Node Avatar & Title */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 border-2 shadow-md ${
                        isCompleted
                          ? "bg-emerald-500 text-stone-950 border-emerald-300"
                          : isActive
                          ? "bg-amber-500 text-stone-950 border-amber-200 animate-pulse"
                          : isUnlocked
                          ? "bg-indigo-600 text-white border-indigo-400"
                          : "bg-stone-800 text-stone-500 border-stone-700"
                      }`}
                    >
                      {getNodeIcon(mission.stage, mission.icon)}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        {mission.stage === "CHALLENGE" ? "🏰 Boss Quest" : `Misi ${index + 1}`}
                      </span>
                      <h4 className="text-sm font-black text-stone-100">
                        {replaceStudentVariables(mission.title, studentName)}
                      </h4>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center">
                    {isCompleted ? (
                      <span className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-black text-base shadow-sm">
                        ✓
                      </span>
                    ) : isActive ? (
                      <span className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 flex items-center justify-center font-black text-base shadow-sm">
                        🔥
                      </span>
                    ) : isUnlocked ? (
                      <span className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 flex items-center justify-center font-black text-xs uppercase font-bold">
                        Mula
                      </span>
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 text-stone-500 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Vertical Path Connection Line */}
                {!isLast && (
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-500/50 to-indigo-500/50 rounded-full my-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
