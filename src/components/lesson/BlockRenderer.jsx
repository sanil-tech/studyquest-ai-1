// src/components/lesson/BlockRenderer.jsx
// Reusable Polymorphic Block Renderer for StudyQuest DSKP Learning Packages
// Enhancements for Phase 1-4: Pedagogical badges, Suku Mascot Induction Card 🐢, Worked Examples, PBD Assessments, Reflection Journal, and "Teruskan Misi ➡️" buttons.

import React, { useMemo, useState } from "react";
import { personalize, replaceStudentVariables } from "@/lib/personalize";
import {
  Tv,
  BookOpen,
  Brain,
  Sparkles,
  Gamepad2,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Target,
  PenTool,
  Award,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

import Flashcards from "@/components/lesson/Flashcards";
import MindMap from "@/components/lesson/MindMap";
import InfographicBlock from "@/components/lesson/InfographicBlock";
import InteractiveActivity from "@/components/lesson/InteractiveActivity";
import BaseTenBlocksWidget from "@/components/widgets/BaseTenBlocksWidget";
import SentenceBuilderWidget from "@/components/widgets/SentenceBuilderWidget";
import FractionSlicerWidget from "@/components/widgets/FractionSlicerWidget";
import NumberScaleWidget from "@/components/widgets/NumberScaleWidget";

// ==========================================
// TEXT FORMATTING UTILITIES
// ==========================================
export const bersihkanTeksUntukSuara = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/\\n/g, "\n")
    .replace(/[#*>\-_`🔸]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const parseMarkdownToHTML = (text) => {
  if (!text) return "";
  const cleanText = String(text).replace(/\\n/g, "\n");
  const lines = cleanText.split("\n");
  let htmlOutput = [];

  lines.forEach((line) => {
    let trimmed = line.trim();
    if (trimmed === "") return;
    if (trimmed.startsWith("# ")) {
      htmlOutput.push(`<h1 class="text-base sm:text-lg font-black text-amber-300 my-3">${trimmed.replace("# ", "")}</h1>`);
      return;
    }
    if (trimmed.startsWith("## ")) {
      htmlOutput.push(`<h2 class="text-sm sm:text-base font-black text-lime-400 my-2">✨ ${trimmed.replace("## ", "")}</h2>`);
      return;
    }
    if (trimmed.startsWith("### ")) {
      htmlOutput.push(`<h3 class="text-sm font-black text-cyan-300 my-1">${trimmed.replace("### ", "")}</h3>`);
      return;
    }
    htmlOutput.push(`<p class="text-xs sm:text-sm text-stone-200 font-bold mb-2">${trimmed}</p>`);
  });

  return htmlOutput.join("\n").replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-amber-300">$1</strong>');
};

// Pedagogical Badge Resolution Helper
const getPedagogicalBadge = (phase, blockType) => {
  const p = (phase || "").toUpperCase();
  const t = (blockType || "").toUpperCase();
  if (p === "INDUCTION" || t === "INDUCTION") return { label: "🎯 Set Induksi", bg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" };
  if (p === "CONCEPT" || t === "CONCEPT" || t === "TEXT_MARKDOWN" || t === "NOTE") return { label: "📚 Kenali Konsep", bg: "bg-amber-500/10 text-amber-300 border-amber-500/30" };
  if (p === "WORKED_EXAMPLE" || t === "WORKED_EXAMPLE") return { label: "✏️ Contoh Terbimbing", bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" };
  if (p === "PBD_ASSESSMENT" || t === "PBD_ASSESSMENT" || t === "QUIZ" || t === "ASSESSMENT") return { label: "📝 Pentaksiran PBD", bg: "bg-rose-500/10 text-rose-300 border-rose-500/30" };
  if (p === "REFLECTION" || t === "REFLECTION") return { label: "🌱 Refleksi", bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" };
  return { label: "🎒 Modul Pembelajaran", bg: "bg-stone-500/10 text-stone-300 border-stone-500/30" };
};

// ==========================================
// YOUTUBE VIDEO EMBED SUB-COMPONENT
// ==========================================
function YouTubeLesson({ videoUrl, onCompleted, isCompleted, scriptText, searchQuery, studentName }) {
  const [showScript, setShowScript] = useState(false);

  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    const str = String(videoUrl).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
    const match = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return (match && match[1] && match[1].length === 11) ? match[1] : null;
  }, [videoUrl]);

  if (!videoId) {
    return (
      <div className="p-5 bg-stone-900/90 border-2 border-stone-800 rounded-2xl space-y-4 text-left">
        {scriptText ? (
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              📜 Skrip & Taklimat Video
            </span>
            <div
              className="text-xs sm:text-sm text-stone-200 leading-relaxed font-semibold space-y-2"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(scriptText, studentName)) }}
            />
          </div>
        ) : (
          <p className="text-amber-200 font-bold text-xs text-center">
            🎬 Video taklimat belum disediakan.
          </p>
        )}

        {searchQuery && (
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Cari Video di YouTube ({searchQuery})
          </a>
        )}

        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl h-11 border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
          onClick={onCompleted}
        >
          {isCompleted ? "Selesai Taklimat Video ✓" : <>Teruskan Misi ➡️</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full text-left">
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-stone-700 bg-black shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Taklimat"
        />
      </div>

      {scriptText && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowScript((prev) => !prev)}
            className="w-full p-3 bg-stone-800/60 hover:bg-stone-800 text-amber-300 font-black text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              📜 {showScript ? "Sembunyikan Skrip Video" : "Lihat Skrip & Nota Video"}
            </span>
            <span className="text-stone-400 text-xs">{showScript ? "▲" : "▼"}</span>
          </button>
          {showScript && (
            <div className="p-4 bg-amber-950/20 border-t border-stone-800 space-y-2">
              <div
                className="text-xs sm:text-sm text-stone-200 leading-relaxed font-semibold space-y-2"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(scriptText, studentName)) }}
              />
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl h-11 border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
        onClick={onCompleted}
      >
        {isCompleted ? "Selesai Video ✓" : <>Teruskan Misi ➡️</>}
      </Button>
    </div>
  );
}

