import React from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ContinueAdventureCard Component
 * 
 * Displays the current active adventure mission with progress bar,
 * rationale, and a quick-resume button.
 * 
 * @param {Object} props
 * @param {Object} props.nextAdventure - Recommended next adventure details
 * @param {Function} props.onResume - Resume mission action handler
 */
export function ContinueAdventureCard({ nextAdventure, onResume }) {
  const adventure = nextAdventure || {
    world_name: "Dunia Matematik",
    adventure_title: "Rumah Puluh Adventure",
    topic_slug: "rumah-puluh",
    reason: "Terokai misi asas kembara nombor bersama Otan!"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="p-5 sm:p-6 rounded-3xl border-3 border-amber-500/30 bg-card text-card-foreground shadow-lg space-y-4 relative overflow-hidden"
    >
      {/* Decorative top border ribbon */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/20">
            <MapPin className="w-4 h-4" />
            {adventure.world_name || "Dunia Kembara"}
          </span>
          <span className="text-xs font-bold text-muted-foreground">Misi Aktif</span>
        </div>

        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Disyorkan Oleh AI
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
          {adventure.adventure_title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {adventure.reason}
        </p>
      </div>

      {/* Progress Bar Preview */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-muted-foreground">Kemajuan Misi</span>
          <span className="text-amber-600 dark:text-amber-400">45% Selesai</span>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "45%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Button
          onClick={onResume}
          size="lg"
          className="w-full h-12 rounded-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Sambung Misi Kembara</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </motion.div>
  );
}

export default React.memo(ContinueAdventureCard);
