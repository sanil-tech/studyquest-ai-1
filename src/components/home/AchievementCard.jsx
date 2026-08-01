import React from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AchievementCard Component
 * 
 * Showcases recent unlocked badges, stamps, and collectible items.
 * 
 * @param {Object} props
 * @param {Array} props.badges - Array of unlocked badges/stamps
 * @param {Array} props.collections - Array of unlocked collectible cards
 * @param {Function} props.onViewAll - Handler to view all achievements
 */
export function AchievementCard({ badges = [], collections = [], onViewAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="p-5 sm:p-6 rounded-3xl border-2 bg-card text-card-foreground shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm uppercase tracking-wide text-foreground">
              Cap Stempel & Koleksi
            </h3>
            <span className="text-[11px] text-muted-foreground block">
              Pencapaian terkini pengembara
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> {badges.length} Cap Terbuka
        </span>
      </div>

      {/* Badges Preview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.slice(0, 3).map((badge, idx) => (
          <div
            key={badge.id || idx}
            className="p-3 rounded-2xl border bg-gradient-to-b from-purple-500/5 to-card space-y-1 text-center relative overflow-hidden"
          >
            <div className="text-2xl my-1">{badge.icon || "🏆"}</div>
            <h4 className="font-black text-xs text-foreground truncate">{badge.name}</h4>
            <p className="text-[10px] text-muted-foreground line-clamp-1">{badge.description}</p>
          </div>
        ))}

        {/* Collectible preview item */}
        {collections.slice(0, 1).map((col, idx) => (
          <div
            key={col.id || idx}
            className={`p-3 rounded-2xl border text-center space-y-1 relative overflow-hidden ${
              col.isUnlocked
                ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100"
                : "bg-muted/50 opacity-60"
            }`}
          >
            <div className="text-2xl my-1">
              {col.isUnlocked ? col.icon || "🦧" : <Lock className="w-6 h-6 mx-auto text-muted-foreground" />}
            </div>
            <h4 className="font-black text-xs truncate">{col.name}</h4>
            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 block">
              {col.rarity || "RARE"}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="pt-1">
        <Button
          onClick={onViewAll}
          variant="ghost"
          className="w-full h-10 rounded-xl font-bold text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 justify-between"
        >
          <span>Lihat Semua Pencapaian & Trofi</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default React.memo(AchievementCard);
