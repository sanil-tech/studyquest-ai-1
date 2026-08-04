// src/components/lesson/blocks/MissionCompleteBlock.jsx
// Block 8: Celebration & reward summary
// Confetti, XP tally, badge unlock, next-step guidance

import React, { useEffect, useRef } from "react";
import { Trophy, Star, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

export default function MissionCompleteBlock({ content, studentName, onComplete, isCompleted }) {
  const message = personalize(content.celebration_message || "Tahniah! Misi berjaya diselesaikan!", studentName);
  const badge = content.badge_name || "Wira Pembelajaran";
  const totalXp = content.total_xp || 100;
  const totalCoins = content.total_coins || 25;
  const confettiFired = useRef(false);

  // Fire confetti on first render
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    const fireConfetti = async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        // First burst
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        // Delayed second burst
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 100, origin: { y: 0.5 } });
        }, 400);
      } catch {
        // canvas-confetti not available — no problem
      }
    };
    fireConfetti();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-b from-amber-950/60 via-stone-950 to-stone-900 border-2 border-amber-500/40 rounded-3xl text-center space-y-5 shadow-2xl">
      {/* Trophy */}
      <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-4xl animate-bounce">
        🏆
      </div>

      {/* Completion header */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
          TAHNIAH {studentName}! MISI SELESAI
        </span>
        <h3 className="text-lg font-black text-amber-100">
          Wira Pembelajaran KSSR
        </h3>
        <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* Reward summary */}
      <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex justify-center gap-6 text-sm font-black">
          <span className="text-amber-400 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> +{totalXp} XP
          </span>
          <span className="text-yellow-400 flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-yellow-400" /> +{totalCoins} Syiling
          </span>
        </div>

        {/* Badge */}
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-amber-300">
            🏅 Lencana Diperolehi: {badge}
          </span>
        </div>
      </div>

      {/* Complete button */}
      <Button
        onClick={onComplete}
        className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-2"
      >
        <Trophy className="w-5 h-5" />
        {isCompleted ? "Misi Selesai ✓" : "Selesai & Kembali! 🎉"}
      </Button>
    </div>
  );
}
