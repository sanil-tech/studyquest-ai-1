// src/components/lesson/blocks/WorkedExampleBlock.jsx
// Block 4: Teacher-modeled step-by-step solution
// Reveals steps progressively for guided learning

import React, { useState } from "react";
import { PenTool, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";
import TapCountVisual from "@/components/lesson/blocks/TapCountVisual";

const toPositiveInteger = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : null;
};

/** @param {{ visualAid?: any }} props */
function WorkedExampleVisual({ visualAid }) {
  if (!visualAid || visualAid.type === "none") return null;

  if (visualAid.type === "comparison") {
    const leftCount = toPositiveInteger(visualAid.left_count);
    const rightCount = toPositiveInteger(visualAid.right_count);
    if (!leftCount || !rightCount) return null;
    const emoji = visualAid.object_emoji || "🔢";
    return (
      <TapCountVisual
        emojisA={Array.from({ length: leftCount }, () => emoji)}
        emojisB={Array.from({ length: rightCount }, () => emoji)}
        labelA={visualAid.left_label || "Kumpulan A"}
        labelB={visualAid.right_label || "Kumpulan B"}
      />
    );
  }

  if (visualAid.type === "single_count") {
    const count = toPositiveInteger(visualAid.count);
    if (!count) return null;
    return (
      <div className="p-3 bg-stone-950/60 border border-amber-500/20 rounded-2xl text-center space-y-2">
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: count }, (_, index) => <span key={index} className="text-2xl">{visualAid.object_emoji || "🔢"}</span>)}
        </div>
        <p className="text-xs font-black text-amber-300">{visualAid.label || visualAid.numeral || count}</p>
      </div>
    );
  }

  if (visualAid.type === "number_line" && Array.isArray(visualAid.values) && visualAid.values.length > 0) {
    return (
      <div className="flex flex-wrap justify-center gap-2 p-3 bg-stone-950/60 border border-cyan-500/20 rounded-2xl">
        {visualAid.values.map((value, index) => <span key={index} className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 font-black">{value}</span>)}
      </div>
    );
  }

  return null;
}

/** @param {{ content: any, studentName?: string, onComplete?: Function, isCompleted?: boolean }} props */
export default function WorkedExampleBlock({ content, studentName, onComplete, isCompleted }) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [showMistake, setShowMistake] = useState(false);

  const problem = personalize(content.problem_statement || "", studentName);
  const steps = content.solution_steps || [];
  const mistake = personalize(content.common_mistake || "", studentName);
  const reasoning = personalize(content.correct_reasoning || "", studentName);
  const allRevealed = revealedSteps >= steps.length;

  const revealNext = () => {
    if (revealedSteps < steps.length) {
      setRevealedSteps((prev) => prev + 1);
    }
  };

  return (
    <div className="p-5 bg-stone-900 border-2 border-indigo-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-indigo-400" /> Contoh Terbimbing
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
          Langkah {Math.min(revealedSteps, steps.length)}/{steps.length}
        </span>
      </div>

      {/* Problem statement */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
        <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1.5">📌 Soalan</span>
        <p className="text-sm font-black text-white leading-relaxed">{problem}</p>
      </div>

      {/* The visual is generated from the selected SP; no fixed comparison aid. */}
      <WorkedExampleVisual visualAid={content.visual_aid} />

      {/* Progressive step reveal */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
          Penyelesaian Langkah demi Langkah
        </span>

        {steps.map((step, idx) => {
          const isRevealed = idx < revealedSteps;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                isRevealed
                  ? "bg-stone-950/80 border-stone-700 text-stone-200"
                  : "bg-stone-950/30 border-stone-800/50 text-stone-600"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-md shrink-0 ${
                  isRevealed
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-stone-800 text-stone-600"
                }`}>
                  Langkah {idx + 1}
                </span>
                <span className={isRevealed ? "" : "blur-sm select-none"}>
                  {personalize(step, studentName)}
                </span>
              </div>
            </div>
          );
        })}

        {!allRevealed && (
          <Button
            onClick={revealNext}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <ChevronDown className="w-4 h-4" /> Tunjuk Langkah {revealedSteps + 1}
          </Button>
        )}
      </div>

      {/* Common mistake & correct reasoning — shown after all steps */}
      {allRevealed && (
        <div className="space-y-2 pt-1">
          {/* Common mistake toggle */}
          {mistake && (
            <button
              onClick={() => setShowMistake(!showMistake)}
              className="w-full p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-left text-xs font-bold text-rose-300 flex items-center justify-between hover:bg-rose-950/60 transition-all"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ⚠️ Kesilapan Lazim Murid
              </span>
              <span>{showMistake ? "▲" : "▼"}</span>
            </button>
          )}
          {showMistake && mistake && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl text-xs text-rose-200 font-medium">
              {mistake}
            </div>
          )}

          {/* Correct reasoning */}
          {reasoning && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-emerald-400 font-black block mb-0.5">✅ Penalaran Betul:</span>
                {reasoning}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Continue button — awards 0 XP (instructional block) */}
      <Button
        onClick={onComplete}
        disabled={!allRevealed}
        className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-stone-950 font-black text-sm rounded-xl border-b-4 border-indigo-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Contoh Difahami ✓" : allRevealed ? "Teruskan ke Latihan ➡️" : "Buka semua langkah dahulu..."}
      </Button>
    </div>
  );
}
