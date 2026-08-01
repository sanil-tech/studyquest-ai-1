import React from "react";
import { motion } from "framer-motion";
import { Globe, Lock, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

/**
 * WorldCarousel Component
 * 
 * Renders horizontal scroll or responsive grid of KSSR Subject Worlds.
 * 
 * @param {Object} props
 * @param {Array} props.worlds - Array of World objects from buildAdventurePassport
 * @param {Function} props.onSelectWorld - Callback when a world card is selected
 */
export function WorldCarousel({ worlds = [], onSelectWorld }) {
  // Mastery level color badges
  const getMasteryBadge = (level) => {
    switch (level) {
      case "MASTER":
        return { label: "Pakar", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" };
      case "PROFICIENT":
        return { label: "Mahir", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
      case "DEVELOPING":
        return { label: "Sedang Meneroka", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
      default:
        return { label: "Peringkat Asas", color: "bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30" };
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-black text-lg text-foreground">
            Dunia Pembelajaran KSSR
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          Luncur ke tepi <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Scrollable Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-amber-500/20">
        {worlds.map((world, index) => {
          const isLocked = world.status === "LOCKED";
          const isCompleted = world.status === "COMPLETED";
          const masteryInfo = getMasteryBadge(world.masteryLevel);

          return (
            <motion.div
              key={world.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => !isLocked && onSelectWorld && onSelectWorld(world)}
              className={`snap-start shrink-0 w-64 sm:w-72 p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-sm ${
                isLocked
                  ? "bg-muted/40 border-dashed border-stone-300 dark:border-stone-800 opacity-70"
                  : isCompleted
                  ? "bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/40"
                  : "bg-card border-amber-500/30 hover:border-amber-500 hover:shadow-md"
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {world.icon || "🌎"}
                </div>

                {isLocked ? (
                  <span className="px-2.5 py-1 rounded-full bg-stone-500/10 text-stone-500 font-bold text-[11px] flex items-center gap-1 border">
                    <Lock className="w-3 h-3" /> Dikunci
                  </span>
                ) : isCompleted ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[11px] flex items-center gap-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                  </span>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${masteryInfo.color}`}>
                    {masteryInfo.label}
                  </span>
                )}
              </div>

              {/* Title & Subject */}
              <div className="space-y-1 my-4">
                <h3 className="font-black text-base text-foreground">
                  {world.world_name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {world.subject} • KSSR Semakan
                </p>
              </div>

              {/* Progress & Bottom Bar */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Penguasaan Dunia</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {world.completionPercent}%
                  </span>
                </div>

                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border p-0.5">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${world.completionPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-muted-foreground">
                  <span>{world.unlockedCollectibles || 0} Terkumpul</span>
                  {!isLocked && (
                    <span className="text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Masuk <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(WorldCarousel);
