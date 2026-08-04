// src/pages/LessonPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getActiveStudentId } from "@/lib/rewardSystem";
import { processReward } from "@/lib/rewardEngine";
import { personalize, resolveStudentName } from "@/lib/personalize";
import { useAuth } from "@/lib/AuthContext";
import {
  Leaf,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Coins,
  Volume2,
  Star,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import BlockRenderer, { bersihkanTeksUntukSuara } from "@/components/lesson/BlockRenderer";
import LessonShellRenderer from "@/components/lesson/LessonShellRenderer";
import { getSampleKSSRLesson } from "@/services/generateKSSRContent";
import AITutorPanel from "@/components/tutor/AITutorPanel";
import { initializeTutorContext } from "@/services/aiTutorService";
import { logTutorInteraction } from "@/services/database/tutorRepository";

// WORLD THEMES
const WORLD_THEMES = {
  default: {
    name: "Hutan Ilmu",
    mascotName: "Suku Penyu",
    emoji: "🐢",
    bgGradient: "bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950",
    cardBg: "bg-slate-900/90 border-blue-500/40 text-blue-100",
    accentColor: "bg-blue-500 hover:bg-blue-400 text-slate-950",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  }
};

export default function LessonPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreviewMode = searchParams.get("preview") === "true";
  const previewVersionId = searchParams.get("lesson_version_id") || searchParams.get("versionId");
  const devSample = searchParams.get("devSample");

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New Mission Studio State
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [floatingXp, setFloatingXp] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // AI Tutor State
  const [tutorContext, setTutorContext] = useState(null);
  const [tutorVisible, setTutorVisible] = useState(false);
  const [currentMistakeType, setCurrentMistakeType] = useState(null);

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
    xp_earned: 0
  });

  // Fetch unified Learning Package
  useEffect(() => {
    let isMounted = true;
    const loadPackage = async () => {
      try {
        setLoading(true);

        if (devSample) {
          const sampleData = getSampleKSSRLesson(devSample);
          if (isMounted) setPackageData(sampleData);
          return;
        }

        const res = await base44.functions.invoke("getLearningPackage", {
          topic_id: topicId,
          subject_id: subjectId,
          preview: isPreviewMode,
          lesson_version_id: previewVersionId
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
  }, [subjectId, topicId, devSample, isPreviewMode, previewVersionId]);

  // Extract ordered blocks
  const sortedBlocks = useMemo(() => {
    const rawBlocks = packageData?.content_blocks || [];
    return [...rawBlocks].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
  }, [packageData]);

  const totalBlocks = sortedBlocks.length || 1;
  const currentBlock = sortedBlocks[currentBlockIndex] || null;
  const isCurrentBlockCompleted = currentBlock && completedBlockIds.includes(currentBlock.id);

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
    return resolveStudentName(studentData, currentUser) || "Pengembara";
  }, [studentData, currentUser]);

  const triggerConfetti = () => confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

  const handleBlockComplete = async (blockId, blockType) => {
    if (!blockId || completedBlockIds.includes(blockId)) return;

    const nextCompleted = Array.from(new Set([...completedBlockIds, blockId]));
    setCompletedBlockIds(nextCompleted);
    
    if (!isPreviewMode) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
      } catch {}

      setProgressState((prev) => ({
        ...prev,
        xp_earned: prev.xp_earned + 50
      }));

      const studentId = await getActiveStudentId();
      if (studentId) {
        await processReward(studentId, {
          activityType: "lesson_complete",
          referenceId: `${topicId}_${blockId}`,
          referenceName: `Mission Block ${blockId}`,
          subjectName: packageData?.curriculum_context?.subject_name || "DSKP",
          reason: "Misi Kembara Selesai"
        }).catch(() => {});
      }
    }

    setFloatingXp(true);
    setTimeout(() => setFloatingXp(false), 2000);
    triggerConfetti();
  };

  const handleMistake = async (mistakeType) => {
    setCurrentMistakeType(mistakeType);
    setTutorVisible(true);
    
    if (!tutorContext) {
      const studentId = await getActiveStudentId();
      const spCode = currentBlock?.sp_code || "SP_MOCK";
      const ctx = await initializeTutorContext(studentId, spCode);
      setTutorContext(ctx);
    }

    try {
      const studentId = await getActiveStudentId();
      if (studentId) {
        await logTutorInteraction({
          studentId,
          spCode: currentBlock?.sp_code || "SP_MOCK",
          questionId: currentBlock?.id,
          mistakeType,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to log tutor interaction", err);
    }
  };

  const handleNextCard = () => {
    if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      // Trigger Victory Modal on last block
      setShowCelebration(true);
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
    }
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

  const renderStars = () => {
    // Determine milestone thresholds (3 stars)
    const progress = (currentBlockIndex) / totalBlocks;
    const stars = [false, false, false];
    if (progress >= 0.33 || currentBlockIndex > 0) stars[0] = true;
    if (progress >= 0.66) stars[1] = true;
    if (currentBlockIndex === totalBlocks - 1 && isCurrentBlockCompleted) {
      stars[2] = true;
    }
    return (
      <div className="flex gap-1.5">
        {stars.map((filled, i) => (
          <Star 
            key={i} 
            className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-500 ${filled ? "fill-amber-400 text-amber-500" : "fill-stone-800 text-stone-700"}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-14 h-14 text-blue-400 animate-spin" />
        <p className="mt-6 font-black text-blue-200 text-lg">Membuka Studio Misi...</p>
      </div>
    );
  }

  const worldTheme = WORLD_THEMES.default;

  // ===============================================
  // V2.0 LESSON SHELL — New Deterministic Renderer
  // If packageData has version "2.0", use the new pipeline.
  // Otherwise, fall through to the legacy BlockRenderer below.
  // ===============================================
  const isV2Lesson = packageData?.version === "2.0" || packageData?.lesson?.version === "2.0";
  const v2LessonData = packageData?.lesson || packageData;

  if (isV2Lesson && v2LessonData?.blocks) {
    return (
      <div className={`min-h-screen ${worldTheme.bgGradient} font-sans text-stone-100`}>
        {isPreviewMode && (
          <div className="bg-amber-500 text-stone-950 px-4 py-3 font-black text-sm flex items-center justify-center shadow-lg w-full">
            <span>👁 <strong>MOD PRATONTON ADMIN:</strong> Pelajaran v2.0 belum diterbitkan. Simpanan & XP dinyahaktifkan.</span>
          </div>
        )}
        <LessonShellRenderer
          lesson={v2LessonData}
          studentName={studentName}
          onLessonComplete={async (result) => {
            if (!isPreviewMode) {
              const studentId = await getActiveStudentId();
              if (studentId) {
                await processReward(studentId, {
                  activityType: "lesson_complete",
                  referenceId: `${topicId}_v2_${v2LessonData.lesson_id}`,
                  referenceName: `Misi ${v2LessonData.metadata?.topic || "KSSR"}`,
                  subjectName: v2LessonData.metadata?.subject || "DSKP",
                  reason: "Misi Kembara v2.0 Selesai"
                }).catch(() => {});
              }
            }
            setShowCelebration(true);
            confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
          }}
          onNavigateBack={() => navigate(`/study/${subjectId || ''}`)}
          onMistake={handleMistake}
        />
        <AITutorPanel
          context={tutorContext}
          mistakeType={currentMistakeType}
          isVisible={tutorVisible}
          onClose={() => setTutorVisible(false)}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${worldTheme.bgGradient} font-sans text-stone-100 pb-8 px-2 sm:px-4 flex flex-col`}>
      
      {isPreviewMode && (
        <div className="bg-amber-500 text-stone-950 px-4 py-3 font-black text-sm flex items-center justify-center shadow-lg w-full">
          <span>👁 <strong>MOD PRATONTON ADMIN:</strong> Pelajaran belum diterbitkan. Simpanan & XP dinyahaktifkan.</span>
        </div>
      )}

      {/* GAMIFIED HUD */}
      <div className="max-w-3xl w-full mx-auto mt-6 bg-stone-900/90 border-4 border-stone-800 rounded-[2rem] p-4 sm:p-6 shadow-2xl flex items-center justify-between backdrop-blur-xl relative z-10">
        <button
          onClick={() => navigate(`/study/${subjectId || ''}`)}
          className="bg-stone-800 hover:bg-red-500 hover:text-white text-stone-300 font-black px-4 py-3 rounded-2xl flex items-center gap-2 transition-all min-h-[48px]"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden sm:inline text-lg">Keluar</span>
        </button>

        <div className="flex-1 flex justify-center">
          {renderStars()}
        </div>

        <div className="relative">
          <div className="bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-3 rounded-2xl text-amber-950 font-black text-lg shadow-xl shadow-amber-500/20 border-b-4 border-amber-600 flex items-center gap-2 min-h-[48px]">
            <Leaf className="w-6 h-6 fill-amber-950" /> {progressState.xp_earned} XP
          </div>
          <AnimatePresence>
            {floatingXp && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0, y: -60 }}
                className="absolute top-0 right-0 font-black text-amber-300 text-2xl drop-shadow-md z-50 pointer-events-none"
              >
                +50
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* GLOBAL AUDIO BUTTON */}
      <div className="max-w-3xl w-full mx-auto mt-6 flex justify-end px-2">
        <button
          onClick={() => handleSpeech(currentBlock?.payload?.text || currentBlock?.title || "Sila selesaikan cabaran ini.")}
          className={`flex items-center gap-3 px-6 py-3 rounded-[2rem] font-black text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all min-h-[48px] ${
            isSpeaking 
              ? "bg-blue-500 border-blue-700 text-white shadow-blue-500/50" 
              : "bg-stone-800 border-stone-900 text-blue-300 hover:bg-stone-700 hover:text-white"
          }`}
        >
          <Volume2 className={`w-7 h-7 ${isSpeaking ? "animate-pulse" : ""}`} />
          {isSpeaking ? "Membaca..." : "Baca Teks"}
        </button>
      </div>

      {/* CARD CONTENT RENDERER */}
      <div className="max-w-3xl w-full mx-auto mt-6 flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {currentBlock && (
            <motion.div
              key={currentBlock.id || currentBlockIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white text-stone-900 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-b-8 border-stone-200 flex-1 flex flex-col"
            >
              <div className="flex-1">
                <BlockRenderer
                  block={currentBlock}
                  studentName={studentName}
                  isSpeaking={isSpeaking}
                  onSpeak={handleSpeech}
                  isCompleted={isCurrentBlockCompleted}
                  onComplete={() => handleBlockComplete(currentBlock.id, currentBlock.block_type)}
                  onMistake={handleMistake}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AITutorPanel 
          context={tutorContext}
          mistakeType={currentMistakeType}
          isVisible={tutorVisible}
          onClose={() => setTutorVisible(false)}
        />
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="max-w-3xl w-full mx-auto mt-8 flex justify-center">
        <button
          onClick={handleNextCard}
          disabled={!isCurrentBlockCompleted && currentBlock?.block_type !== 'TEXT_MARKDOWN'}
          className={`w-full max-w-sm py-5 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 transition-all min-h-[64px] border-b-8 active:border-b-0 active:translate-y-2 ${
            isCurrentBlockCompleted || currentBlock?.block_type === 'TEXT_MARKDOWN'
              ? "bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 border-emerald-700 text-stone-950 shadow-xl shadow-emerald-500/30"
              : "bg-stone-800 text-stone-500 border-stone-900 opacity-50 cursor-not-allowed"
          }`}
        >
          {currentBlockIndex < totalBlocks - 1 ? (
            <>Seterusnya ➡️</>
          ) : (
            <>Selesaikan Misi <Trophy className="w-8 h-8 fill-stone-950" /></>
          )}
        </button>
      </div>

      {/* VICTORY CELEBRATION MODAL */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="bg-white border-8 border-amber-400 rounded-[3rem] p-8 sm:p-12 max-w-lg w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-10 left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-center gap-2">
                  <Star className="w-16 h-16 fill-amber-400 text-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <Star className="w-20 h-20 fill-amber-400 text-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <Star className="w-16 h-16 fill-amber-400 text-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>

                <div>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-sm leading-tight">
                    Tahniah<br/>{studentName}!
                  </h2>
                  <p className="text-xl text-slate-600 font-bold mt-4">
                    Misi diselesaikan dengan cemerlang!
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 bg-slate-100 rounded-3xl p-6 border-4 border-slate-200">
                  <div className="flex items-center gap-2 text-amber-500 font-black text-2xl">
                    <Leaf className="w-10 h-10 fill-amber-500" /> +{progressState.xp_earned} XP
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/study/${subjectId || ''}`)}
                  className="w-full h-20 bg-blue-500 hover:bg-blue-400 text-white font-black text-2xl rounded-[2rem] border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 transition-all shadow-xl"
                >
                  Kembali Ke Peta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
