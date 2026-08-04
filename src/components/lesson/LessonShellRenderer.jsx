// src/components/lesson/LessonShellRenderer.jsx
// The new deterministic lesson renderer for v2.0 Lesson Shell.
// Maps 8 fixed block types to 8 focused components.
// Replaces the 1,718-line BlockRenderer.jsx for v2.0 lessons.

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// 8 focused block components
import StoryHookBlock from "./blocks/StoryHookBlock";
import LearningObjectiveBlock from "./blocks/LearningObjectiveBlock";
import ConceptCPABlock from "./blocks/ConceptCPABlock";
import WorkedExampleBlock from "./blocks/WorkedExampleBlock";
import InteractivePracticeBlock from "./blocks/InteractivePracticeBlock";
import KnowledgeCheckBlock from "./blocks/KnowledgeCheckBlock";
import KeyTakeawayBlock from "./blocks/KeyTakeawayBlock";
import MissionCompleteBlock from "./blocks/MissionCompleteBlock";

/**
 * Block type → Component mapping (8 entries, not 40+)
 */
const BLOCK_COMPONENT_MAP = {
  STORY_HOOK: StoryHookBlock,
  LEARNING_OBJECTIVE: LearningObjectiveBlock,
  CONCEPT_CPA: ConceptCPABlock,
  WORKED_EXAMPLE: WorkedExampleBlock,
  INTERACTIVE_PRACTICE: InteractivePracticeBlock,
  KNOWLEDGE_CHECK: KnowledgeCheckBlock,
  KEY_TAKEAWAY: KeyTakeawayBlock,
  MISSION_COMPLETE: MissionCompleteBlock
};

/**
 * Block progress labels for the step indicator
 */
const BLOCK_LABELS = [
  { short: "Cerita", emoji: "📖" },
  { short: "Objektif", emoji: "🎯" },
  { short: "Konsep", emoji: "📚" },
  { short: "Contoh", emoji: "✏️" },
  { short: "Latihan", emoji: "🎮" },
  { short: "Ujian", emoji: "📝" },
  { short: "Rumusan", emoji: "🧠" },
  { short: "Tamat", emoji: "🏆" }
];

/**
 * LessonShellRenderer
 *
 * Renders a v2.0 lesson shell as a sequential, step-by-step learning experience.
 * One block is active at a time. Student progresses linearly through all 8 blocks.
 *
 * @param {object} props
 * @param {object} props.lesson - The v2.0 lesson shell (with filled content)
 * @param {string} props.studentName - Current student name
 * @param {function} props.onLessonComplete - Called when all 8 blocks are completed
 * @param {function} props.onNavigateBack - Called when student wants to go back
 * @param {function} props.onMistake - Called when student makes an error (for AI tutor)
 */
