// src/components/teacher/ClassMasteryOverview.jsx
// Displays classroom mastery score progress bar and DSKP Tahap Penguasaan (TP1-TP6) distribution breakdown

import React from "react";
import { BarChart3, Users } from "lucide-react";

export default function ClassMasteryOverview({ classSummary, tpDistribution }) {
  if (!classSummary) return null;

  const { class_name, subject, year_level, total_students, class_mastery_average } = classSummary;
  const tp = tpDistribution || { TP1: 0, TP2: 1, TP3: 3, TP4: 5, TP5: 4, TP6: 2 };

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-5 text-left shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase rounded-lg border border-indigo-500/20">
              {subject} • {year_level}
            </span>
            <span className="text-xs text-stone-400 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {total_students} Murid Berdaftar
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Kelas {class_name}</h2>
        </div>

        <div className="p-3 bg-stone-950/90 border border-indigo-500/30 rounded-2xl text-center flex items-center gap-4 px-5">
          <div>
            <span className="text-[10px] font-black uppercase text-stone-400 block">Purata Penguasaan Kelas</span>
            <span className="text-xl font-black text-amber-300">{class_mastery_average}%</span>
          </div>
        </div>
      </div>

      {/* Class Mastery Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-stone-300">Penguasaan Kumulatif Kelas</span>
          <span className="text-amber-300">{class_mastery_average}%</span>
        </div>
        <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${class_mastery_average}%` }}
          />
        </div>
      </div>

      {/* DSKP Tahap Penguasaan (TP1 - TP6) Distribution Grid */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-black text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-indigo-400" /> Taburan Tahap Penguasaan (TP1 - TP6)
        </h4>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {["TP1", "TP2", "TP3", "TP4", "TP5", "TP6"].map((level, idx) => {
            const count = tp[level] || 0;
            const isHigh = idx >= 3;
            return (
              <div
                key={level}
                className={`p-3 rounded-2xl border space-y-0.5 ${
                  isHigh
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-amber-950/30 border-amber-500/30 text-amber-200"
                }`}
              >
                <span className="text-[10px] font-black uppercase block opacity-80">{level}</span>
                <span className="text-lg font-black">{count}</span>
                <span className="text-[9px] font-bold block opacity-70">Murid</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
