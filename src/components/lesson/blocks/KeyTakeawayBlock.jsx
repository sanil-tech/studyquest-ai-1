// src/components/lesson/blocks/KeyTakeawayBlock.jsx
// Block 7: Consolidation & memory anchoring
// Summary points + memory tip + built-in flashcard deck

import React, { useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";
import RevealSummaryVisual from "@/components/lesson/blocks/RevealSummaryVisual";

export default function KeyTakeawayBlock({ content = {}, studentName, onComplete, isCompleted }) {
  const points = (content.summary_points || []).map((p) => personalize(p, studentName));
  const tip = personalize(content.memory_tip || "", studentName);
  const commonMistakes = (content.common_mistakes || []).map((m) => personalize(m, studentName));
  const reflectionPrompt = personalize(content.reflection_prompt || "", studentName);
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

      {/* Interactive summary points (tap-to-reveal) — or markdown fallback */}
      {points.length > 0 ? (
        <RevealSummaryVisual points={points} studentName={studentName} personalizeFn={personalize} />
      ) : content.markdown ? (
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 prose prose-invert prose-sm max-w-none text-stone-200">
          <ReactMarkdown>{personalize(content.markdown, studentName)}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-xs text-stone-400 italic p-3 bg-stone-950 rounded-xl border border-stone-800">
          Rumusan kandungan sedang disediakan.
        </p>
      )}

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

      {/* Common mistakes (Awas Kesilapan!) */}
      {commonMistakes.length > 0 && (
        <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
            ⚠️ Awas Kesilapan!
          </span>
          <ul className="space-y-1.5">
            {commonMistakes.map((m, idx) => (
              <li key={idx} className="text-xs font-medium text-rose-100 leading-relaxed flex items-start gap-2">
                <span className="text-rose-400 font-black shrink-0">✗</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reflection prompt (Refleksi Diri) */}
      {reflectionPrompt && (
        <div className="p-3.5 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-base shrink-0 border border-indigo-500/40">
            🌱
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-indigo-400 uppercase block">Refleksi Diri:</span>
            <p className="text-xs font-bold text-indigo-100 leading-relaxed">{reflectionPrompt}</p>
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