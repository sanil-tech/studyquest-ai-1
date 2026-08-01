import React from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Gift, Star, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DailyMissionCard Component
 * 
 * Renders the daily mission checklist, reward previews, and action button.
 * 
 * @param {Object} props
 * @param {Object} props.dailyMission - Daily mission data from buildAdventurePassport
 * @param {Function} props.onStartMission - Handler to launch daily mission task
 */
export function DailyMissionCard({ dailyMission, onStartMission }) {
  const mission = dailyMission || {
    id: "daily_complete_mission",
    title: "Lengkapkan 1 Misi Kembara Hari Ini",
    description: "Selesaikan sekurang-kurangnya 1 misi kembara bersama Otan!",
    rewardXp: 100,
    rewardCoins: 25,
    progressPercent: 0,
    isCompleted: false
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="p-5 sm:p-6 rounded-3xl border-2 bg-gradient-to-br from-card via-card to-amber-500/5 text-card-foreground shadow-sm space-y-4 relative overflow-hidden"
    >
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm uppercase tracking-wide text-foreground">
              Misi Harian Otan
            </h3>
            <span className="text-[11px] text-muted-foreground block">
              Dapatkan ganjaran Daun Emas hari ini
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
            mission.isCompleted
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {mission.isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
            </>
          ) : (
            <>
              <Gift className="w-3.5 h-3.5" /> Aktif
            </>
          )}
        </span>
      </div>

      {/* Mission Content */}
      <div className="space-y-2">
        <h4 className="font-bold text-base text-foreground flex items-center gap-2">
          {mission.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Reward Badges */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>+{mission.rewardXp} XP</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <span>🪙 +{mission.rewardCoins} Syiling</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Button
          onClick={onStartMission}
          disabled={mission.isCompleted}
          variant={mission.isCompleted ? "outline" : "default"}
          className="w-full h-11 rounded-2xl font-bold gap-2 text-xs"
        >
          {mission.isCompleted ? (
            "Ganjaran Telah Dituntut"
          ) : (
            <>
              <span>Mula Misi Harian</span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default React.memo(DailyMissionCard);
