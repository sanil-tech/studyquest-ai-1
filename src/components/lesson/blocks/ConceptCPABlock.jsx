// src/components/lesson/blocks/ConceptCPABlock.jsx
// Block 3: Core concept teaching using CPA (Concrete → Pictorial → Abstract)
// Three panels in pedagogically-correct sequence

import React, { useState } from "react";
import { BookOpen, Eye, Lightbulb, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

const CPA_PHASES = [
  {
    key: "concrete",
    label: "Konkrit",
    sublabel: "Objek Sebenar",
    icon: Eye,
    emoji: "🧱",
    color: "amber",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-950/40",
    textColor: "text-amber-300"
  },
  {
    key: "pictorial",
    label: "Bergambar",
    sublabel: "Lukisan & Rajah",
    icon: BookOpen,
    emoji: "🎨",
    color: "cyan",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-950/40",
    textColor: "text-cyan-300"
  },
  {
    key: "abstract",
    label: "Abstrak",
    sublabel: "Peraturan & Simbol",
    icon: Brain,
    emoji: "🔢",
    color: "indigo",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-950/40",
    textColor: "text-indigo-300"
  }
];

export default function ConceptCPABlock({ content, studentName, onComplete, isCompleted }) {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="p-5 bg-stone-900 border-2 border-amber-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" /> Pelajari Konsep (CPA)
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
          Konkrit → Bergambar → Abstrak
        </span>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1.5">
        {CPA_PHASES.map((phase, idx) => {
          const isActive = activePhase === idx;
          const isDone = idx < activePhase;
          return (
            <button
              key={phase.key}
              onClick={() => setActivePhase(idx)}
              className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                isActive
                  ? `${phase.bgColor} ${phase.borderColor} ${phase.textColor}`
                  : isDone
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                    : "bg-stone-950 border-stone-800 text-stone-500"
              }`}
            >
              <span className="block text-sm mb-0.5">{phase.emoji}</span>
              {isDone ? "✓ " : ""}{phase.label}
            </button>
          );
        })}
      </div>

      {/* Active phase content */}
      {CPA_PHASES.map((phase, idx) => {
        if (idx !== activePhase) return null;
        const phaseContent = content[phase.key] || {};
        const PhaseIcon = phase.icon;

        return (
          <div key={phase.key} className={`p-4 ${phase.bgColor} border ${phase.borderColor} rounded-2xl space-y-3`}>
            {/* Phase title */}
            <div className="flex items-center gap-2">
              <PhaseIcon className={`w-5 h-5 ${phase.textColor}`} />
              <h4 className={`text-sm font-black ${phase.textColor}`}>
                {personalize(phaseContent.title || phase.label, studentName)}
              </h4>
            </div>

            {/* Explanation */}
            <p className="text-xs sm:text-sm text-stone-200 font-semibold leading-relaxed">
              {personalize(phaseContent.explanation || "", studentName)}
            </p>

            {/* Key term (abstract phase only) */}
            {phase.key === "abstract" && phaseContent.key_term && (
              <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800">
                <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">📌 Istilah Penting</span>
                <p className="text-xs text-white font-bold">
                  <strong className="text-indigo-300">{phaseContent.key_term}</strong>
                  {" — "}
                  {personalize(phaseContent.key_definition || "", studentName)}
                </p>
              </div>
            )}

            {/* Navigation within CPA phases */}
            {idx < CPA_PHASES.length - 1 ? (
              <Button
                onClick={() => setActivePhase(idx + 1)}
                className={`w-full h-10 bg-stone-800 hover:bg-stone-700 text-stone-200 font-black text-xs rounded-xl transition-all`}
              >
                Seterusnya: {CPA_PHASES[idx + 1].emoji} {CPA_PHASES[idx + 1].label} ➡️
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
              >
                {isCompleted ? "Konsep CPA Difahami ✓" : "Saya Faham Konsep Ini! ➡️"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
