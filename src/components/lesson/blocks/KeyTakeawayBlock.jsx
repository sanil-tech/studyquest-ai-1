// src/components/lesson/blocks/KeyTakeawayBlock.jsx
// Block 7: Consolidation & memory anchoring
// Summary points + memory tip + built-in flashcard deck

import React, { useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

export default function KeyTakeawayBlock({ content, studentName, onComplete, isCompleted }) {
  const points = (content.summary_points || []).map((p) => personalize(p, studentName));
  const tip = personalize(content.memory_tip || "", studentName);
  const flashcards = (content.flashcards || []).map((fc) => ({
    term: personalize(fc.term || "", studentName),
    definition: personalize(fc.definition || "", studentName)
  }));

  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleCard = (idx) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="p-5 bg-stone-900 border-2 border-amber-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-amber-400" /> Rumusan & Ingatan
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
          3 Perkara Penting
        </span>
      </div>

      {/* Summary points */}
      <div className="space-y-2">
        {points.map((pt, idx) => (
          <div key={idx} className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
              {idx + 1}
            </span>
            <p className="text-xs font-bold text-stone-200 leading-relaxed pt-0.5">{pt}</p>
          </div>
        ))}
      </div>

      {/* Memory tip */}
      {tip && (
        <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-base shrink-0 border border-amber-500/40">
            💡
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-amber-400 uppercase block">Petua Ingatan:</span>
            <p className="text-xs font-bold text-amber-100 leading-relaxed">"{tip}"</p>
          </div>
        </div>
      )}

      {/* Mini flashcard deck */}
      {flashcards.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> Kad Kilat (Tekan untuk Balik)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {flashcards.map((fc, idx) => {
              const isFlipped = flippedCards.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCard(idx)}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    isFlipped
                      ? "bg-emerald-950/40 border-emerald-500/30"
                      : "bg-stone-950 border-stone-800 hover:border-amber-500/50"
                  }`}
                >
                  {isFlipped ? (
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Jawapan</span>
                      <p className="text-xs font-medium text-emerald-200">{fc.definition}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-black text-stone-500 uppercase block mb-1">Istilah</span>
                      <p className="text-xs font-black text-amber-300">{fc.term}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue button */}
      <Button
        onClick={onComplete}
        className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-amber-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Rumusan Selesai ✓" : "Saya Dah Ingat! ➡️"}
      </Button>
    </div>
  );
}
