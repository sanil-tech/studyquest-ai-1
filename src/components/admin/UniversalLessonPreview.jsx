import React, { useState, useMemo } from "react";
import sukuPenyuMascotImg from "@/assets/images/suku_penyu_mascot_1785919182374.jpg";
import { generateDynamicImagePrompt, getPromptSeed } from "@/utils/generateDynamicImagePrompt";
import { getStaticFallbackImage } from "@/services/aiImageEngine";
import StoryHookMedia from "@/components/lesson/StoryHookMedia";
import {
  Heart,
  Star,
  ChevronLeft,
  RotateCcw,
  Smartphone,
  Tablet,
  Code,
  Eye,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import BlockRenderer from "@/components/lesson/BlockRenderer";
import LessonShellRenderer from "@/components/lesson/LessonShellRenderer";
import Flashcards from "@/components/lesson/Flashcards";
import confetti from "canvas-confetti";
import { sanitizeStudentText } from "@/lib/sanitizeStudentText";

/**
 * StoryScene Component (Step 1: Briefing)
 */
function StoryScene({ data, mascotName = "Suku Penyu 🐢", studentName = "Kawan", devView = false }) {
  const payload = data?.payload || {};
  const rawHook = (payload.story_hook || data.description || "Mari mulakan pengembaraan pembelajaran hari ini!").replace(/\{student_name\}/g, studentName);
  const cleanHook = devView ? rawHook : sanitizeStudentText(rawHook);

  const rawDialogue = (payload.mascot_dialogue || payload.dialogue_template || "Hai {student_name}! Jom kita kembara bersama-sama!").replace(/\{student_name\}/g, studentName);
  const cleanDialogue = devView ? rawDialogue : sanitizeStudentText(rawDialogue);

  const speakDialogue = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ms-MY";
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  const storyText = payload.story_text || data.title || "";
  const fallbackStorySceneImg = getStaticFallbackImage(payload.topic, storyText);
  const storyImagePrompt = payload.image_prompt || payload.visual_prompt || storyText || payload.topic || "";
  const dynamicStoryPrompt = generateDynamicImagePrompt({
    subject: payload.subject || "Matematik",
    grade: payload.grade || "Tahun 1",
    topic: payload.topic || "Nombor hingga 100",
    sceneType: "STORY",
    visualDescription: payload.visual_description || "",
    storyText: storyImagePrompt
  });
  const storySeed = getPromptSeed(dynamicStoryPrompt);
  const storyBannerUrl = (payload.image_url && !payload.image_url.includes("suku_penyu_mascot"))
    ? payload.image_url
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(dynamicStoryPrompt)}?width=800&height=450&nologo=true&seed=${storySeed}`;

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Story Banner with Suku Penyu Visual & Text */}
      <div className="overflow-hidden bg-stone-900 border border-stone-800 rounded-2xl space-y-3 shadow-lg">
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-t from-stone-950 via-stone-900 to-amber-950/40 flex items-center justify-center overflow-hidden">
          <StoryHookMedia content={payload} storyVisual={storyBannerUrl} fallbackSceneImg={fallbackStorySceneImg} />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500/90 text-stone-950 text-[10px] font-black uppercase rounded-lg shadow">
              Kisah Misi Kembara
            </span>
            <span className="text-xs">🐢✨</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            📣 Pengenalan Misi Kembara
          </span>
          <h3 className="text-base font-black text-amber-200">
            {devView ? (data.title || "Kisah Misi KSSR") : sanitizeStudentText(data.title || "Kisah Misi Kembara")}
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed font-medium">
            {cleanHook}
          </p>
        </div>
      </div>

      {/* Suggestive Story Continuation: How to Help Suku Penyu */}
      <div className="p-3.5 bg-gradient-to-r from-amber-900/40 via-amber-950/60 to-stone-900 rounded-2xl border border-amber-500/40 flex items-start gap-3 shadow-md">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-300 font-bold text-sm shadow">
          💡
        </div>
        <div className="space-y-0.5 text-left">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
            Cara Membantu {mascotName} 🐢
          </span>
          <p className="text-xs sm:text-sm text-stone-200 font-semibold leading-relaxed">
            {devView
              ? payload.help_continuation || payload.help_guide || "Mari kita bantu Suku Penyu menyelesaikan cabaran ini dengan menguasai kemahiran subtopik ini bersama-sama!"
              : sanitizeStudentText(
                  payload.help_continuation || payload.help_guide || "Mari kita bantu Suku Penyu menyelesaikan cabaran ini dengan menguasai kemahiran subtopik ini bersama-sama!"
                )}
          </p>
        </div>
      </div>

      {/* Mascot Dialogue Bubble with Profile Picture */}
      <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-start gap-3 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
          <img
            src={sukuPenyuMascotImg}
            alt={mascotName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = sukuPenyuMascotImg;
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-400">{mascotName}</h4>
            <button
              onClick={() => speakDialogue(cleanDialogue)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all"
            >
              🔊 Dengar Suku
            </button>
          </div>
          <p className="text-xs text-stone-200 font-bold leading-relaxed">
            "{cleanDialogue}"
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * TeachingScene Component (Step 2 & 3: Engagement & Lesson)
 */
function TeachingScene({ data, devView = false }) {
  const payload = data?.payload || {};
  const cpaBlocks = data?.cpa_blocks || payload?.cpa_blocks;

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Visual Learning Blocks */}
      {Array.isArray(cpaBlocks) && cpaBlocks.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
            {devView ? "🖼️ Pembelajaran CPA (Konkrit-Bergambar-Abstrak)" : "🖼️ Panduan Pembelajaran Visual"}
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {cpaBlocks.map((cpa, idx) => (
              <div key={idx} className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                {devView && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                    {cpa.block_type}
                  </span>
                )}
                <h5 className="text-xs font-bold text-white mt-1">
                  {devView ? cpa.title : sanitizeStudentText(cpa.title)}
                </h5>
                {cpa.block_type === "VISUAL_STORY" && (
                  <p className="text-xs text-stone-300">
                    {devView ? cpa.content?.text : sanitizeStudentText(cpa.content?.text)}
                  </p>
                )}
                {cpa.block_type === "COMPARISON_SPLIT" && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300">
                      ⬅️ {devView ? cpa.content?.left : sanitizeStudentText(cpa.content?.left)}
                    </div>
                    <div className="p-2 bg-stone-950 rounded border border-stone-800 text-stone-300">
                      ➡️ {devView ? cpa.content?.right : sanitizeStudentText(cpa.content?.right)}
                    </div>
                  </div>
                )}
                {cpa.block_type === "STEP_BY_STEP" && (
                  <ol className="list-decimal list-inside text-xs text-stone-300 space-y-1 pt-1 font-medium">
                    {Array.isArray(cpa.content?.steps)
                      ? cpa.content.steps.map((st, sI) => <li key={sI}>{devView ? st : sanitizeStudentText(st)}</li>)
                      : <li>{devView ? cpa.content?.text : sanitizeStudentText(cpa.content?.text)}</li>}
                  </ol>
                )}
                {cpa.block_type === "MYTH_BUSTER" && (
                  <div className="text-xs space-y-1 pt-1 font-bold">
                    <p className="text-rose-400">❌ Mitos: {devView ? cpa.content?.myth : sanitizeStudentText(cpa.content?.myth)}</p>
                    <p className="text-emerald-400">✅ Fakta: {devView ? cpa.content?.fact : sanitizeStudentText(cpa.content?.fact)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Concept Breakdown */}
      {payload.concept_summary && (
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            {devView ? "📖 Rumusan Konsep DSKP" : "📖 Rumusan Konsep Pembelajaran"}
          </span>
          <p className="text-xs text-stone-200 font-bold leading-relaxed">
            {devView ? payload.concept_summary : sanitizeStudentText(payload.concept_summary)}
          </p>
          {Array.isArray(payload.key_points) && (
            <ul className="list-disc list-inside text-xs text-stone-400 space-y-1 pt-1">
              {payload.key_points.map((kp, kI) => <li key={kI}>{devView ? kp : sanitizeStudentText(kp)}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ActivityScene Component (Step 4: Practice Interactive Widget)
 */
function ActivityScene({ data, devView = false }) {
  const payload = data?.payload || {};
  const widgetType = payload.widget_type || data.widget_type || "base_ten_blocks";
  const WidgetComponent = getWidgetComponent(widgetType);

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
        <span className="font-black text-emerald-300">🎮 Aktiviti Interaktif</span>
        {devView && (
          <span className="font-mono text-[10px] text-stone-400 uppercase">Widget: {widgetType}</span>
        )}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-inner">
        <WidgetComponent
          widgetType={widgetType}
          data={payload.interactive_data || payload}
          targetNumber={payload.targetNumber || payload.target_number || 34}
          targetSentence={payload.targetSentence || payload.target_sentence || "Ahmad membaca buku di perpustakaan"}
          wordBank={payload.wordBank || payload.word_bank || null}
          targetFraction={payload.targetFraction || payload.target_fraction || "1/2"}
          shapeType={payload.shapeType || payload.shape_type || "circle"}
          leftVal={payload.leftVal ?? payload.left_val ?? 42}
          rightVal={payload.rightVal ?? payload.right_val ?? 68}
          correctRelation={payload.correctRelation || payload.correct_relation || "LESS_THAN"}
        />
      </div>
    </div>
  );
}

/**
 * QuizScene Component (Step 7: Assessment)
 */
function QuizScene({ data, devView = false }) {
  const questions = data?.questions || data?.payload?.questions || [
    {
      question: "Apakah nilai tempat bagi digit 4 dalam nombor 45?",
      options: ["Puluh", "Sa", "Ratus"],
      correct_index: 0,
      explanation: "Digit 4 berada di kedudukan puluh.",
      pbd_level: "TP3"
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[0] || {};
  const cleanQText = devView ? currentQ.question : sanitizeStudentText(currentQ.question);

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
            {devView ? `Pentaksiran PBD (${currentQ.pbd_level || "TP3"})` : "Soalan Latihan"}
          </span>
          <span className="text-xs font-bold text-stone-400">Soalan 1 daripada {questions.length}</span>
        </div>

        <h4 className="text-sm font-black text-white leading-relaxed">❓ {cleanQText}</h4>

        <div className="space-y-2 pt-1">
          {Array.isArray(currentQ.options) && currentQ.options.map((opt, oI) => {
            const isSelected = selectedIdx === oI;
            const isCorrect = oI === (currentQ.correct_index ?? 0);
            const cleanOpt = devView ? opt : sanitizeStudentText(opt);

            let btnStyle = "bg-stone-950 border-stone-800 text-stone-200 hover:border-stone-700";
            if (submitted) {
              if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200";
              else if (isSelected) btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
            } else if (isSelected) {
              btnStyle = "bg-amber-500/20 border-amber-500 text-amber-200";
            }

            return (
              <button
                key={oI}
                onClick={() => {
                  if (!submitted) setSelectedIdx(oI);
                }}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{cleanOpt}</span>
                {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <button
            onClick={() => {
              if (selectedIdx !== null) setSubmitted(true);
            }}
            disabled={selectedIdx === null}
            className="w-full h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl transition-all mt-2"
          >
            Hantar Jawapan
          </button>
        )}

        {submitted && (
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs space-y-1">
            <span className="font-bold text-amber-400 block">💡 Penerangan Jawapan:</span>
            <p className="text-stone-300">{devView ? currentQ.explanation : sanitizeStudentText(currentQ.explanation)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RewardScene Component (Step 9: Rewards)
 */
function RewardScene({ data, lessonPackage, onReviewSubtopic, devView = false }) {
  const payload = data?.payload || {};
  const metadata = lessonPackage?.admin_metadata || {};
  const spCode = metadata.sp_code || "SP Utama";
  const topicTitle = metadata.topic || lessonPackage?.subject || "Tajuk Pembelajaran";

  return (
    <div className="p-6 bg-gradient-to-b from-amber-950/60 to-stone-950 border-2 border-amber-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl animate-bounce">
        {payload.item_icon || "👑"}
      </div>
      <div>
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
          TAHNIAH! MISI SELESAI
        </span>
        <h3 className="text-xl font-black text-amber-100">
          {devView ? (payload.badge || "Wira KSSR Pembelajaran") : sanitizeStudentText(payload.badge || "Wira Pembelajaran")}
        </h3>
        <p className="text-xs text-stone-300 mt-1">
          Item Drop: {devView ? payload.item_drop : sanitizeStudentText(payload.item_drop || "Pingat Kembara Kecemerlangan")}
        </p>
      </div>

      {/* PETA KEPUTUSAN PENGEMBARAAN & SUKU REMEDIATION SHIELD */}
      <div className="p-4 bg-stone-900/90 rounded-2xl border border-amber-500/30 text-left space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
            🗺️ Peta Keputusan Pengembaraan
          </span>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            🌟 Dikuasai / Mastered (100%)
          </span>
        </div>

        <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-200">Subtopik SP {spCode}: {topicTitle}</span>
            <span className="font-black text-emerald-400">LULUS ✓</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Kemahiran bagi {topicTitle} telah dikuasai dengan cemerlang mengikut piawaian PBD.
          </p>
        </div>

        {onReviewSubtopic && (
          <button
            onClick={onReviewSubtopic}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition-all flex items-center justify-center gap-1.5"
          >
            🔁 Ulangkaji Subtopik (Semak Infografik)
          </button>
        )}
      </div>

      <div className="flex justify-center gap-4 bg-stone-900 p-3 rounded-2xl border border-stone-800 text-xs font-black">
        <span className="text-amber-400 flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400" /> +{payload.xp_earned || 100} XP
        </span>
        <span className="text-yellow-400">🪙 +{payload.coins_earned || 25} Syiling</span>
      </div>
    </div>
  );
}

/**
 * Universal Lesson Preview Component
 * Mobile-first Student Experience Simulator for Admin Content Studio
 */
export default function UniversalLessonPreview({ lessonPackage, previewMode = true }) {
  const [deviceFrame, setDeviceFrame] = useState("mobile"); // "mobile" | "tablet"
  const [devView, setDevView] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);

  const stepsList = useMemo(() => {
    if (!lessonPackage) return [];
    if (Array.isArray(lessonPackage.steps) && lessonPackage.steps.length > 0) return lessonPackage.steps;
    if (Array.isArray(lessonPackage.mission_journey) && lessonPackage.mission_journey.length > 0) return lessonPackage.mission_journey;
    return [];
  }, [lessonPackage]);

  const isV2 = Boolean(
    lessonPackage?.version === "2.0" || 
    lessonPackage?.lesson?.version === "2.0" ||
    lessonPackage?.lesson?.blocks ||
    lessonPackage?.blocks
  );

  if (!lessonPackage || (!isV2 && stepsList.length === 0)) {
    return (
      <div className="p-8 text-center bg-stone-950 border border-stone-800 rounded-3xl space-y-3">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
        <h4 className="text-sm font-black text-white">Tiada Kandungan Untuk Dipratonton</h4>
        <p className="text-xs text-stone-400">Sila jana Pakej Misi AI terlebih dahulu.</p>
      </div>
    );
  }

  const currentScene = stepsList[sceneIndex] || stepsList[0];
  const stepType = (currentScene?.step_type || currentScene?.stage || "BRIEFING").toUpperCase();

  const handleNext = () => {
    if (sceneIndex < stepsList.length - 1) {
      setSceneIndex(prev => prev + 1);
    } else {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (sceneIndex > 0) {
      setSceneIndex(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-left font-sans">
      {/* SIMULATOR TOOLBAR */}
      <div className="p-3 bg-stone-900 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-amber-400 flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> Pratinjau Simulator Pelajar
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
            {lessonPackage.subject || lessonPackage.lesson?.metadata?.subject || lessonPackage.admin_metadata?.subject || "Matematik"} ({lessonPackage.grade || lessonPackage.lesson?.metadata?.grade || lessonPackage.admin_metadata?.year || "Tahun 1"})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div className="flex bg-stone-950 border border-stone-800 rounded-xl p-1">
            <button
              onClick={() => setDeviceFrame("mobile")}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                deviceFrame === "mobile" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
            <button
              onClick={() => setDeviceFrame("tablet")}
              className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                deviceFrame === "tablet" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
          </div>

          {/* Dev View Toggle */}
          <button
            onClick={() => setDevView(!devView)}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-all ${
              devView ? "bg-indigo-600 text-white border-indigo-400" : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> {devView ? "Mod Pembangun" : "Mod Pelajar"}
          </button>

          {/* Restart */}
          <button
            onClick={() => setSceneIndex(0)}
            className="p-1.5 bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 rounded-xl transition-all"
            title="Mula Semula"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DEVELOPER DEBUG PANEL (ADMIN METADATA INSPECTOR) */}
      {devView && (
        <div className="p-3 bg-stone-950 border border-indigo-500/40 rounded-2xl text-[11px] font-mono text-indigo-300 space-y-2">
          <div className="flex justify-between border-b border-indigo-900/50 pb-1">
            <span>SCENE TYPE: <strong>{stepType}</strong></span>
            <span>WIDGET: <strong>{currentScene?.payload?.widget_type || "default"}</strong></span>
            <span>SCENE INDEX: <strong>{sceneIndex + 1}/{stepsList.length}</strong></span>
          </div>
          {lessonPackage.admin_metadata && (
            <div className="text-[10px] space-y-0.5 text-stone-400 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
              <span className="font-bold text-amber-400 block mb-1">🏷️ Admin Metadata (Teacher/Admin Layer Only):</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                <span>Subjek: {lessonPackage.admin_metadata.subject}</span>
                <span>Tahun: {lessonPackage.admin_metadata.year} ({lessonPackage.admin_metadata.grade})</span>
                <span>Kod SK: {lessonPackage.admin_metadata.sk_code}</span>
                <span>Kod SP: {lessonPackage.admin_metadata.sp_code}</span>
                <span>Pedagogi: {lessonPackage.admin_metadata.pedagogy_block}</span>
                <span>PBD Target: {lessonPackage.admin_metadata.target_tp}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SIMULATED DEVICE FRAME CONTAINER */}
      <div className="flex justify-center">
        {(lessonPackage.version === "2.0" || lessonPackage.lesson?.version === "2.0") ? (
          <div className={`w-full transition-all duration-300 bg-stone-950 border-4 border-stone-800 rounded-[36px] shadow-2xl overflow-hidden overflow-y-auto relative ${
            deviceFrame === "mobile" ? "max-w-[400px] h-[720px]" : "max-w-[720px] h-[640px]"
          }`}>
            <LessonShellRenderer 
              lesson={lessonPackage.lesson || lessonPackage} 
              studentName="Murid Contoh" 
              onLessonComplete={() => {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              }}
            />
          </div>
        ) : (
          <div className={`w-full transition-all duration-300 bg-stone-950 border-4 border-stone-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col ${
            deviceFrame === "mobile" ? "max-w-[400px] min-h-[640px]" : "max-w-[720px] min-h-[580px]"
          }`}>
            {/* SIMULATED TOP BAR */}
          <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌎</span>
              <span className="text-xs font-black text-white truncate max-w-[140px]">
                {lessonPackage.student_ui?.world_title || lessonPackage.world?.world_name || `Dunia ${lessonPackage.subject || "StudyQuest"}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500" /> 5
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> +100 XP
              </span>
            </div>
          </div>

          {/* SIMULATED SCENE PROGRESS BAR */}
          <div className="w-full bg-stone-900 h-1.5">
            <div
              className="bg-amber-400 h-1.5 transition-all duration-300"
              style={{ width: `${((sceneIndex + 1) / stepsList.length) * 100}%` }}
            />
          </div>

          {/* MAIN SCENE CONTENT AREA */}
          <div className="p-5 flex-1 overflow-y-auto bg-stone-950">
            {stepType === "BRIEFING" && <StoryScene data={currentScene} devView={devView} />}
            {(stepType === "ENGAGEMENT" || stepType === "LESSON") && <TeachingScene data={currentScene} devView={devView} />}
            {stepType === "PRACTICE" && <ActivityScene data={currentScene} devView={devView} />}
            {stepType === "FLASHCARDS" && (
              <Flashcards cards={currentScene.cards || [{ term: "Terma Pembelajaran", definition: "Definisi asas" }]} />
            )}
            {stepType === "QUIZ" && <QuizScene data={currentScene} devView={devView} />}
            {stepType === "REWARD" && (
              <RewardScene
                data={currentScene}
                lessonPackage={lessonPackage}
                onReviewSubtopic={() => setSceneIndex(1)}
                devView={devView}
              />
            )}

            {/* Fallback for other step types */}
            {!["BRIEFING", "ENGAGEMENT", "LESSON", "PRACTICE", "FLASHCARDS", "QUIZ", "REWARD"].includes(stepType) && (
              <BlockRenderer block={currentScene} studentName="Pelajar Cemerlang" />
            )}
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="p-4 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrev}
              disabled={sceneIndex === 0}
              className="h-10 px-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>

            <span className="text-[11px] font-bold text-stone-400">
              {sceneIndex + 1} / {stepsList.length}
            </span>

            <button
              onClick={handleNext}
              className="h-10 px-6 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-lg border-b-2 border-amber-600 flex items-center gap-1.5 transition-all"
            >
              <span>{sceneIndex < stepsList.length - 1 ? "Teruskan ➡️" : "Selesai 🎉"}</span>
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
