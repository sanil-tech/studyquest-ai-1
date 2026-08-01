// src/components/lesson/BlockRenderer.jsx
// Reusable Polymorphic Block Renderer for StudyQuest Learning Packages

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
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

import Flashcards from "@/components/lesson/Flashcards";
import MindMap from "@/components/lesson/MindMap";
import InfographicBlock from "@/components/lesson/InfographicBlock";

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
    htmlOutput.push(`<p class="text-xs sm:text-sm text-stone-200 font-bold mb-2">${trimmed}</p>`);
  });

  return htmlOutput.join("\n").replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-amber-300">$1</strong>');
};

// ==========================================
// YOUTUBE VIDEO EMBED SUB-COMPONENT
// ==========================================
function YouTubeLesson({ videoUrl, onCompleted, isCompleted, scriptText, searchQuery, studentName }) {
  const [showScript, setShowScript] = useState(false);

  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    const str = String(videoUrl).trim();

    // 1. Check direct 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    // 2. Check standard YouTube URL formats: watch, youtu.be, shorts, embed
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
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl h-11 border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          onClick={onCompleted}
        >
          {isCompleted ? "Selesai Taklimat Video ✓" : "Selesai & Ambil +10 XP 🔥"}
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
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl h-11 border-b-4 border-emerald-700 active:translate-y-1 transition-all"
        onClick={onCompleted}
      >
        {isCompleted ? "Selesai Video ✓" : "Selesai & Ambil +10 XP 🔥"}
      </Button>
    </div>
  );
}

