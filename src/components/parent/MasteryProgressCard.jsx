// src/components/parent/MasteryProgressCard.jsx
// Displays subject mastery items, TP levels, progress bars, and trend indicators for parent dashboard

import React from "react";
import { TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";

export default function MasteryProgressCard({ masteryOverview = [] }) {
  if (!masteryOverview.length) {
    return (
      <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-3xl text-center text-stone-400 font-bold text-xs">
        Belum ada data penguasaan penilaian anak direkodkan.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider px-1 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-400" /> Ringkasan Penguasaan Subjek & TP
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {masteryOverview.map((item, idx) => {
          const score = Math.min(100, Math.max(0, item.mastery_score || 0));
          const isImproving = item.trend === "improving" || score >= 75;
          const isDeclining = item.trend === "declining" || score < 50;

          return (
            <div
              key={idx}
              className="p-4 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{item.subject}</h4>
                  <p className="text-[11px] font-bold text-stone-400">{item.skill}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-black rounded-lg">
                    TP{item.tp_level}
                  </span>
                  <span
                    className={`px-2 py-1 text-[10px] font-black rounded-lg border flex items-center gap-1 uppercase ${
                      isImproving
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                        : isDeclining
                        ? "bg-rose-950/80 text-rose-300 border-rose-500/30"
                        : "bg-amber-950/80 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {isImproving ? (
                      <><TrendingUp className="w-3 h-3 text-emerald-400" /> Meningkat</>
                    ) : isDeclining ? (
                      <><TrendingDown className="w-3 h-3 text-rose-400" /> Perlu Sokongan</>
                    ) : (
                      <><Minus className="w-3 h-3 text-amber-400" /> Stabil</>
                    )}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-black">
                  <span className="text-stone-400">Tahap Penguasaan</span>
                  <span className="text-amber-300">{score}%</span>
                </div>
                <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