export default function LessonShellRenderer({
  lesson,
  studentName = "Pengembara",
  onLessonComplete,
  onNavigateBack,
  onMistake
}) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState(new Set());
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);

  const blocks = lesson?.blocks || [];
  const metadata = lesson?.metadata || {};

  // Total possible rewards
  const totalPossibleXp = useMemo(() => blocks.reduce((s, b) => s + (b.xp_reward || 0), 0), [blocks]);
  const totalPossibleCoins = useMemo(() => blocks.reduce((s, b) => s + (b.coin_reward || 0), 0), [blocks]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (blocks.length === 0) return 0;
    return Math.round((completedBlocks.size / blocks.length) * 100);
  }, [completedBlocks, blocks.length]);

  // Handle block completion
  const handleBlockComplete = useCallback((blockIndex) => {
    if (completedBlocks.has(blockIndex)) {
      // Already completed — just advance
      if (blockIndex < blocks.length - 1) {
        setCurrentBlockIndex(blockIndex + 1);
      }
      return;
    }

    const block = blocks[blockIndex];
    const xpGain = block?.xp_reward || 0;
    const coinGain = block?.coin_reward || 0;

    // Mark as completed
    setCompletedBlocks((prev) => new Set([...prev, blockIndex]));

    // Award XP/coins
    if (xpGain > 0 || coinGain > 0) {
      setEarnedXp((prev) => prev + xpGain);
      setEarnedCoins((prev) => prev + coinGain);

      // Show floating XP indicator
      setShowXpFloat(true);
      setTimeout(() => setShowXpFloat(false), 1500);
    }

    // Advance to next block or complete lesson
    if (blockIndex < blocks.length - 1) {
      setTimeout(() => setCurrentBlockIndex(blockIndex + 1), 300);
    } else {
      // All 8 blocks completed
      if (onLessonComplete) {
        onLessonComplete({
          totalXp: earnedXp + xpGain,
          totalCoins: earnedCoins + coinGain,
          completedBlocks: completedBlocks.size + 1,
          metadata
        });
      }
    }
  }, [blocks, completedBlocks, earnedXp, earnedCoins, metadata, onLessonComplete]);

  // Handle navigation to previous block
  const handleGoBack = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  }, [currentBlockIndex, onNavigateBack]);

  // Guard: no lesson data
  if (!lesson || blocks.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-stone-400 font-bold text-sm">Tiada data pelajaran ditemui.</p>
        <Button onClick={onNavigateBack} variant="outline">Kembali</Button>
      </div>
    );
  }

  const currentBlock = blocks[currentBlockIndex];
  const BlockComponent = BLOCK_COMPONENT_MAP[currentBlock?.block_type];
  const isCurrentCompleted = completedBlocks.has(currentBlockIndex);

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-3 py-4">
      {/* Top bar: Back button + Progress + XP */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1.5 text-stone-400 hover:text-white text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentBlockIndex === 0 ? "Keluar" : "Kembali"}
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {earnedXp} XP
          </span>
          <span className="text-[10px] font-black text-yellow-400">
            🪙 {earnedCoins}
          </span>
        </div>
      </div>

      {/* Step progress indicator */}
      <div className="flex gap-1">
        {blocks.map((block, idx) => {
          const isDone = completedBlocks.has(idx);
          const isCurrent = idx === currentBlockIndex;
          const label = BLOCK_LABELS[idx] || { short: `B${idx + 1}`, emoji: "📦" };

          return (
            <button
              key={idx}
              onClick={() => {
                // Allow navigating back to completed blocks, or to current
                if (isDone || idx <= currentBlockIndex) {
                  setCurrentBlockIndex(idx);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                isDone
                  ? "bg-emerald-500/20 border border-emerald-500/40"
                  : isCurrent
                    ? "bg-amber-500/20 border border-amber-500/40 scale-105"
                    : "bg-stone-800/50 border border-stone-800"
              }`}
              title={label.short}
            >
              <span className="text-[10px] block">
                {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto" /> : label.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Floating XP indicator */}
      <AnimatePresence>
        {showXpFloat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-20 right-6 z-50 bg-amber-500 text-stone-950 font-black text-sm px-4 py-2 rounded-xl shadow-2xl"
          >
            +{blocks[Math.max(0, currentBlockIndex - 1)]?.xp_reward || 0} XP ⭐
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active block renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlockIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {BlockComponent ? (
            <BlockComponent
              content={currentBlock.content}
              mascot={metadata.mascot}
              studentName={studentName}
              onComplete={() => handleBlockComplete(currentBlockIndex)}
              isCompleted={isCurrentCompleted}
              onMistake={onMistake}
            />
          ) : (
            // Unknown block type fallback — should never happen with v2.0 shells
            <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl text-center space-y-3">
              <p className="text-xs font-bold text-stone-400">
                Blok tidak dikenali: {currentBlock?.block_type}
              </p>
              <Button
                onClick={() => handleBlockComplete(currentBlockIndex)}
                className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl"
              >
                Teruskan ➡️
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer: Lesson info */}
      <div className="pt-2 border-t border-stone-800/50 flex items-center justify-between text-[10px] text-stone-600">
        <span>{metadata.subject} • {metadata.grade} • {metadata.topic}</span>
        <span>Blok {currentBlockIndex + 1} / {blocks.length}</span>
      </div>
    </div>
  );
}