// ==========================================
// INTERACTIVE GAME / ACTIVITY SUB-COMPONENT
// ==========================================
function InteractiveGameBlock({ blockType, blockTitle, payload, studentName, onCompleted, isCompleted }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [completedItems, setCompletedItems] = useState({});

  const instructions = personalize(
    payload.instructions || payload.prompt || payload.markdown || payload.description || payload.text || "Selesaikan cabaran interaktif ini untuk menguji kefahaman anda!",
    studentName
  );

  const options = Array.isArray(payload.options)
    ? payload.options
    : (Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.choices) ? payload.choices : []));

  const toggleItem = (idx) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-left">
        <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Aktiviti Interaktif"}
        </h3>
        <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 text-[10px] font-black uppercase rounded-full border border-cyan-500/30">
          {(blockType || "INTERACTIVE").replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-5 sm:p-6 bg-gradient-to-br from-cyan-950/40 via-stone-900 to-indigo-950/40 border border-cyan-500/30 rounded-2xl space-y-4 text-left">
        <div className="w-14 h-14 bg-cyan-500/20 text-cyan-300 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-cyan-400/30">
          🎮
        </div>

        <div
          className="text-xs sm:text-sm text-stone-200 font-bold leading-relaxed space-y-2 text-center"
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(instructions) }}
        />

        {options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {options.map((opt, i) => {
              const isDone = !!completedItems[i] || selectedOption === i;
              const text = typeof opt === "object" ? (opt.text || opt.label || opt.title || JSON.stringify(opt)) : String(opt);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedOption(i);
                    toggleItem(i);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border ${
                    isDone
                      ? "bg-emerald-900/80 border-emerald-500 text-emerald-200 shadow-md"
                      : "bg-stone-800/80 hover:bg-stone-700/80 border-stone-700 text-amber-200"
                  }`}
                >
                  <span>{personalize(text, studentName)}</span>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button
        onClick={onCompleted}
        className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Permainan Selesai ✓" : "Selesai Permainan & Ambil XP! 🎮"}
      </Button>
    </div>
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

      return {
        id: idx,
        question: personalize(q.question || q.stem || `Soalan ${idx + 1}`, studentName),
        options: optionsList.map((opt) => personalize(String(opt), studentName)),
        correctIndex: typeof correctIdx === "number" ? correctIdx : Number(correctIdx) || 0,
        explanation: personalize(q.explanation || q.reason || "", studentName)
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
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700"
        >
          {isCompleted ? "Kuiz Selesai ✓" : "Selesai Kuiz! 👑"}
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
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Kuiz Selesai ✓" : "Selesai & Ambil Hadiah XP! 👑"}
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
// MAIN BLOCK RENDERER COMPONENT
// ==========================================
export default function BlockRenderer({
  block,
  studentName = "Pengembara",
  isSpeaking = false,
  isCompleted = false,
  onSpeak = () => {},
  onComplete = () => {}
}) {
  if (!block) return null;

  console.log("[CONTENT BLOCK AUDIT]", {
    type: block.block_type,
    title: block.title,
    payload: block.payload
  });

  // Normalize block_type safely
  const blockType = (block.block_type || "").toUpperCase();

  // Safely resolve payload
  const payload = typeof block.payload === "string"
    ? (() => { try { return JSON.parse(block.payload); } catch { return { markdown: block.payload }; } })()
    : (block.payload || {});

  // Extract block title safely
  const rawTitle = replaceStudentVariables(block.title || "", studentName);
  const blockTitle = (!rawTitle || rawTitle === "Skrip Video (AI)" || rawTitle === "Skrip Video") ? "Taklimat Video" : rawTitle;

  switch (blockType) {
    case "TEXT_MARKDOWN":
    case "NOTE":
    case "TEXT":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> {blockTitle || "Nota Pengembaraan"}
            </h3>
            {(payload.markdown || payload.text) && (
              <Button
                onClick={() => onSpeak(payload.markdown || payload.text)}
                className={`h-9 px-3 rounded-xl font-black text-xs ${
                  isSpeaking ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-400 hover:bg-amber-300 text-stone-950"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                {isSpeaking ? "Berhenti" : "Dengar"}
              </Button>
            )}
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 bg-black/40 rounded-2xl border border-stone-800 text-xs sm:text-sm leading-relaxed font-bold space-y-3">
            {payload.image_url && (
              <img src={payload.image_url} alt="Illustration" className="w-full max-w-md mx-auto rounded-2xl mb-4 border border-stone-700" />
            )}
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || payload.text || "", studentName)) }} />
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Nota Selesai ✓" : "Selesai Hadam Nota! 🎒"}
          </Button>
        </div>
      );

    case "AI_EXPLANATION":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> {blockTitle || "Penerangan Pintar AI"}
            </h3>
            {(payload.markdown || payload.explanation || payload.text) && (
              <Button
                onClick={() => onSpeak(payload.markdown || payload.explanation || payload.text)}
                className={`h-9 px-3 rounded-xl font-black text-xs ${
                  isSpeaking ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-amber-400 hover:bg-amber-300 text-stone-950"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                {isSpeaking ? "Berhenti" : "Dengar"}
              </Button>
            )}
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-950/40 via-stone-900 to-indigo-950/40 rounded-2xl border border-purple-500/30 text-xs sm:text-sm leading-relaxed font-bold space-y-3">
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || payload.explanation || payload.text || "", studentName)) }} />
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Penerangan Selesai ✓" : "Selesai & Ambil +15 XP 🤖"}
          </Button>
        </div>
      );

    case "REFLECTION":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Brain className="w-5 h-5 text-sky-400" /> {blockTitle || "Refleksi Kendiri"}
            </h3>
          </div>
          <div className="p-5 bg-stone-900/90 rounded-2xl border border-sky-500/30 text-xs sm:text-sm font-bold space-y-3">
            <p className="text-sky-300 font-black text-xs uppercase tracking-wider">💭 Soalan Refleksi</p>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.prompt || payload.markdown || payload.text || "Apakah perkara utama yang anda pelajari dalam sesi ini?", studentName)) }} />
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Refleksi Selesai ✓" : "Selesai Refleksi! 💭"}
          </Button>
        </div>
      );

    case "QUIZ":
    case "ASSESSMENT":
      {
        const quizItems = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload.questions)
            ? payload.questions
            : (Array.isArray(payload.quiz) ? payload.quiz : (Array.isArray(payload.items) ? payload.items : (payload.question ? [payload] : []))));

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-400" /> {blockTitle || "Ujian Modul"}
              </h3>
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
          (typeof block.payload === "string" && block.payload.trim().startsWith("http") ? block.payload.trim() : null) ||
          (typeof block.content_markdown === "string" && (block.content_markdown.includes("youtu") || block.content_markdown.startsWith("http")) ? block.content_markdown.trim() : null);

        const videoScript = payload.video_script || payload.script || payload.voice_script || payload.description || payload.summary || payload.markdown || payload.text || block.content_markdown;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-400" /> {blockTitle || "Taklimat Video"}
              </h3>
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
            : (Array.isArray(rawMap.branches) ? rawMap.branches : (Array.isArray(payload.branches) ? payload.branches : []));

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
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> {blockTitle || "Peta Minda"}
              </h3>
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
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
            >
              {isCompleted ? "Peta Minda Selesai ✓" : "Selesai Peta Minda! 🧠"}
            </Button>
          </div>
        );
      }

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
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> {blockTitle || "Kad Kilat"}
              </h3>
            </div>
            <Flashcards flashcards={cardsList} />
            <Button
              onClick={onComplete}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
            >
              {isCompleted ? "Kad Kilat Selesai ✓" : "Selesai Kad Kilat! 🎴"}
            </Button>
          </div>
        );
      }

    case "INTERACTIVE_GAME":
    case "GAME":
    case "ACTIVITY":
    case "ACTIVITIES":
    case "INTERACTIVE":
    case "DRAG_DROP":
    case "MATCHING_GAME":
    case "BOSS_CHALLENGE":
    case "INTERACTIVE_PLACE_VALUE":
    case "LESSON_ACTIVITY":
      return (
        <InteractiveGameBlock
          blockType={blockType}
          blockTitle={blockTitle}
          payload={payload}
          studentName={studentName}
          onCompleted={onComplete}
          isCompleted={isCompleted}
        />
      );

    case "INFOGRAPHIC":
    case "IMAGE":
      return (
        <InfographicBlock
          blockTitle={blockTitle}
          payload={payload}
          studentName={studentName}
          onCompleted={onComplete}
          isCompleted={isCompleted}
        />
      );

    case "AUDIO_TTS":
      return (
        <div className="space-y-4 text-center">
          <h3 className="text-base font-black text-amber-300 flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" /> {blockTitle || "Audio Pengajaran"}
          </h3>
          <p className="text-xs text-stone-300 font-bold">{personalize(payload.voice_script, studentName)}</p>
          {payload.audio_url && <audio controls src={payload.audio_url} className="mx-auto" />}
          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Audio Selesai ✓" : "Selesai Audio! 🎧"}
          </Button>
        </div>
      );

    case "WORKSHEET":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> {blockTitle || "Lembaran Kerja"}
            </h3>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-4 bg-black/40 rounded-2xl border border-stone-800 text-xs sm:text-sm leading-relaxed font-bold space-y-3">
            {payload.media_url && (
              <a href={payload.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl mb-3">
                📄 Muat Turun Lembaran Kerja
              </a>
            )}
            <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(personalize(payload.markdown || "", studentName)) }} />
          </div>
          <Button
            onClick={onComplete}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            {isCompleted ? "Lembaran Kerja Selesai ✓" : "Selesai Lembaran Kerja! 📝"}
          </Button>
        </div>
      );

    default:
      if (
        blockType.includes("GAME") ||
        blockType.includes("ACTIVIT") ||
        blockType.includes("INTERACTIV") ||
        blockType.includes("MATCH") ||
        blockType.includes("DRAG") ||
        blockType.includes("CHALLENGE")
      ) {
        return (
          <InteractiveGameBlock
            blockType={blockType}
            blockTitle={blockTitle}
            payload={payload}
            studentName={studentName}
            onCompleted={onComplete}
            isCompleted={isCompleted}
          />
        );
      }
      return (
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-xs font-bold text-stone-200">Blok Kandungan ({block.block_type || "Modul"})</p>
          <Button onClick={onComplete} className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-emerald-700">
            Selesai & Teruskan ✓
          </Button>
        </div>
      );
  }
}
