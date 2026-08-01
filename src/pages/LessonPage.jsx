// src/pages/LessonPage.jsx
// Student Lesson Viewer — Controller for Adventure & Classic Modes

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
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

import ClassicLessonView from "@/components/lesson/ClassicLessonView";
import { LessonAdventure } from "@/components/adventure/LessonAdventure";
import { bersihkanTeksUntukSuara } from "@/components/lesson/BlockRenderer";

// ==========================================
// SUBJECT WORLD THEMES
// ==========================================
const WORLD_THEMES = {
  science: {
    name: "Discovery Jungle",
    mascotName: "Bimo Orangutan",
    emoji: "🦧",
    bgGradient: "bg-gradient-to-b from-emerald-950 via-green-950 to-stone-950",
    cardBg: "bg-stone-900/90 border-emerald-500/40 text-emerald-100",
    accentColor: "bg-emerald-500 hover:bg-emerald-400 text-stone-950",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  math: {
    name: "Number Island",
    mascotName: "Suku Penyu",
    emoji: "🐢",
    bgGradient: "bg-gradient-to-b from-blue-950 via-indigo-950 to-stone-950",
    cardBg: "bg-stone-900/90 border-blue-500/40 text-blue-100",
    accentColor: "bg-blue-500 hover:bg-blue-400 text-stone-950",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },
  default: {
    name: "Hutan Ilmu",
    mascotName: "Otan",
    emoji: "🦧",
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

  // Learning Mode State: "adventure" | "classic"
  const [learningMode, setLearningMode] = useState(() => {
    return localStorage.getItem("studyquest_learning_mode") || "adventure";
  });

  const [completedBlockIds, setCompletedBlockIds] = useState([]);

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

  // 1. Fetch unified Learning Package via single API endpoint
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
          console.log("[STUDYQUEST DATA FLOW AUDIT]", {
            step: "1_getLearningPackage_response",
            packageData: res.data,
            student_context: res.data?.student_context,
            content_blocks: res.data?.content_blocks,
            video_url: res.data?.video_url,
            assessments: res.data?.assessments,
            activities: res.data?.activities || res.data?.activity
          });
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

  // Resolve active student context & user info
  const { user: currentUser } = useAuth();
  const [activeStudentData, setActiveStudentData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchActiveStudent = async () => {
      let childObj = null;
      try {
        const cachedStr = localStorage.getItem("active_child");
        if (cachedStr) childObj = JSON.parse(cachedStr);
      } catch {}

      const studentId = await getActiveStudentId(currentUser);
      if (childObj && (childObj.id === studentId || childObj._id === studentId)) {
        if (isMounted) setActiveStudentData(childObj);
      } else if (studentId && studentId !== currentUser?.id) {
        try {
          const u = await base44.entities.User.get(studentId);
          if (u && isMounted) setActiveStudentData(u);
        } catch {
          if (isMounted) setActiveStudentData(childObj || currentUser);
        }
      } else if (childObj) {
        if (isMounted) setActiveStudentData(childObj);
      } else {
        if (isMounted) setActiveStudentData(currentUser);
      }
    };

    fetchActiveStudent();
    return () => { isMounted = false; };
  }, [currentUser]);

  const studentData = useMemo(() => {
    let cachedChild = null;
    try {
      const cachedStr = localStorage.getItem("active_child");
      if (cachedStr) cachedChild = JSON.parse(cachedStr);
    } catch {}
    return activeStudentData || cachedChild || packageData?.student_context || currentUser;
  }, [activeStudentData, packageData, currentUser]);

  const studentNickname = useMemo(() => {
    return studentData?.nickname || studentData?.display_name || null;
  }, [studentData]);

  const personalizedName = useMemo(() => {
    return resolveStudentName(studentData, currentUser);
  }, [studentData, currentUser]);

  // Audit console log as requested
  useEffect(() => {
    console.log({
      studentData,
      studentNickname,
      currentUser,
      personalizedName
    });
  }, [studentData, studentNickname, currentUser, personalizedName]);

  const studentName = personalizedName;

  // Session duration calculator
  const getElapsedMinutes = useCallback(() => {
    return Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
  }, []);

  // Update StudySession duration every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const sId = sessionIdRef.current;
      if (!sId) return;
      try {
        await base44.entities.StudySession.update(sId, { duration_minutes: getElapsedMinutes() });
      } catch (err) {}
    }, 60000);
    return () => clearInterval(interval);
  }, [getElapsedMinutes]);

  const triggerConfetti = () => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

  const handleStageComplete = async (stageKey, xpAmount) => {
    if (progressState[`${stageKey}_completed`]) {
      setActiveTab("map");
      return;
    }

    const studentId = await getActiveStudentId();
    setProgressState(prev => ({
      ...prev,
      [`${stageKey}_completed`]: true,
      xp_earned: prev.xp_earned + xpAmount
    }));

    if (studentId) {
      await processReward(studentId, {
        activityType: "lesson_complete",
        referenceId: `${topicId}_${stageKey}`,
        referenceName: `${packageData?.lesson?.title || "Misi"} - ${stageKey}`,
        subjectName: packageData?.curriculum_context?.subject_name,
        reason: `Selesai ${stageKey.toUpperCase()}`
      }).catch(() => {});
    }

    triggerConfetti();
    setActiveTab("map");
  };

  const handleAdventureBlockComplete = async (blockId, blockType) => {
    if (!blockId) return;

    if (completedBlockIds.includes(blockId)) {
      return; // Already completed, prevent duplicate XP and reward process calls
    }

    setCompletedBlockIds((prev) => Array.from(new Set([...prev, blockId])));

    const typeKeyMap = {
      TEXT_MARKDOWN: "lesson",
      NOTE: "lesson",
      TEXT: "lesson",
      VIDEO_EMBED: "video",
      VIDEO: "video",
      MIND_MAP: "mindmap",
      MINDMAP: "mindmap",
      FLASHCARD_DECK: "flashcard",
      FLASHCARD: "flashcard",
      FLASHCARDS: "flashcard",
      INTERACTIVE_GAME: "games",
      GAME: "games",
      ACTIVITY: "games",
      QUIZ: "quiz"
    };

    const stageKey = typeKeyMap[(blockType || "").toUpperCase()] || "lesson";

    setProgressState((prev) => ({
      ...prev,
      [`${stageKey}_completed`]: true,
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
        <p className="mt-4 font-black text-lime-200 text-sm">Membuka Pakej Pembelajaran...</p>
      </div>
    );
  }

  const worldTheme = WORLD_THEMES.default;

  return (
    <div className={`min-h-screen ${worldTheme.bgGradient} font-sans text-stone-100 pb-24 px-4 py-6`}>
      <div className="max-w-4xl mx-auto space-y-6">

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
                {packageData?.curriculum_context?.subject_name || "Subjek"}
              </span>
              <h1 className="text-sm sm:text-base font-black text-white mt-1 flex items-center gap-1.5 truncate">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" /> {packageData?.lesson?.title || "Misi Pembelajaran"}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* MODE SWITCHER CONTROLLER */}
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

            {/* XP BADGE */}
            <div className="bg-gradient-to-r from-amber-400 to-lime-400 px-3 py-1.5 rounded-2xl text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 shrink-0">
              <Leaf className="w-4 h-4 fill-stone-950" /> {progressState.xp_earned} XP
            </div>
          </div>
        </div>

        {/* MAIN MODE VIEW CONTENT */}
        {learningMode === "adventure" ? (
          /* ADVENTURE MODE EXPERIENCE */
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
                <h3 className="text-xl font-black text-amber-200">⚔️ Ujian Kemahiran Boss</h3>
                <p className="text-xs text-stone-300 font-bold">Jawab soalan penilaian untuk melengkapkan modul ini!</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                  <Button
                    onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&version=${versionId || ''}&limit=10&mode=practice`)}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-amber-600"
                  >
                    ⚡ Latihan (10 Soalan)
                  </Button>
                  <Button
                    onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&version=${versionId || ''}&limit=20&mode=mastery`)}
                    className="bg-orange-500 hover:bg-orange-400 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-orange-700"
                  >
                    ⚔️ Ujian Mahir (20 Soalan)
                  </Button>
                </div>
              </div>
            }
          />
        ) : (
          /* CLASSIC LMS TAB-BASED EXPERIENCE */
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
            handleStageComplete={handleStageComplete}
            handleSpeech={handleSpeech}
            isSpeaking={isSpeaking}
            navigate={navigate}
          />
        )}

      </div>
    </div>
  );
}
