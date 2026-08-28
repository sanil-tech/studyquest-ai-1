// src/components/lesson/blocks/LearningObjectiveBlock.jsx
// Block 2: Transparent goal-setting — "I Can" statement
// System-provided TP badge + AI-generated objective

import React from "react";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

const TP_COLORS = {
  TP1: "bg-red-500/20 text-red-300 border-red-500/40",
  TP2: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  TP3: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  TP4: "bg-lime-500/20 text-lime-300 border-lime-500/40",
  TP5: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  TP6: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
};

const TP_LABELS = {
  TP1: "Mengingat",
  TP2: "Memahami",
  TP3: "Menguasai",
  TP4: "Mengaplikasi",
  TP5: "Menganalisis",
  TP6: "Mencipta"
};

export default function LearningObjectiveBlock({ content = {}, studentName, onComplete, isCompleted }) {
  const statement = personalize(content.i_can_statement || "", studentName);
  const tp = content.tp_badge || "TP3";
  const tpColor = TP_COLORS[tp] || TP_COLORS.TP3;
  const tpLabel = TP_LABELS[tp] || "Menguasai";

  return (
    <div className="p-5 bg-stone-900 border-2 border-indigo-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
          <Target className="w-4 h-4 text-indigo-400" /> Objektif Pembelajaran
        </span>
        <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${tpColor}`}>
          {tp} — {tpLabel}
        </span>
      </div>

      {/* "I Can" statement card */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl">
        <p className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-2">
          🎯 Selepas pelajaran ini, saya boleh:
        </p>
        <p className="text-sm font-bold text-white leading-relaxed">
          {statement || "Menguasai kemahiran yang dipelajari dalam misi ini"}
        </p>
      </div>

      {/* Continue button — awards 0 XP (informational block) */}
      <Button
        onClick={onComplete}
        className="w-full h-11 bg-indigo-500 hover:bg-indigo-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-indigo-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Objektif Difahami ✓" : "Saya Faham Objektif! ➡️"}
      </Button>
    </div>
  );
}