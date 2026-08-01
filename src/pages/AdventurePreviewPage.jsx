// src/pages/AdventurePreviewPage.jsx
/**
 * StudyQuest Learning Adventure - Development Preview Sandbox
 * 
 * Safe test environment to validate:
 * Base44 package -> transformBlocksToMissions -> LessonAdventure -> AdventureMap -> MissionStage -> BlockRenderer
 */

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { transformBlocksToMissions, calculateMissionProgress } from "@/lib/adventureEngine";
import { LessonAdventure } from "@/components/adventure/LessonAdventure";
import { ArrowLeft, Bug, Sparkles, RefreshCw, Layers } from "lucide-react";
import { Link } from "react-router-dom";

// Fallback Mock Lesson for offline/demo testing: Mathematics Year 1 - Nombor hingga 100
const MOCK_MATH_PACKAGE = {
  success: true,
  subject_display: "Matematik",
  subject: "math",
  topic: "Nombor hingga 100",
  lesson_title: "Nombor Hingga 100",
  lesson_description: "Bantu Otan menyelamatkan nombor-nombor yang hilang di Dunia Nombor!",
  content_blocks: [
    {
      id: "block-1",
      block_type: "VIDEO_EMBED",
      title: "🔥 Warm Up: Pengenalan Nombor 1-20",
      content_markdown: "Tonton video pengenalan nombor 1 hingga 20.",
      payload: {
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        search_query: "nombor 1 hingga 20 matematik tahun 1"
      }
    },
    {
      id: "block-2",
      block_type: "TEXT_MARKDOWN",
      title: "🏗 Rumah Puluh dan Sa",
      content_markdown: "### Memahami Nilai Tempat: Puluh & Sa\n\nDalam nombor 46:\n- **4** ialah nilai **puluh** (40)\n- **6** ialah nilai **sa** (6)\n\n> **Petunjuk Otan:** Sentiasa lihat angka puluh terlebih dahulu apabila membandingkan nombor!",
      payload: {
        markdown: "### Memahami Nilai Tempat: Puluh & Sa\n\nDalam nombor 46:\n- **4** ialah nilai **puluh** (40)\n- **6** ialah nilai **sa** (6)"
      }
    },
    {
      id: "block-3",
      block_type: "MINDMAP",
      title: "🧠 Peta Minda Pengecaman Nombor",
      content_markdown: "Peta minda hubungan nombor dan nilai tempat.",
      payload: {
        branches: [
          { label: "Nombor 1-100", children: [{ label: "Nilai Tempat" }, { label: "Perbandingan" }] }
        ]
      }
    },
    {
      id: "block-4",
      block_type: "WORKSHEET",
      title: "📑 Lembaran Kerja Perbandingan Nombor",
      content_markdown: "Selesaikan latihan berikut:\n1. 46 lawan 64 (Mana lebih besar?)\n2. 85 lawan 58",
      payload: {
        markdown: "### Latihan Perbandingan Nombor\n\nTentukan simbol yang betul ( > , < , = ):\n1. 46 __ 64\n2. 85 __ 58"
      }
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "Apakah nilai tempat bagi angka 7 dalam nombor 72?",
      options: ["Sa", "Puluh", "Ratus", "Ribu"],
      correctIndex: 1,
      explanation: "Angka 7 berada di kedudukan puluh, jadi nilainya ialah 70."
    }
  ]
};

export default function AdventurePreviewPage() {
  const [subjectId, setSubjectId] = useState("math");
  const [topicId, setTopicId] = useState("");
  const [packageData, setPackageData] = useState(MOCK_MATH_PACKAGE);
  const [loading, setLoading] = useState(false);
  const [completedBlockIds, setCompletedBlockIds] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  // Fetch package from Base44 backend if topicId is provided
  const fetchLivePackage = async () => {
    if (!topicId) {
      setPackageData(MOCK_MATH_PACKAGE);
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke("getLearningPackage", {
        topic_id: topicId,
        subject_id: subjectId
      });
      if (res.data?.success) {
        setPackageData(res.data);
      } else {
        console.warn("Using mock package as fallback.");
        setPackageData(MOCK_MATH_PACKAGE);
      }
    } catch (err) {
      console.error("Error fetching live package:", err);
      setPackageData(MOCK_MATH_PACKAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePackage();
  }, [topicId, subjectId]);

  const contentBlocks = packageData?.content_blocks || [];
  const transformedAdventure = transformBlocksToMissions(contentBlocks, packageData);
  const progressStats = calculateMissionProgress(transformedAdventure, completedBlockIds, quizCompleted, 100);

  const handleCompleteBlock = (blockId) => {
    setCompletedBlockIds((prev) => Array.from(new Set([...prev, blockId])));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-8 space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sandbox Pratinjau Kembara
            </div>
            <h1 className="text-lg font-black text-stone-100">
              StudyQuest Learning Adventure Sandbox
            </h1>
          </div>
        </div>

        {/* Action Controls & Debug Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-3 py-2 text-xs font-black rounded-xl border flex items-center gap-1.5 transition-all ${
              showDebug
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
            }`}
          >
            <Bug className="w-4 h-4" />
            Debug Mode
          </button>
          <button
            onClick={() => {
              setCompletedBlockIds([]);
              setQuizCompleted(false);
            }}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black rounded-xl border border-stone-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>

      {/* Debug Inspector Panel */}
      {showDebug && (
        <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Contract Debug Inspector
            </h2>
            <span className="text-xs font-bold text-stone-400">
              {packageData === MOCK_MATH_PACKAGE ? "Data Modul Simulasi (Math Y1)" : "Data Live Backend"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="text-stone-500 font-bold block">Raw Blocks Count</span>
              <span className="text-lg font-black text-stone-100">{contentBlocks.length}</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="text-stone-500 font-bold block">Missions Generated</span>
              <span className="text-lg font-black text-amber-400">{transformedAdventure.missions.length}</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="text-stone-500 font-bold block">Completed Blocks</span>
              <span className="text-lg font-black text-emerald-400">{completedBlockIds.length}</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800">
              <span className="text-stone-500 font-bold block">Progress Mastered</span>
              <span className="text-lg font-black text-indigo-400">{progressStats.percent}%</span>
            </div>
          </div>

          {/* Quick Backend Live Fetch Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              placeholder="Masukkan Topic ID (cth: topic-math-1)"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={fetchLivePackage}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all"
            >
              {loading ? "Memuatkan..." : "Muat Live Backend"}
            </button>
          </div>
        </div>
      )}

      {/* Main Adventure Component Container */}
      <div className="max-w-5xl mx-auto">
        <LessonAdventure
          packageData={packageData}
          contentBlocks={contentBlocks}
          completedBlockIds={completedBlockIds}
          quizCompleted={quizCompleted}
          quizScore={quizCompleted ? 100 : 0}
          onCompleteBlock={handleCompleteBlock}
          studentName="Pengembara Muda"
          quizComponent={
            <div className="p-6 bg-stone-900 rounded-2xl text-center space-y-4">
              <h3 className="text-base font-black text-amber-300">
                👑 Quiz Boss Challenge Sandbox
              </h3>
              <p className="text-xs text-stone-300">
                {packageData.quiz?.[0]?.question || "Berapakah 50 + 50?"}
              </p>
              <button
                onClick={() => setQuizCompleted(true)}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl transition-all"
              >
                Mark Quiz Completed (100%)
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
