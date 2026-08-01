import React from "react";
import { motion } from "framer-motion";
import { Award, Coins, Flame, Star, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PassportSummaryCard Component
 * 
 * Displays student level, XP progress bar, coins, streak, rank title,
 * and official Passport Number summary.
 * 
 * @param {Object} props
 * @param {Object} props.passportData - Data returned by buildAdventurePassport
 * @param {Function} props.onOpenPassport - Action handler when user clicks to open passport
 */
export function PassportSummaryCard({ passportData, onOpenPassport }) {
  const passport = passportData?.passport || {};
  const progress = passportData?.passportProgress || {
    currentLevelXp: 0,
    nextLevelXp: 200,
    progressPercent: 0,
    xpToNextLevel: 200
  };

  const level = passportData?.level || 1;
  const xp = passportData?.xp || 0;
  const coins = passportData?.coins || 0;
  const streak = passportData?.streak || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="p-5 sm:p-6 rounded-3xl border-3 border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-stone-100 shadow-xl space-y-4 relative overflow-hidden"
    >
      {/* Top Passport Badge Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-amber-300 uppercase tracking-wider">
              Pasport Kembara StudyQuest
            </h3>
            <span className="text-[11px] text-stone-400 block font-mono">
              {passport.passportNumber || "SQP-2026-LV1"}
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Rasmi KSSR
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-2 py-1 text-center">
        <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-black text-stone-400 uppercase block">Tahap</span>
          <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
            <Award className="w-4 h-4 text-amber-400" /> LV.{level}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-black text-stone-400 uppercase block">Syiling</span>
          <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
            <Coins className="w-4 h-4 text-amber-400" /> {coins}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-0.5">
          <span className="text-[10px] font-black text-stone-400 uppercase block">Perturut</span>
          <span className="text-xl font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400" /> {streak} Hari
          </span>
        </div>
      </div>

      {/* XP Level Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-stone-300 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Total XP: {xp}
          </span>
          <span className="text-amber-400">
            {progress.currentLevelXp} / 200 XP (Tahap Seterusnya)
          </span>
        </div>

        <div className="h-3 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <Button
          onClick={onOpenPassport}
          variant="outline"
          className="w-full h-11 rounded-2xl font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/20 justify-between gap-2 text-xs"
        >
          <span>Lihat Pasport Penuh & Set Cap Stempel</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default React.memo(PassportSummaryCard);
