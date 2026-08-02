// src/pages/LessonPage.jsx
// Student Lesson Viewer — Controller for Gamified Adventure & Classic Modes
// Phase 1-4 Upgrades: Progress journey bar (🐢 Misi X/Y · Z%), DSKP phase badges, Suku Mascot encouragement bubbles 🐢, sequential block unlocking ("Teruskan Misi ➡️"), and Mission Completion Celebration.

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getActiveStudentId } from "@/lib/rewardSystem";
import { processReward } from "@/lib/rewardEngine";
import { personalize, resolveStudentName } from "@/lib/personalize";
import { useAuth } from "@/lib/AuthContext";
import {
  Leaf,
  Loader2,
  Trophy,
  Compass,
  ChevronLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Award,
  ArrowRight,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

import ClassicLessonView from "@/components/lesson/ClassicLessonView";
import { LessonAdventure } from "@/components/adventure/LessonAdventure";
import { bersihkanTeksUntukSuara } from "@/components/lesson/BlockRenderer";

// WORLD THEMES
const WORLD_THEMES = {
  default: {
    name: "Hutan Ilmu",
    mascotName: "Suku Penyu",
    emoji: "🐢",
    bgGradient: "bg-gradient-to-b from-emerald-950 via-green-950 to-stone-950",
    cardBg: "bg-stone-900/90 border-emerald-500/40 text-emerald-100",
    accentColor: "bg-emerald-500 hover:bg-emerald-400 text-stone-950",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  }
};

export default function LessonPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("map");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Learning Mode State: "adventure" | "classic"
  const [learningMode, setLearningMode] = useState(() => {
    return localStorage.getItem("studyquest_learning_mode") || "adventure";
  });

  const storageKey = useMemo(() => `studyquest_completed_blocks_${topicId || subjectId || 'default'}`, [topicId, subjectId]);

  const [completedBlockIds, setCompletedBlockIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [progressState, setProgressState] = useState({
    video_completed: false,
    lesson_completed: false,
    flashcard_completed: false,
    mindmap_completed: false,
    games_completed: false,
    quiz_completed: false,
    xp_earned: 0
  });

  const sessionStartRef = useRef(Date.now());
  const sessionIdRef = useRef(null);

  const handleModeChange = (mode) => {
    setLearningMode(mode);
    localStorage.setItem("studyquest_learning_mode", mode);
  };

  // Fetch unified Learning Package
  useEffect(() => {
    let isMounted = true;
    const loadPackage = async () => {
      try {
        setLoading(true);
        const res = await base44.functions.invoke("getLearningPackage", {
          topic_id: topicId,
          subject_id: subjectId
        });

        if (res.data?.success && isMounted) {
          setPackageData(res.data);
        }
      } catch (err) {
        console.error("Gagal memuatkan pakej pelajaran:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPackage();
    return () => { isMounted = false; };
  }, [subjectId, topicId]);

  // Extract ordered blocks & assessments
  const sortedBlocks = useMemo(() => {
    const rawBlocks = packageData?.content_blocks || [];
    return [...rawBlocks].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
  }, [packageData]);

  const assessments = packageData?.assessments || [];
  const primaryAssessment = assessments[0] || null;

  // Resolve student context
  const { user: currentUser } = useAuth();
  const studentData = useMemo(() => {
    let cachedChild = null;
    try {
      const cachedStr = localStorage.getItem("active_child");
      if (cachedStr) cachedChild = JSON.parse(cachedStr);
    } catch {}
    return cachedChild || packageData?.student_context || currentUser;
  }, [packageData, currentUser]);

  const studentName = useMemo(() => {
    return resolveStudentName(studentData, currentUser);
  }, [studentData, currentUser]);

  // Lesson Progress Metrics
  const totalBlocks = sortedBlocks.length || 1;
  const completedCount = completedBlockIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalBlocks) * 100));

  // Current Active Block & Pedagogical Phase
  const activeBlock = sortedBlocks[Math.min(completedCount, totalBlocks - 1)] || null;
  const activePhaseLabel = useMemo(() => {
    if (!activeBlock) return "🎯 Set Induksi";
    const p = (activeBlock.pedagogical_phase || "").toUpperCase();
    const t = (activeBlock.block_type || "").toUpperCase();
    if (p === "INDUCTION" || t === "INDUCTION") return "🎯 Set Induksi";
    if (p === "CONCEPT" || t === "CONCEPT" || t === "TEXT_MARKDOWN") return "📚 Kenali Konsep";
    if (p === "WORKED_EXAMPLE" || t === "WORKED_EXAMPLE") return "✏️ Contoh Terbimbing";
    if (p === "PBD_ASSESSMENT" || t === "PBD_ASSESSMENT" || t === "QUIZ") return "📝 Pentaksiran PBD";
    if (p === "REFLECTION" || t === "REFLECTION") return "🌱 Refleksi";
    return "🎒 Modul Pembelajaran";
  }, [activeBlock]);

  // Trigger celebration when 100% completed
  useEffect(() => {
    if (completedCount >= totalBlocks && totalBlocks > 0 && !showCelebration) {
      setShowCelebration(true);
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
    }
  }, [completedCount, totalBlocks, showCelebration]);

  const getElapsedMinutes = useCallback(() => {
    return Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
  }, []);

  const triggerConfetti = () => confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

  const handleAdventureBlockComplete = async (blockId, blockType) => {
    if (!blockId) return;

    if (completedBlockIds.includes(blockId)) return;

    const nextCompleted = Array.from(new Set([...completedBlockIds, blockId]));
    setCompletedBlockIds(nextCompleted);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
    } catch {}

    setProgressState((prev) => ({
      ...prev,
      xp_earned: prev.xp_earned + 25
    }));

    const studentId = await getActiveStudentId();
    if (studentId) {
      await processReward(studentId, {
        activityType: "lesson_complete",
        referenceId: `${topicId}_${blockId}`,
        referenceName: `${packageData?.lesson?.title || "Misi"} - Block ${blockId}`,
        subjectName: packageData?.curriculum_context?.subject_name,
        reason: "Misi Kembara Selesai"
      }).catch(() => {});
    }

    triggerConfetti();
  };

  const handleSpeech = (text) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = bersihkanTeksUntukSuara(personalize(text, studentName, currentUser));
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ms-MY";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950 text-white">
        <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
        <p className="mt-4 font-black text-lime-200 text-sm">Membuka Pakej Pembelajaran DSKP...</p>
      </div>
    );
  }

  const worldTheme = WORLD_THEMES.default;

  return (
    <div className={`min-h-screen ${worldTheme.bgGradient} font-sans text-stone-100 pb-24 px-4 py-6 text-left`}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* TOP HUD BAR */}
        <div className="bg-stone-900/90 border-2 border-stone-700/80 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/study/${subjectId}`)}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-2xl transition-all border border-stone-600 active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${worldTheme.badgeBg}`}>
                {packageData?.curriculum_context?.subject_name || "Subjek DSKP"}
              </span>
              <h1 className="text-sm sm:text-base font-black text-white mt-1 flex items-center gap-1.5 truncate">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" /> {packageData?.lesson?.title || "Misi Pembelajaran DSKP"}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="bg-stone-950 p-1 rounded-2xl border border-stone-800 flex items-center gap-1">
              <button
                onClick={() => handleModeChange("adventure")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  learningMode === "adventure"
                    ? "bg-amber-500 text-stone-950 shadow-md"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mod Kembara
              </button>
              <button
                onClick={() => handleModeChange("classic")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  learningMode === "classic"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Mod Klasik
              </button>
            </div>

            <div className="bg-gradient-to-r from-amber-400 to-lime-400 px-3 py-1.5 rounded-2xl text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 shrink-0">
              <Leaf className="w-4 h-4 fill-stone-950" /> {progressState.xp_earned + 50} XP
            </div>
          </div>
        </div>

        {/* PHASE 1: LESSON PROGRESS JOURNEY BAR & SUKU MOTIVATION BUBBLE */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-amber-300 flex items-center gap-1.5">
              <span>🐢</span> Misi {completedCount}/{totalBlocks} Selesai
            </span>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[10px]">
              Fasa: {activePhaseLabel}
            </span>
            <span className="text-emerald-400">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-lime-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* SUKU MASCOT MOTIVATION SPEECH BUBBLE */}
          <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
              🐢
            </div>
            <p className="text-xs font-bold text-stone-200">
              "Hebat {studentName}! {progressPercent >= 100 ? "Kamu berjaya menamatkan misi ini!" : "Mari teruskan kembara membantu Suku!"}"
            </p>
          </div>
        </div>

        {/* MAIN MODE VIEW CONTENT */}
        {learningMode === "adventure" ? (
          <LessonAdventure
            packageData={packageData}
            contentBlocks={sortedBlocks}
            completedBlockIds={completedBlockIds}
            quizCompleted={progressState.quiz_completed}
            quizScore={progressState.quiz_completed ? 100 : 0}
            onCompleteBlock={handleAdventureBlockComplete}
            studentName={studentName}
            quizComponent={
              <div className="bg-gradient-to-br from-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl text-center space-y-4">
                <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-amber-200">⚔️ Ujian Pentaksiran Bilik Darjah (PBD)</h3>
                <p className="text-xs text-stone-300 font-bold">Jawab soalan penilaian untuk melengkapkan modul DSKP ini!</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                  <Button
                    onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&version=${packageData?.published_version?.id || ''}&limit=10&mode=practice`)}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-amber-600"
                  >
                    ⚡ Latihan PBD (10 Soalan)
                  </Button>
                  <Button
                    onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&version=${packageData?.published_version?.id || ''}&limit=20&mode=mastery`)}
                    className="bg-orange-500 hover:bg-orange-400 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-orange-700"
                  >
                    ⚔️ Ujian Mahir (20 Soalan)
                  </Button>
                </div>
              </div>
            }
          />
        ) : (
          <ClassicLessonView
            sortedBlocks={sortedBlocks}
            primaryAssessment={primaryAssessment}
            topicId={topicId}
            studentName={studentName}
            completedBlockIds={completedBlockIds}
            onBlockComplete={handleAdventureBlockComplete}
            progressState={progressState}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleSpeech={handleSpeech}
            isSpeaking={isSpeaking}
            navigate={navigate}
          />
        )}

        {/* PHASE 3: LESSON COMPLETION CELEBRATION MODAL */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 rounded-full flex items-center justify-center text-4xl mx-auto">
                🎉
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-300">🎉 Misi DSKP Tamat!</h2>
                <p className="text-xs text-stone-300 font-bold mt-1">
                  Tahniah {studentName}! Kamu berjaya melengkapkan keseluruhan modul pembelajaran ini.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center gap-2 text-amber-300 font-black text-sm">
                  <Leaf className="w-4 h-4 fill-amber-400" /> +50 XP
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center gap-2 text-cyan-300 font-black text-sm">
                  <Coins className="w-4 h-4 text-cyan-400" /> +10 Syiling
                </div>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-left flex items-start gap-3">
                <span className="text-3xl">🐢</span>
                <p className="text-xs font-bold text-stone-200">
                  "Kamu sangat hebat! Terima kasih kerana membantu Suku memahami tajuk ini dengan baik!"
                </p>
              </div>

              <Button
                onClick={() => navigate(`/study/${subjectId}`)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
              >
                Kembali Ke Peta Pembelajaran 🗺️
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
