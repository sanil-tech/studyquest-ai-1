// src/components/widgets/MatchingCardsWidget.jsx
// Interactive Matching Cards EduGame Widget

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, CheckCircle2, RefreshCcw } from "lucide-react";
import confetti from "canvas-confetti";

export default function MatchingCardsWidget({
  payload = {},
  instruction = "Padankan kad istilah dengan maksud yang betul!",
  onComplete = () => {},
  isCompleted = false,
  onMistake = () => {}
}) {
  const pairs = payload.pairs || [
    { left: "50 sen", right: "Duit syiling bernilai 50 sen" },
    { left: "RM1", right: "Wang kertas berwarna biru" },
    { left: "RM5", right: "Wang kertas berwarna hijau" }
  ];

  const [selectedLeftIdx, setSelectedLeftIdx] = useState(null);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const handleLeftSelect = (idx) => {
    if (matchedIndices.includes(idx)) return;
    setSelectedLeftIdx(idx);
    setFeedback(null);
  };

  const handleRightSelect = (rightIdx) => {
    if (selectedLeftIdx === null) {
      setFeedback({ type: "warning", message: "Pilih kad di sebelah kiri dahulu!" });
      return;
    }

    if (selectedLeftIdx === rightIdx) {
      const newMatched = [...matchedIndices, rightIdx];
      setMatchedIndices(newMatched);
      setSelectedLeftIdx(null);
      setFeedback({ type: "success", message: "Padanan Tepat! 🎉" });

      if (newMatched.length === pairs.length) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onComplete();
      }
    } else {
      setFeedback({ type: "error", message: "Padanan kurang tepat. Cuba lagi!" });
      onMistake();
      setSelectedLeftIdx(null);
    }
  };

  const handleReset = () => {
    setMatchedIndices([]);
    setSelectedLeftIdx(null);
    setFeedback(null);
  };

  const isAllMatched = matchedIndices.length === pairs.length;

  return (
    <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-stone-900 to-purple-950/40 border-2 border-indigo-500/30 rounded-3xl space-y-5 text-left shadow-xl font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-black text-indigo-300 uppercase tracking-wider">Permainan Kad Padanan</h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
          {matchedIndices.length} / {pairs.length} Padan
        </span>
      </div>

      <p className="text-xs font-bold text-stone-200">
        📌 {payload.instruction || instruction}
      </p>

      {/* TWO COLUMNS OF CARDS */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
            1. Kad Istilah / Soalan:
          </span>
          {pairs.map((p, idx) => {
            const isMatched = matchedIndices.includes(idx);
            const isSelected = selectedLeftIdx === idx;

            return (
              <button
                key={`L-${idx}`}
                onClick={() => handleLeftSelect(idx)}
                disabled={isMatched}
                className={`w-full p-3 text-xs font-bold rounded-2xl border-2 transition-all text-left ${
                  isMatched
                    ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-102"
                    : "bg-stone-950 border-stone-800 text-stone-200 hover:border-indigo-500"
                }`}
              >
                {p.left} {isMatched && "✓"}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
            2. Kad Maksud / Rakan:
          </span>
          {pairs.map((p, idx) => {
            const isMatched = matchedIndices.includes(idx);

            return (
              <button
                key={`R-${idx}`}
                onClick={() => handleRightSelect(idx)}
                disabled={isMatched}
                className={`w-full p-3 text-xs font-bold rounded-2xl border-2 transition-all text-left ${
                  isMatched
                    ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 opacity-50 cursor-not-allowed"
                    : "bg-stone-950 border-stone-800 text-stone-200 hover:border-purple-500"
                }`}
              >
                {p.right} {isMatched && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK & CONTROLS */}
      {feedback && (
        <div className={`p-3 rounded-xl border text-xs font-bold ${
          feedback.type === "success" ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300" :
          feedback.type === "error" ? "bg-rose-950/60 border-rose-500/40 text-rose-300" :
          "bg-amber-950/60 border-amber-500/40 text-amber-300"
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleReset}
          variant="outline"
          className="px-3 bg-stone-950 border-stone-800 text-stone-400 hover:text-white h-12 rounded-xl"
        >
          <RefreshCcw className="w-4 h-4 mr-1" /> Semula
        </Button>

        <Button
          onClick={onComplete}
          className={`flex-1 h-12 rounded-xl font-black text-sm transition-all ${
            isAllMatched || isCompleted
              ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-b-4 border-emerald-700"
              : "bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800"
          }`}
        >
          {isAllMatched || isCompleted ? "Kad Padanan Selesai ✓" : "Selesai Padan ➡️"}
        </Button>
      </div>
    </div>
  );
}
