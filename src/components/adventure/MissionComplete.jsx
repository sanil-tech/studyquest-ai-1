import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Award, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * MissionComplete Component
 * 
 * Celebration screen after completing a StudyQuest mission.
 * Features Otan 🦧 mascot encouraging words and reward summary.
 * 
 * @param {Object} props
 * @param {Object} props.mission - Completed mission details
 * @param {Object} props.reward - Earned rewards ({ xp: number, coins: number })
 * @param {string} props.badge - Optional unlocked badge title or image
 * @param {Function} props.onContinue - Callback to return to quest map or proceed
 * @param {string} props.studentName - Name of the Pengembara
 */
export function MissionComplete({
  mission,
  reward = { xp: 50, coins: 15 },
  badge,
  onContinue,
  studentName = "Pengembara"
}) {
  useEffect(() => {
    // Trigger lightweight confetti explosion on mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore fallback if canvas unsupported
    }
  }, []);

  const missionTitle = mission?.title || "Misi Pembelajaran";
  const badgeTitle = badge || mission?.reward?.badge || (mission?.stage === "CHALLENGE" ? "Master Boss" : null);
  const xpGained = reward?.xp || mission?.reward?.xp || 50;
  const coinsGained = reward?.coins || mission?.reward?.coins || 15;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-gradient-to-br from-stone-900 via-stone-900 to-indigo-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Trophy Icon with Bounce Animation */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl border-2 border-amber-200"
        >
          🏆
        </motion.div>

        {/* Title Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            🎉 Misi Selesai!
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-100 pt-1">
            {missionTitle}
          </h2>
        </div>

        {/* Otan Mascot Companion Card */}
        <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-left">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 flex items-center justify-center text-2xl shrink-0 border border-amber-200 shadow-md"
          >
            🦧
          </motion.div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
              Otan Memuji Kamu:
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-100 leading-snug">
              "Hebat {studentName}! Otan bangga dengan usaha kamu menyelesaikan misi ini!"
            </p>
          </div>
        </div>

        {/* Rewards Breakdown Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-950/90 p-3 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
              ⭐ XP Terkumpul
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              +{xpGained} XP
            </span>
          </div>

          <div className="bg-stone-950/90 p-3 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
              🪙 Syiling
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5 block">
              +{coinsGained}
            </span>
          </div>
        </div>

        {/* Optional Badge Reward */}
        {badgeTitle && (
          <div className="bg-gradient-to-r from-emerald-950 to-stone-950 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">
                🏅 Lencana Diterima!
              </span>
              <span className="text-xs font-bold text-emerald-100 truncate block">
                {badgeTitle}
              </span>
            </div>
          </div>
        )}

        {/* Continue Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 border-b-4 border-amber-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Teruskan Kembara <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      </motion.div>
    </div>
  );
}