// ==========================================
// INTERACTIVE GAME / ACTIVITY SUB-COMPONENT
// ==========================================
function InteractiveGameBlock({ blockType, blockTitle, payload, studentName, onCompleted, isCompleted }) {
  let activityData = payload.activity_data || payload.activity_data_json || {};
  if (typeof activityData === "string") {
    try { activityData = JSON.parse(activityData); } catch { activityData = {}; }
  }

  const items = Array.isArray(activityData.items)
    ? activityData.items
    : (Array.isArray(activityData.pairs)
      ? activityData.pairs.map((p) => ({ left: p.left || p.pair_a || p.item, right: p.right || p.pair_b || p.match }))
      : (Array.isArray(payload.items)
        ? payload.items
        : (Array.isArray(payload.options) ? payload.options : [])));

  const activityType = (payload.activity_type || activityData.type || activityData.activity_type || blockType || "matching").toLowerCase();

  return (
    <InteractiveActivity
      activity={{
        type: activityType,
        title: blockTitle || "Aktiviti Pembelajaran Interaktif",
        instructions: payload.instructions || activityData.instructions || payload.prompt,
        items: items,
      }}
      studentName={studentName}
      onComplete={onCompleted}
      isCompleted={isCompleted}
    />
  );
}

// ==========================================
// INLINE QUIZ COMPONENT FOR QUIZ BLOCKS
// ==========================================
function InlineQuizBlock({ questions = [], onCompleted, isCompleted, studentName }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const normalizedQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      let optionsList = [];
      if (Array.isArray(q.options)) {
        optionsList = q.options;
      } else if (q.options && typeof q.options === "object") {
        optionsList = Object.values(q.options);
      } else if (q.choices && Array.isArray(q.choices)) {
        optionsList = q.choices;
      }

      const correctIdx = q.correct_index ?? q.correctIndex ?? q.answer_index ?? q.correct_answer ?? 0;
      
      let resolvedCorrectIndex = 0;
      if (typeof correctIdx === "number") {
        resolvedCorrectIndex = correctIdx;
      } else if (!isNaN(Number(correctIdx))) {
        resolvedCorrectIndex = Number(correctIdx);
      } else if (typeof correctIdx === "string") {
        const foundIdx = optionsList.findIndex(o => String(o).trim().toLowerCase() === String(correctIdx).trim().toLowerCase());
        if (foundIdx !== -1) {
          resolvedCorrectIndex = foundIdx;
        }
      }

      return {
        id: idx,
        question: personalize(q.question || q.stem || `Soalan ${idx + 1}`, studentName),
        options: optionsList.map((opt) => personalize(String(opt), studentName)),
        correctIndex: resolvedCorrectIndex,
        explanation: personalize(q.explanation || q.reason || "", studentName),
        visual_a: q.visual_a,
        visual_b: q.visual_b
      };
    });
  }, [questions, studentName]);

  const handleSelectOption = (questionIdx, optionIdx) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    normalizedQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    return Math.round((correctCount / (normalizedQuestions.length || 1)) * 100);
  };

  if (normalizedQuestions.length === 0) {
    return (
      <div className="p-6 bg-stone-900/90 rounded-2xl border border-stone-800 text-center space-y-4">
        <HelpCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-xs font-bold text-stone-200">
          Ujian bersedia! Klik butang di bawah untuk melengkapkan cabaran kuiz ini.
        </p>
        <Button
          onClick={onCompleted}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 flex items-center justify-center gap-1.5"
        >
          {isCompleted ? "Kuiz Selesai ✓" : <>Teruskan Misi ➡️</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {normalizedQuestions.map((q, qIdx) => {
        const selectedOpt = userAnswers[qIdx];
        const isAnswered = selectedOpt !== undefined;

        return (
          <div key={qIdx} className="p-4 sm:p-5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3">
            <p className="text-xs sm:text-sm font-black text-amber-300">
              {qIdx + 1}. {q.question}
            </p>

            {(q.visual_a || q.visual_b) && (
              <div className="flex gap-6 my-3 text-3xl sm:text-4xl justify-center bg-black/40 p-3 rounded-2xl border border-stone-800">
                {q.visual_a && <div className="text-center"><span className="text-[10px] font-black text-stone-500 uppercase block mb-1">Pilihan A</span>{q.visual_a}</div>}
                {q.visual_b && <div className="text-center"><span className="text-[10px] font-black text-stone-500 uppercase block mb-1">Pilihan B</span>{q.visual_b}</div>}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {q.options.map((option, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = optIdx === q.correctIndex;

                let btnStyle = "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700";
                if (submitted) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-900/80 border-emerald-500 text-emerald-200 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-900/80 border-rose-500 text-rose-200 font-bold";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-amber-500 text-stone-950 font-bold border-amber-400";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(qIdx, optIdx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-semibold space-y-1">
                <span className="font-black text-amber-400">💡 Penerangan:</span>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {submitted ? (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-3">
          <p className="text-sm font-black text-emerald-300">
            🎉 Tahniah {studentName}! Skor Anda: {calculateScore()}%
          </p>
          <Button
            onClick={onCompleted}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
          >
            {isCompleted ? "Kuiz Selesai ✓" : <>Teruskan Misi ➡️</>}
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(userAnswers).length < normalizedQuestions.length}
          className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm rounded-xl border-b-4 border-amber-600 active:translate-y-1 transition-all"
        >
          Hantar Jawapan Kuiz 🚀
        </Button>
      )}
    </div>
  );
}

// ==========================================
// NEW: AUDIO HOOK (Fasa 1)
// ==========================================
function AudioHookBlock({ payload, studentName, onCompleted, isCompleted }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const text = payload.audio_script || payload.markdown || "Audio sedia dimainkan...";

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-2 border-indigo-500/40 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/50 shadow-inner">
          <Volume2 className="w-7 h-7 text-indigo-300" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider">Mesej Suara Misteri</h4>
          <div className="p-4 bg-stone-950/50 rounded-2xl border border-stone-800 relative">
            <div className="absolute -left-2 top-4 border-[6px] border-transparent border-r-stone-950/50"></div>
            <p className="text-sm font-semibold text-stone-200 leading-relaxed italic">
              "{personalize(text, studentName)}"
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handlePlay} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl">
          {isPlaying ? <span className="animate-pulse flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sedang Memainkan...</span> : "▶️ Mainkan Audio"}
        </Button>
        <Button onClick={onCompleted} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black h-11 rounded-xl">
          {isCompleted ? "Selesai ✓" : "Teruskan ➡️"}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// NEW: CONCEPT CARD (Fasa 2)
// ==========================================
function ConceptCardBlock({ payload, studentName, onCompleted, isCompleted }) {
  return (
    <div className="p-6 bg-gradient-to-br from-amber-950/60 to-orange-950/40 border-2 border-amber-500/30 rounded-3xl space-y-4 shadow-xl text-left">
      <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
        <Sparkles className="w-6 h-6 text-amber-400" />
        <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">Kad Fakta Pintar</h4>
      </div>
      <div
        className="text-sm text-stone-200 leading-relaxed font-semibold space-y-3 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || payload.text || "", studentName)) }}
      />
      <Button onClick={onCompleted} className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black h-12 rounded-xl border-b-4 border-amber-700 active:translate-y-1 transition-all">
        {isCompleted ? "Faham ✓" : "Saya Faham Konsep Ini ➡️"}
      </Button>
    </div>
  );
}

// ==========================================
// NEW: MATCHING GAME (Fasa 3)
// ==========================================
function MatchingGameBlock({ payload, studentName, onCompleted, isCompleted }) {
  const pairs = payload.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  
  const handleLeftClick = (idx) => {
    if (!matchedIds.includes(idx)) setSelectedLeft(idx);
  };
  
  const handleRightClick = (idx) => {
    if (selectedLeft === idx) {
      const newMatched = [...matchedIds, idx];
      setMatchedIds(newMatched);
      setSelectedLeft(null);
      if (newMatched.length === pairs.length) {
        setTimeout(onCompleted, 1000);
      }
    } else {
      setSelectedLeft(null); // Reset on wrong
    }
  };

  if (pairs.length === 0) return <p className="text-stone-400 text-xs">Tiada data padanan.</p>;

  return (
    <div className="p-5 bg-stone-900/90 border border-stone-700 rounded-3xl space-y-4 text-center">
      <p className="text-xs font-bold text-stone-300 mb-4">Padankan item di sebelah kiri dengan rakan pasangannya di sebelah kanan.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {pairs.map((p, idx) => (
            <button
              key={`L-${idx}`}
              onClick={() => handleLeftClick(idx)}
              disabled={matchedIds.includes(idx)}
              className={`w-full p-3 text-xs sm:text-sm font-bold rounded-xl border-2 transition-all ${matchedIds.includes(idx) ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-400 opacity-50" : selectedLeft === idx ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}
            >
              {personalize(p.left || p.question, studentName)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {pairs.map((p, idx) => (
            <button
              key={`R-${idx}`}
              onClick={() => handleRightClick(idx)}
              disabled={matchedIds.includes(idx)}
              className={`w-full p-3 text-xs sm:text-sm font-bold rounded-xl border-2 transition-all ${matchedIds.includes(idx) ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-400 opacity-50" : "bg-stone-800 border-stone-600 text-stone-200 hover:bg-stone-700"}`}
            >
              {personalize(p.right || p.answer, studentName)}
            </button>
          ))}
        </div>
      </div>
      
      {matchedIds.length === pairs.length && (
        <div className="mt-4 p-3 bg-emerald-950/60 text-emerald-300 font-black rounded-xl border border-emerald-500/40 animate-pulse">
          🎉 Tahniah {studentName}! Semua padanan tepat.
        </div>
      )}
      
      <Button onClick={onCompleted} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black h-12 rounded-xl">
        {isCompleted ? "Selesai ✓" : "Langkau / Teruskan ➡️"}
      </Button>
    </div>
  );
}

// ==========================================
// NEW: GUIDED PRACTICE (Fasa 4)
// ==========================================
function GuidedPracticeBlock({ payload, studentName, onCompleted, isCompleted }) {
  const [showHint, setShowHint] = useState(false);
  const hints = payload.hints || (payload.hint ? [payload.hint] : []);

  return (
    <div className="p-5 bg-stone-900/90 border border-cyan-500/30 rounded-3xl space-y-4 text-left shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-cyan-400" />
        <h4 className="text-sm font-black text-cyan-300 uppercase tracking-wider">Latihan Terbimbing</h4>
      </div>
      
      {payload.markdown && (
        <div
          className="text-sm text-stone-200 font-semibold space-y-2"
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown, studentName)) }}
        />
      )}

      {hints.length > 0 && (
        <div className="mt-4">
          <Button onClick={() => setShowHint(!showHint)} variant="outline" className="text-[10px] font-bold h-8 border-cyan-500/50 text-cyan-400 hover:bg-cyan-950">
            {showHint ? "Sembunyikan Pembayang" : "💡 Tunjuk Pembayang (Hint)"}
          </Button>
          
          {showHint && (
            <div className="mt-2 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2">
              {hints.map((hint, idx) => (
                <p key={idx} className="text-xs font-medium text-cyan-200 flex items-start gap-2">
                  <span className="font-black text-cyan-500">{idx + 1}.</span> {personalize(hint, studentName)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <Button onClick={onCompleted} className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black h-11 rounded-xl">
        {isCompleted ? "Latihan Selesai ✓" : "Saya Dah Selesai Cuba ➡️"}
      </Button>
    </div>
  );
}

// ==========================================
// MAIN BLOCK RENDERER COMPONENT
// ==========================================
export default function BlockRenderer({
  block,
  studentName = "Pengembara",
  isSpeaking = false,
  isCompleted = false,
  onSpeak = () => {},
  onComplete = () => {},
  onMistake = () => {}
}) {
  if (!block) return null;

  const blockType = (block.block_type || "").toUpperCase();
  const pedagogicalPhase = (block.pedagogical_phase || "").toUpperCase();
  const badgeInfo = getPedagogicalBadge(pedagogicalPhase, blockType);

  const payload = typeof block.payload === "string"
    ? (() => { try { return JSON.parse(block.payload); } catch { return { markdown: block.payload }; } })()
    : (block.payload || {});

  if (!payload || Object.keys(payload).length === 0) {
    return (
      <div className="p-6 bg-rose-950/40 border-2 border-rose-500/40 rounded-3xl text-center space-y-3">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-rose-300 font-black">Ralat Kandungan Blok</h3>
        <p className="text-rose-400/80 text-xs">Tiada soalan/kandungan ditemui dalam payload blok ini.</p>
        <Button onClick={onComplete} className="mt-4 bg-stone-800 hover:bg-stone-700 text-stone-200">Abai & Teruskan</Button>
      </div>
    );
  }

  // Extract block title safely
  const rawTitle = replaceStudentVariables(block.title || "", studentName);
  const blockTitle = (!rawTitle || rawTitle === "Skrip Video (AI)" || rawTitle === "Skrip Video") ? "Taklimat Video" : rawTitle;

  switch (blockType) {
    case "VIDEO_LESSON": {
      let videoUrl = payload.video_url || "";
      let videoId = null;
      if (videoUrl) {
        const str = String(videoUrl).trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
          videoId = str;
        } else {
          const match = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
          if (match && match[1] && match[1].length === 11) videoId = match[1];
        }
      }

      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-rose-300 flex items-center gap-2">
              <Tv className="w-5 h-5 text-rose-400" /> {blockTitle || payload.video_title || "Video Pembelajaran"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>

          {!videoId ? (
            <div className="p-5 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-center space-y-2">
              <Tv className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-bold text-rose-300">
                Pautan video belum dimasukkan. Sila masukkan pautan YouTube di Langkah 4.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={payload.video_title || "Video Lesson"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {payload.description && (
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                  <p className="text-sm font-bold text-stone-300">{payload.description}</p>
                </div>
              )}

              {payload.key_points && Array.isArray(payload.key_points) && payload.key_points.length > 0 && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-3">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Perkara Penting:
                  </span>
                  <ul className="list-disc pl-5 space-y-1">
                    {payload.key_points.map((pt, idx) => (
                      <li key={idx} className="text-sm font-medium text-stone-200">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={onComplete}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {isCompleted ? "Video Selesai ✓" : "Selesai Menonton ➡️"}
              </Button>
            </div>
          )}
        </div>
      );
    }
    // 1. INDUCTION / SUKU MYSTERY HOOK
    case "INDUCTION":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
              <span className="text-2xl">🐢</span> {blockTitle || "Set Induksi Bersama Suku"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>

          <div className="p-5 bg-gradient-to-br from-cyan-950/50 via-stone-900 to-stone-950 border-2 border-cyan-500/40 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl shrink-0">
                🐢
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Misteri & Cabaran Suku</span>
                <h4 className="text-sm font-black text-white">Suku Perlukan Bantuan Kamu!</h4>
              </div>
            </div>

            <div
              className="text-xs sm:text-sm text-stone-200 leading-relaxed font-bold space-y-2"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || payload.text || "", studentName)) }}
            />
          </div>

          <Button
            onClick={onComplete}
            className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-cyan-700 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isCompleted ? "Set Induksi Selesai ✓" : <>Bantu Suku & Teruskan Misi ➡️</>}
          </Button>
        </div>
      );

    // 2. WORKED EXAMPLE (Step-by-Step Solutions)
    case "WORKED_EXAMPLE":
      {
        const steps = Array.isArray(payload.step_by_step_solution) ? payload.step_by_step_solution : (Array.isArray(payload.steps) ? payload.steps : []);
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-indigo-300 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-indigo-400" /> {blockTitle || "Contoh Terbimbing"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>

            <div className="p-5 bg-stone-900/90 border border-indigo-500/30 rounded-3xl space-y-4 shadow-xl">
              {payload.problem && (
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl text-xs sm:text-sm font-black text-indigo-200">
                  📌 Soalan: {personalize(payload.problem, studentName)}
                </div>
              )}

              {steps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Penyelesaian Langkah demi Langkah</span>
                  {steps.map((step, idx) => (
                    <div key={idx} className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs font-bold text-stone-200 flex items-start gap-2">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-md shrink-0">
                        Langkah {idx + 1}
                      </span>
                      <span>{personalize(step, studentName)}</span>
                    </div>
                  ))}
                </div>
              )}

              {payload.common_student_mistake && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 font-bold space-y-1">
                  <span className="text-rose-400 font-black">⚠️ Kesilapan Lazim Murid:</span>
                  <p>{personalize(payload.common_student_mistake, studentName)}</p>
                </div>
              )}

              {payload.correct_reasoning && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 font-bold space-y-1">
                  <span className="text-emerald-400 font-black">✅ Penalaran Betul:</span>
                  <p>{personalize(payload.correct_reasoning, studentName)}</p>
                </div>
              )}
            </div>

            <Button
              onClick={onComplete}
              className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-indigo-700 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {isCompleted ? "Contoh Selesai ✓" : <>Teruskan Misi ➡️</>}
            </Button>
          </div>
        );
      }

    // 3. CONCEPT EXPLANATION & MARKDOWN NOTES
    case "TEXT_MARKDOWN":
    case "NOTE":
    case "TEXT":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> {blockTitle || "Nota Pengembaraan"}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
              {(payload.markdown || payload.text) && (
                <Button
                  onClick={() => onSpeak(payload.markdown || payload.text)}
                  className={`h-8 px-2.5 rounded-xl font-black text-[11px] ${
                    isSpeaking ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-400 hover:bg-amber-300 text-stone-950"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 mr-1" /> : <Volume2 className="w-3.5 h-3.5 mr-1" />}
                  {isSpeaking ? "Berhenti" : "Dengar"}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-4 bg-black/40 rounded-2xl border border-stone-800 text-xs sm:text-sm leading-relaxed font-bold space-y-3">
            {payload.image_url && (
              <img src={payload.image_url} alt="Illustration" className="w-full max-w-md mx-auto rounded-2xl mb-4 border border-stone-700" />
            )}
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || payload.text || "", studentName)) }} />
          </div>

          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isCompleted ? "Nota Selesai ✓" : <>Teruskan Misi ➡️</>}
          </Button>
        </div>
      );

    // 4. REFLECTION JOURNAL
    case "REFLECTION":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" /> {blockTitle || "Refleksi Kendiri"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>

          <div className="p-5 bg-stone-900/90 rounded-3xl border border-emerald-500/30 text-xs sm:text-sm font-bold space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
              <span>🌱 Jurnal Refleksi DSKP</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.prompt || payload.markdown || payload.text || "Apakah perkara utama yang anda pelajari dalam sesi ini?", studentName)) }} />
          </div>

          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {isCompleted ? "Refleksi Selesai ✓" : <>Selesai Refleksi! Teruskan Misi ➡️</>}
          </Button>
        </div>
      );

    // 5. PBD ASSESSMENT & INLINE QUIZ
    case "PBD_ASSESSMENT":
    case "QUIZ":
    case "ASSESSMENT":
      {
        const quizItems = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload.questions)
            ? payload.questions
            : (Array.isArray(payload.quiz) ? payload.quiz : (Array.isArray(payload.items) ? payload.items : (payload.question ? [payload] : []))));

        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-rose-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-400" /> {blockTitle || "Pentaksiran Bilik Darjah (PBD)"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>

            <InlineQuizBlock
              questions={quizItems}
              onCompleted={onComplete}
              isCompleted={isCompleted}
              studentName={studentName}
            />
          </div>
        );
      }

    // 6. VIDEO EMBED
    case "VIDEO_EMBED":
    case "VIDEO":
    case "VIDEO_SCRIPT":
      {
        const directVideoUrl =
          block.video_url ||
          block.youtube_url ||
          block.url ||
          payload.youtube_url ||
          payload.video_url ||
          payload.media_url ||
          payload.embed_url ||
          payload.url ||
          (payload.youtube_id ? `https://www.youtube.com/watch?v=${payload.youtube_id}` : null) ||
          (payload.video_id ? `https://www.youtube.com/watch?v=${payload.video_id}` : null) ||
          (typeof block.payload === "string" && block.payload.trim().startsWith("http") ? block.payload.trim() : null);

        const videoScript = payload.video_script || payload.script || payload.voice_script || payload.description || payload.summary || payload.markdown || payload.text || block.content_markdown;

        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-400" /> {blockTitle || "Taklimat Video"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <YouTubeLesson
              videoUrl={directVideoUrl}
              scriptText={videoScript}
              searchQuery={payload.search_query}
              studentName={studentName}
              onCompleted={onComplete}
              isCompleted={isCompleted}
            />
          </div>
        );
      }

    // 7. MIND MAP
    case "MIND_MAP":
    case "MINDMAP":
      {
        const imgUrl = payload.image_url || payload.svg_url || payload.img;
        let centralTopic = personalize(blockTitle || payload.central_topic || payload.topic || payload.title || "Peta Minda Utama", studentName);
        let branchesList = [];

        const rawMap = payload.mind_map || payload.mindmap || payload.branches || payload.data || payload;

        if (rawMap && typeof rawMap === "object") {
          if (rawMap.central_topic) centralTopic = personalize(rawMap.central_topic, studentName);
          const rawBranches = Array.isArray(rawMap)
            ? rawMap
            : (Array.isArray(rawMap.branches) ? rawMap.branches : (Array.isArray(payload.branches) ? payload.branches : (Array.isArray(payload.nodes) ? payload.nodes : [])));

          branchesList = rawBranches.map((b) => {
            if (typeof b === "string") return { label: personalize(b, studentName), children: [] };
            return {
              label: personalize(b.label || b.topic || b.title || b.name || "Dahan", studentName),
              children: Array.isArray(b.children)
                ? b.children.map(c => personalize(typeof c === "string" ? c : (c.label || c.title || String(c)), studentName))
                : (Array.isArray(b.subtopics) ? b.subtopics.map(s => personalize(typeof s === "string" ? s : (s.label || s.title || String(s)), studentName)) : [])
            };
          });
        }

        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> {blockTitle || "Peta Minda Visual"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            {imgUrl && (
              <div className="p-3 bg-black/50 border border-stone-800 rounded-2xl overflow-hidden text-center">
                <img src={imgUrl} alt="Peta Minda Visual" className="max-h-[45vh] mx-auto rounded-xl object-contain" />
              </div>
            )}
            <div className="p-4 bg-black/40 rounded-2xl border border-stone-800">
              <MindMap mindMap={{ central_topic: centralTopic, branches: branchesList }} />
            </div>
            <Button
              onClick={onComplete}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
            >
              {isCompleted ? "Peta Minda Selesai ✓" : <>Teruskan Misi ➡️</>}
            </Button>
          </div>
        );
      }

    // 8. FLASHCARDS
    case "FLASHCARD_DECK":
    case "FLASHCARD":
    case "FLASHCARDS":
      {
        const cardsList = (Array.isArray(payload.cards) ? payload.cards : (Array.isArray(payload.flashcards) ? payload.flashcards : (Array.isArray(payload) ? payload : [])))
          .map((card) => ({
            front: personalize(card.front || card.question || card.term || "", studentName),
            back: personalize(card.back || card.answer || card.definition || "", studentName)
          }));

        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> {blockTitle || "Kad Kilat DBP"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <Flashcards flashcards={cardsList} />
            <Button
              onClick={onComplete}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-1.5"
            >
              {isCompleted ? "Kad Kilat Selesai ✓" : <>Teruskan Misi ➡️</>}
            </Button>
          </div>
        );
      }

    // 9. INTERACTIVE GAMES & ACTIVITIES
    case "INTERACTIVE_GAME":
    case "GAME":
    case "ACTIVITY":
    case "ACTIVITIES":
    case "INTERACTIVE":
    case "DRAG_DROP":
    case "MATCHING_GAME":
      if (payload.questions && Array.isArray(payload.questions)) {
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-rose-300 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-rose-400" /> {blockTitle || "Permainan Interaktif"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <InlineQuizBlock
              questions={payload.questions}
              onCompleted={onComplete}
              isCompleted={isCompleted}
              studentName={studentName}
            />
          </div>
        );
      }

      if (payload.widget_type === "base_ten_blocks") {
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Aktiviti Interaktif"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <BaseTenBlocksWidget
              targetNumber={payload.targetNumber || payload.target_number || 34}
              onComplete={onComplete}
              isCompleted={isCompleted}
              onMistake={onMistake}
            />
          </div>
        );
      }

      if (payload.widget_type === "sentence_builder") {
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Bina Ayat"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <SentenceBuilderWidget
              targetSentence={payload.targetSentence || payload.target_sentence || "Ahmad membaca buku di perpustakaan"}
              wordBank={payload.wordBank || payload.word_bank || null}
              onComplete={onComplete}
              isCompleted={isCompleted}
              onMistake={onMistake}
            />
          </div>
        );
      }

      if (payload.widget_type === "fraction_slicer") {
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Pecahan Interaktif"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <FractionSlicerWidget
              targetFraction={payload.targetFraction || payload.target_fraction || "1/2"}
              shapeType={payload.shapeType || payload.shape_type || "circle"}
              onComplete={onComplete}
              isCompleted={isCompleted}
              onMistake={onMistake}
            />
          </div>
        );
      }

      if (payload.widget_type === "number_scale") {
        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Timbangan Nombor"}
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <NumberScaleWidget
              leftVal={payload.leftVal ?? payload.left_val ?? 42}
              rightVal={payload.rightVal ?? payload.right_val ?? 68}
              correctRelation={payload.correctRelation || payload.correct_relation || "LESS_THAN"}
              onComplete={onComplete}
              isCompleted={isCompleted}
              onMistake={onMistake}
            />
          </div>
        );
      }

      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Aktiviti Pembelajaran PBD"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <InteractiveGameBlock
            blockType={blockType}
            blockTitle={blockTitle}
            payload={payload}
            studentName={studentName}
            onCompleted={onComplete}
            isCompleted={isCompleted}
          />
        </div>
      );

    // 10. INFOGRAPHIC
    case "INFOGRAPHIC":
    case "IMAGE":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> {blockTitle || "Infografik Visual"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <InfographicBlock
            blockTitle={blockTitle}
            payload={payload}
            studentName={studentName}
            onCompleted={onComplete}
            isCompleted={isCompleted}
          />
        </div>
      );

    // NEW BLOCK TYPES (Fasa 1-4)
    case "AUDIO_HOOK":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-indigo-300 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-400" /> {blockTitle || "Audio Hook"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <AudioHookBlock payload={payload} studentName={studentName} onCompleted={onComplete} isCompleted={isCompleted} />
        </div>
      );

    case "CONCEPT_CARD":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> {blockTitle || "Kad Konsep"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <ConceptCardBlock payload={payload} studentName={studentName} onCompleted={onComplete} isCompleted={isCompleted} />
        </div>
      );

    case "MATCHING_GAME":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" /> {blockTitle || "Permainan Padanan"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <MatchingGameBlock payload={payload} studentName={studentName} onCompleted={onComplete} isCompleted={isCompleted} />
        </div>
      );

    case "GUIDED_PRACTICE":
      return (
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-cyan-300 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> {blockTitle || "Latihan Terbimbing"}
            </h3>
            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>
          <GuidedPracticeBlock payload={payload} studentName={studentName} onCompleted={onComplete} isCompleted={isCompleted} />
        </div>
      );

    // DEFAULT FALLBACK
    default:
      return (
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-3 text-left overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-amber-300">Modul Belum Disokong ({blockType})</h3>
          </div>
          
          {payload.markdown ? (
            <div
              className="text-stone-300 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words space-y-2 mb-4"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(payload.markdown || "") }}
            />
          ) : (
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 overflow-x-auto">
              <pre className="text-[10px] text-stone-400">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
          )}

          <Button onClick={onComplete} className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-emerald-700 flex items-center justify-center gap-1.5 mt-4">
            {isCompleted ? "Selesai ✓" : <>Teruskan Misi ➡️</>}
          </Button>
        </div>
      );
  }
}
