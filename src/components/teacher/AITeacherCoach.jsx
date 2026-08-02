// src/components/teacher/AITeacherCoach.jsx
// Displays Suku AI Teacher Assistant persona card with DSKP pedagogical recommendations

import React from "react";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";

export default function AITeacherCoach({ aiTeacherGuidance }) {
  if (!aiTeacherGuidance) return null;

  const { pedagogical_recommendation, suggested_action } = aiTeacherGuidance;

  return (
    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-indigo-950/60 via-stone-900 to-cyan-950/60 border-2 border-indigo-500/40 rounded-3xl shadow-xl text-left space-y-4">
      <div className="flex items-start sm:items-center gap-4">
        {/* Suku Assistant Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-teal-300 p-0.5 shadow-lg shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-3xl">
            🎓
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-400/10 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Suku AI Teacher Assistant
            </span>
          </div>

          <h3 className="text-base font-black text-white">Panduan Pengajaran Pedagogi DSKP</h3>

          <div className="p-3.5 bg-stone-950/90 border border-stone-800 rounded-2xl text-xs sm:text-sm font-bold text-indigo-100 leading-relaxed shadow-inner space-y-2">
            <p>💬 "{pedagogical_recommendation}"</p>
            {suggested_action && (
              <p className="text-xs text-amber-300 font-bold pt-1 border-t border-stone-800/80 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cadangan Tindakan: {suggested_action}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
