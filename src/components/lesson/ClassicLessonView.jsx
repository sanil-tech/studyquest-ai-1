import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonProgress from "@/components/lesson/LessonProgress";
import BlockRenderer from "@/components/lesson/BlockRenderer";

/**
 * ClassicLessonView
 * 
 * Preserves the traditional tab-based LMS lesson view for StudyQuest.
 */
export default function ClassicLessonView({
  sortedBlocks = [],
  primaryAssessment,
  topicId,
  studentName = "Pengembara",
  completedBlockIds = [],
  onBlockComplete,
  progressState,
  activeTab,
  setActiveTab,
  handleStageComplete,
  handleSpeech,
  isSpeaking,
  navigate
}) {
  return (
    <div className="space-y-6">
      {/* DYNAMIC STAGE NAVIGATION BAR */}
      <div className="bg-stone-900/80 border border-stone-700/60 rounded-2xl p-2 flex items-center justify-around overflow-x-auto gap-1 shadow-md">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "map" ? "bg-amber-400 text-stone-950 shadow-sm" : "text-stone-300 hover:bg-stone-800"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Peta
        </button>

        {sortedBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => setActiveTab(block.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === block.id ? "bg-emerald-400 text-stone-950 shadow-sm" : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> {block.title || block.block_type}
          </button>
        ))}

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "quiz" ? "bg-rose-400 text-stone-950 shadow-sm" : "text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Ujian
        </button>
      </div>

      {/* CONTENT DYNAMIC STAGES */}
      <AnimatePresence mode="wait">
        {/* MAP ROADMAP STAGE */}
        {activeTab === "map" && (
          <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <LessonProgress
              steps={{
                video: progressState.video_completed,
                lesson: progressState.lesson_completed,
                flashcard: progressState.flashcard_completed,
                mindmap: progressState.mindmap_completed,
                games: progressState.games_completed,
                quiz: progressState.quiz_completed
              }}
              onStepClick={(key) => {
                const targetBlock = sortedBlocks.find(b => (b.block_type || "").toLowerCase().replace(/_/g, "").includes(key.replace(/_/g, "")));
                if (targetBlock) setActiveTab(targetBlock.id);
                else if (key === "quiz") setActiveTab("quiz");
              }}
            />
          </motion.div>
        )}

        {/* DYNAMIC CONTENT BLOCK STAGES VIA BLOCKRENDERER */}
        {sortedBlocks.map((block) => {
          if (activeTab !== block.id) return null;
          return (
            <motion.div key={block.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-stone-900/90 rounded-3xl p-6 border-2 border-stone-800 shadow-xl space-y-4">
              <BlockRenderer
                block={block}
                studentName={studentName}
                isSpeaking={isSpeaking}
                onSpeak={handleSpeech}
                isCompleted={completedBlockIds.includes(block.id)}
                onComplete={() => {
                  if (onBlockComplete) {
                    onBlockComplete(block.id, block.block_type);
                  } else if (handleStageComplete) {
                    handleStageComplete((block.block_type || "").toLowerCase(), 15);
                  }
                }}
              />
            </motion.div>
          );
        })}

        {/* QUIZ ASSESSMENT STAGE */}
        {activeTab === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-amber-950 to-stone-900 rounded-3xl p-8 border-2 border-amber-500/40 shadow-2xl text-center space-y-4">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-amber-200">⚔️ Ujian Kemahiran Boss</h3>
            <p className="text-xs text-stone-300 font-bold">Jawab soalan penilaian untuk melengkapkan modul ini!</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <Button
                onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&limit=10&mode=practice`)}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-amber-600"
              >
                ⚡ Latihan (10 Soalan)
              </Button>
              <Button
                onClick={() => navigate(`/quiz/${topicId || primaryAssessment?.id}?topic=${topicId || ''}&limit=20&mode=mastery`)}
                className="bg-orange-500 hover:bg-orange-400 text-stone-950 font-black text-xs py-4 rounded-xl border-b-4 border-orange-700"
              >
                ⚔️ Ujian Mahir (20 Soalan)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
