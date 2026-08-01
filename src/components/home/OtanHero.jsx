import React from "react";
import { motion } from "framer-motion";
import { Compass, Flame, TrendingUp, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * OtanHero Component
 * 
 * Top hero banner featuring Otan mascot, personalized greeting, streak badge,
 * momentum indicator, and primary "Teruskan Kembara" action button.
 * 
 * @param {Object} props
 * @param {Object} props.passportData - Passport data object from buildAdventurePassport
 * @param {Object} props.journeyData - Journey data object from buildLearningJourney
 * @param {Function} props.onContinue - Action handler when continue button is clicked
 */
export function OtanHero({ passportData, journeyData, onContinue }) {
  const student = passportData?.student || {};
  const otanGreeting = passportData?.otanGreeting || "Hai Pengembara! Mari teruskan kembara ilmu bersama Otan!";
  const streak = passportData?.streak || 0;
  const momentum = journeyData?.learning_momentum || "STABLE";

  // Momentum config
  const momentumConfig = {
    RISING: {
      label: "Semakin Meningkat",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: TrendingUp
    },
    STABLE: {
      label: "Konsisten",
      color: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      icon: Sparkles
    },
    DECLINING: {
      label: "Perlu Fokus",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: Compass
    }
  };

  const currentMomentum = momentumConfig[momentum] || momentumConfig.STABLE;
  const MomentumIcon = currentMomentum.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 p-6 sm:p-8 border-4 border-amber-500/40 shadow-2xl"
    >
      {/* Background Decorative Accents */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Section: Otan Mascot & Speech Bubble */}
        <div className="flex items-start gap-4 sm:gap-5 w-full md:w-auto">
          {/* Otan Mascot Circle */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-1 shrink-0 shadow-lg border-2 border-amber-200/50 flex items-center justify-center text-3xl sm:text-4xl"
          >
            🦧
          </motion.div>

          {/* Greeting Speech Box */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Penaung Kembara Otan
              </span>
              
              {/* Streak Pill */}
              <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
                <span>{streak} Hari Perturut</span>
              </div>

              {/* Momentum Tag */}
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentMomentum.color}`}>
                <MomentumIcon className="w-3.5 h-3.5" />
                <span>{currentMomentum.label}</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100">
              {student.name ? `Hai, ${student.name}!` : "Selamat Datang!"}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              "{otanGreeting}"
            </p>
          </div>
        </div>

        {/* Right Section: Primary Action Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={onContinue}
            className="w-full sm:w-auto h-14 px-8 text-base font-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-xl rounded-2xl gap-3 border-2 border-amber-200 transition-all transform hover:scale-105 active:scale-95"
          >
            <Compass className="w-6 h-6 text-stone-900 animate-spin-slow" />
            Teruskan Kembara
          </Button>

          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300/80">
            <Trophy className="w-3.5 h-3.5" />
            <span>Pangkat: {passportData?.passport?.rankTitle || "Pengembara Muda"}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default React.memo(OtanHero);
