// src/components/lesson/blocks/KnowledgeCheckBlock.jsx
// Block 6: Formative assessment — 3-5 quiz questions with PBD TP mapping
// The most important block for mastery data

import React, { useState, useMemo } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

export default function KnowledgeCheckBlock({ content, studentName, onComplete, isCompleted, onMistake }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => {
    return (content.questions || []).map((q, idx) => ({
      id: idx,
      stem: personalize(q.stem || q.question || `Soalan ${idx + 1}`, studentName),
      options: (q.options || []).map((opt) => personalize(String(opt), studentName)),
      correctIndex: q.correct_index ?? 0,
      explanation: personalize(q.explanation || "", studentName),
      tpLevel: q.tp_level || "",
      misconceptionTag: q.misconception_tag || ""
    }));
  }, [content.questions, studentName]);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Track mistakes for AI tutor
    questions.forEach((q, idx) => {
      if (answers[idx] !== q.correctIndex && onMistake) {
        onMistake({
          question: q.stem,
          selectedOption: q.options[answers[idx]],
          correctOption: q.options[q.correctIndex],
          misconceptionTag: q.misconceptionTag
        });
      }
    });
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });
    return Math.round((correct / Math.max(questions.length, 1)) * 100);
  }, [submitted, answers, questions]);

  const allAnswered = Object.keys(answers).length >= questions.length;

  if (questions.length === 0) {
    return (
      <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 text-center space-y-3">
        <Award className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-xs font-bold text-stone-300">Soalan kuiz sedang dijana...</p>
        <Button onClick={onComplete} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl">
          Teruskan ➡️
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5 bg-stone-900 border-2 border-rose-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-rose-400" /> Ujian Penguasaan
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
          {questions.length} Soalan • +50 XP
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const selected = answers[qIdx];
          const isAnswered = selected !== undefined;

          return (
            <div key={qIdx} className="space-y-2.5">
              {/* Question stem */}
              <p className="text-xs sm:text-sm font-black text-white">
                {qIdx + 1}. {q.stem}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selected === optIdx;
                  const isCorrect = optIdx === q.correctIndex;

                  let style = "bg-stone-950 border-stone-800 text-stone-200 hover:border-amber-500 hover:bg-stone-800";
                  if (submitted) {
                    if (isCorrect) {
                      style = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                    } else if (isSelected && !isCorrect) {
                      style = "bg-rose-950/60 border-rose-500 text-rose-200";
                    } else {
                      style = "bg-stone-950/50 border-stone-800/50 text-stone-500";
                    }
                  } else if (isSelected) {
                    style = "bg-amber-500/20 border-amber-500 text-amber-200 font-bold";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {submitted && q.explanation && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-200 font-semibold">
                  <span className="font-black text-amber-400">💡 Penerangan: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Results */}
      {submitted ? (
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl text-center border ${
            score >= 60
              ? "bg-emerald-950/60 border-emerald-500/40"
              : "bg-rose-950/40 border-rose-500/30"
          }`}>
            <p className={`text-sm font-black ${score >= 60 ? "text-emerald-300" : "text-rose-300"}`}>
              {score >= 80 ? "🎉 Cemerlang" : score >= 60 ? "👍 Baik" : "💪 Cuba Lagi"} {studentName}! Skor: {score}%
            </p>
            <p className="text-[10px] text-stone-400 font-bold mt-1">
              {questions.filter((q, i) => answers[i] === q.correctIndex).length} / {questions.length} betul
            </p>
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Kuiz Selesai ✓" : "Teruskan ➡️"}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full h-12 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-stone-950 font-black text-sm rounded-xl border-b-4 border-rose-700 transition-all"
        >
          Hantar Jawapan 🚀
        </Button>
      )}
    </div>
  );
}
