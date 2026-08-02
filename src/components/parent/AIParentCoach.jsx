// src/components/parent/AIParentCoach.jsx
// Displays Suku Mascot AI parent advice card for Parent Intelligence Dashboard

import React from "react";
import { Sparkles, MessageSquare } from "lucide-react";

export default function AIParentCoach({ aiParentMessage }) {
  if (!aiParentMessage) return null;

  const { tone = "positive", message = "Suku sedia membantu memberi bimbingan pembelajaran anak anda." } = aiParentMessage;

  const badgeColor =
    tone === "supportive"
      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
      : tone === "encouraging"
      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";

  return (
    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-950/50 via-stone-900 to-cyan-950/50 border-2 border-amber-500/30 rounded-3xl shadow-xl text-left space-y-4">
      <div className="flex items-start sm:items-center gap-4">
        {/* Mascot Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-lg shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-3xl">
            🐢
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Suku AI Parent Advisor
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeColor}`}>
              {tone}
            </span>
          </div>
          <h3 className="text-base font-black text-white">Panduan Pembelajaran Untuk Ibu Bapa</h3>
          <div className="p-3 bg-stone-950/90 border border-stone-800 rounded-2xl text-xs sm:text-sm font-bold text-amber-200 leading-relaxed shadow-inner">
            💬 "{message}"
          </div>
        </div>
      </div>
    </div>
  );
}
