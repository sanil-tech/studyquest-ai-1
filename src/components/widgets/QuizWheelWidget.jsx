// src/components/widgets/QuizWheelWidget.jsx
// Interactive Quiz Wheel & Random Challenge EduGame Widget

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, CheckCircle2, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuizWheelWidget({
  payload = {},
  instruction = "Pusing Roda Cabaran untuk mendapat soalan misteri!",
  onComplete = () => {},
  isCompleted = false,
  onMistake = () => {}
}) {
  const questionsList = payload.questions || [
    {
      question: "Apakah nilai warna duit syiling 50 sen Malaysia?",
      options: ["Perak", "Emas", "Hijau"],
      correct_index: 1,
      explanation: "Duit syiling 50 sen Malaysia berwarna emas!"
    },
    {
      question: "Berapakah bilangan 10 sen yang sama nilai dengan 50 sen?",
      options: ["3 keping", "5 keping", "10 keping"],
      correct_index: 1,
      explanation: "5 keping 10 sen bersamaan dengan 50 sen (10 x 5 = 50)!"
    }
  ];

  const [spinning, setSpinning] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSpinWheel = () => {
    setSpinning(true);
    setSubmitted(false);
    setSelectedOpt(null);

    let count = 0;
    const interval = setInterval(() => {
      setActiveQuestionIdx(prev => (prev + 1) % questionsList.length);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setSpinning(false);
        setHasSpun(true);
      }
    }, 100);
  };

  const currentQ = questionsList[activeQuestionIdx] || questionsList[0];

  const handleSubmitAnswer = () => {
    if (selectedOpt === null) return;
    setSubmitted(true);

    if (selectedOpt === (currentQ.correct_index ?? 0)) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      onComplete();
    } else {
      onMistake();
    }
  };

  return (
    <div className="p-5 bg-gradient-to-br from-purple-950/40 via-stone-900 to-amber-950/40 border-2 border-purple-500/30 rounded-3xl space-y-5 text-left shadow-xl font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-black text-purple-300 uppercase tracking-wider">Roda Cabaran Misteri</h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
          Soalan {activeQuestionIdx + 1} / {questionsList.length}
        </span>
      </div>

      <p className="text-xs font-bold text-stone-200">
        📌 {payload.instruction || instruction}
      </p>

      {/* WHEEL ANIMATION AREA */}
      <div className="p-6 bg-stone-950/80 border-2 border-stone-800 rounded-3xl text-center space-y-3 relative overflow-hidden">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-purple-500 to-cyan-500 border-4 border-white shadow-xl mx-auto flex items-center justify-center text-3xl font-black transition-transform duration-300 ${
          spinning ? "animate-spin scale-110" : ""
        }`}>
          🎰
        </div>

        <Button
          onClick={handleSpinWheel}
          disabled={spinning}
          className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs h-10 rounded-xl border-b-4 border-purple-800 transition-all"
        >
          {spinning ? "Sedang Memusing Roda... 🌀" : "🎰 Pusing Roda Soalan!"}
        </Button>
      </div>

      {/* QUESTION & OPTIONS */}
      {hasSpun && (
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
          <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" /> {currentQ.question}
          </h4>

          <div className="space-y-2">
            {currentQ.options.map((opt, oI) => {
              const isSelected = selectedOpt === oI;
              const isCorrect = oI === (currentQ.correct_index ?? 0);

              let btnStyle = "bg-stone-900 border-stone-800 text-stone-200 hover:border-purple-500";
              if (submitted) {
                if (isCorrect) btnStyle = "bg-emerald-950 border-emerald-500 text-emerald-300 font-black";
                else if (isSelected) btnStyle = "bg-rose-950 border-rose-500 text-rose-300";
              } else if (isSelected) {
                btnStyle = "bg-purple-600 border-purple-400 text-white font-black shadow-md";
              }

              return (
                <button
                  key={oI}
                  onClick={() => !submitted && setSelectedOpt(oI)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOpt === null}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs h-10 rounded-xl mt-2"
            >
              Hantar Jawapan
            </Button>
          ) : (
            <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs space-y-1">
              <span className="font-bold text-amber-400 block">💡 Penerangan:</span>
              <p className="text-stone-300">{currentQ.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER ACTION */}
      <Button
        onClick={onComplete}
        className={`w-full h-12 rounded-xl font-black text-sm transition-all ${
          isCompleted || (submitted && selectedOpt === currentQ.correct_index)
            ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-b-4 border-emerald-700"
            : "bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800"
        }`}
      >
        {isCompleted ? "Cabaran Roda Selesai ✓" : "Selesai Misi Roda ➡️"}
      </Button>
    </div>
  );
}
