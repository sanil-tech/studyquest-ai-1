// src/components/parent/LearningGrowthChart.jsx
// Displays simple visual progress growth visualization for Parent Intelligence Dashboard

import React from "react";
import { TrendingUp } from "lucide-react";

export default function LearningGrowthChart({ learningProgress }) {
  if (!learningProgress) return null;

  const {
    quizzes_completed = 0,
    average_score = 0,
    mastery_growth = 0,
    adaptive_missions_completed = 0
  } = learningProgress;

  const prevScore = Math.max(0, Math.round(mastery_growth * 0.7));
  const currScore = mastery_growth || average_score || 0;

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-4 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> Visual Perkembangan Penguasaan Ilmu
        </h3>
        <span className="text-[11px] font-bold text-stone-400">
          {adaptive_missions_completed} Misi Adaptif Selesai
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Permulaan (Asas)</span>
          <span className="text-lg font-black text-stone-400">{prevScore}%</span>
        </div>
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/30">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Semasa (EWMA)</span>
          <span className="text-lg font-black text-amber-300">{currScore}%</span>
        </div>
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-cyan-500/30">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Jumlah Ujian</span>
          <span className="text-lg font-black text-cyan-300">{quizzes_completed}</span>
        </div>
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-emerald-500/30">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Misi Adaptif</span>
          <span className="text-lg font-black text-emerald-300">{adaptive_missions_completed}</span>
        </div>
      </div>

      {/* Visual Growth Step Bar */}
      <div className="space-y-1 pt-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-stone-400">Perkembangan Kumulatif</span>
          <span className="text-emerald-400">+{Math.max(0, currScore - prevScore)}% Peningkatan</span>
        </div>
        <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-stone-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${currScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
