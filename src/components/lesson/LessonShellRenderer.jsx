// src/components/lesson/LessonShellRenderer.jsx
// The deterministic lesson renderer for v2.0 Lesson Shell.
// Maps 8 fixed block types to 8 focused components.

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
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
  MISSION_COMPLETE: MissionCompleteBlock,
};

/**
 * Presentation‑layer stage mapping (5 pedagogical stages).
 * Uses block_type identifiers to stay resilient to schema changes.
 */
const STAGE_MAP = [
  {
    id: "engagement",
    name: "Engagement",
    icon: "📖",
    blocks: ["STORY_HOOK", "LEARNING_OBJECTIVE"],
  },
  {
    id: "concept",
    name: "Concept Learning",
    icon: "📚",
    blocks: ["CONCEPT_CPA", "WORKED_EXAMPLE"],
  },
  {
    id: "practice",
    name: "Practice Arena",
    icon: "🎮",
    blocks: ["INTERACTIVE_PRACTICE", "KNOWLEDGE_CHECK"],
  },
  {
    id: "memory",
    name: "Memory Anchor",
    icon: "🧠",
    blocks: ["KEY_TAKEAWAY"],
  },
  {
    id: "completion",
    name: "Checkpoint",
    icon: "🏁",
    blocks: ["MISSION_COMPLETE"],
  },
];

/**
 * Block progress labels for the step indicator (kept for backward compatibility).
 */
const BLOCK_LABELS = [
  { short: "Cerita", emoji: "📖" },
  { short: "Objektif", emoji: "🎯" },
  { short: "Konsep", emoji: "📚" },
  { short: "Contoh", emoji: "✏️" },
  { short: "Latihan", emoji: "🎮" },
  { short: "Ujian", emoji: "📝" },
  { short: "Rumusan", emoji: "🧠" },
  { short: "Tamat", emoji: "🏆" },
];

/**
 * LessonShellRenderer
 * Renders a v2.0 lesson shell as a sequential, step‑by‑step learning experience.
 *
 * @param {object} props
 * @param {object} props.lesson - The v2.0 lesson shell (with filled content)
 * @param {string} props.studentName - Current student name
 * @param {function} props.onLessonComplete - Called when all blocks are completed
 * @param {function} props.onNavigateBack - Called when student wants to go back
 * @param {function} props.onMistake - Called when student makes an error (for AI tutor)
 */
export default function LessonShellRenderer({
  lesson,
  studentName = "Pengembara",
  onLessonComplete,
  onNavigateBack,
  onMistake,
}) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState(new Set());
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);

  const blocks = lesson?.blocks || [];
  const metadata = lesson?.metadata || {};

  // Mapping from block_type to its index for quick navigation via stage clicks
  const blockIndexByType = useMemo(() => {
    const map = {};
    blocks.forEach((b, i) => {
      if (b?.block_type) map[b.block_type] = i;
    });
    return map;
  }, [blocks]);

  // Total possible rewards (kept for reference)
  const totalPossibleXp = useMemo(() => blocks.reduce((s, b) => s + (b.xp_reward || 0), 0), [blocks]);
  const totalPossibleCoins = useMemo(() => blocks.reduce((s, b) => s + (b.coin_reward || 0), 0), [blocks]);

  // Block‑level progress percentage for the thin progress bar
  const progressPercent = useMemo(() => {
    if (blocks.length === 0) return 0;
    return Math.round((completedBlocks.size / blocks.length) * 100);
  }, [completedBlocks, blocks.length]);

  // Current block object and its component
  const currentBlock = blocks[currentBlockIndex];
  const BlockComponent = BLOCK_COMPONENT_MAP[currentBlock?.block_type];
  const isCurrentCompleted = completedBlocks.has(currentBlockIndex);

  // Detect the current pedagogical stage using block_type (memo to avoid React warnings)
  const currentStage = useMemo(() => {
    return STAGE_MAP.find((stage) =>
      stage.blocks.includes(currentBlock?.block_type)
    );
  }, [currentBlock]);

  const stageNumber = currentStage ? STAGE_MAP.findIndex((s) => s.id === currentStage.id) + 1 : 0;

  // Build an array describing each stage’s completion state for the top indicator
  const stageProgress = STAGE_MAP.map((stage) => {
    const isDone = stage.blocks.every((type) => completedBlocks.has(blockIndexByType[type]));
    const isCurrent = stage.blocks.includes(currentBlock?.block_type);
    return { stage, isDone, isCurrent };
  });

  // ---------------------------------------------------------------------
  // Block completion handler – unchanged core logic, with optional stage hook
  // ---------------------------------------------------------------------
  const handleBlockComplete = useCallback(
    (blockIndex) => {
      if (completedBlocks.has(blockIndex)) {
        if (blockIndex < blocks.length - 1) setCurrentBlockIndex(blockIndex + 1);
        return;
      }

      const block = blocks[blockIndex];
      const xpGain = block?.xp_reward || 0;
      const coinGain = block?.coin_reward || 0;

      setCompletedBlocks((prev) => new Set([...prev, blockIndex]));

      if (xpGain > 0 || coinGain > 0) {
        setEarnedXp((prev) => prev + xpGain);
        setEarnedCoins((prev) => prev + coinGain);
        setShowXpFloat(true);
        setTimeout(() => setShowXpFloat(false), 1500);
      }

      // Advance to next block or signal lesson completion
      if (blockIndex < blocks.length - 1) {
        setTimeout(() => setCurrentBlockIndex(blockIndex + 1), 300);
      } else if (onLessonComplete) {
        onLessonComplete({
          totalXp: earnedXp + xpGain,
          totalCoins: earnedCoins + coinGain,
          completedBlocks: completedBlocks.size + 1,
          metadata,
        });
      }
    },
    [blocks, completedBlocks, earnedXp, earnedCoins, metadata, onLessonComplete]
  );

  const handleGoBack = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  }, [currentBlockIndex, onNavigateBack]);

  // Guard: missing lesson data
  if (!lesson || blocks.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-stone-400 font-bold text-sm">Tiada data pelajaran ditemui.</p>
        <Button onClick={onNavigateBack} variant="outline">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-3 py-4">
      {/* Top bar – back button and XP/coin counters */}
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
          <span className="text-[10px] font-black text-yellow-400">🪙 {earnedCoins}</span>
        </div>
      </div>

      {/* Stage progress indicator – 5 clickable stage buttons */}
      <div className="flex gap-1 mb-2">
        {stageProgress.map(({ stage, isDone, isCurrent }) => (
          <button
            key={stage.id}
            onClick={() => {
              if (isDone || isCurrent) {
                const targetIdx = blockIndexByType[stage.blocks[0]];
                if (targetIdx !== undefined) setCurrentBlockIndex(targetIdx);
              }
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              isDone
                ? "bg-emerald-500/20 border border-emerald-500/40"
                : isCurrent
                  ? "bg-amber-500/20 border border-amber-500/40 scale-105"
                  : "bg-stone-800/50 border border-stone-800"
            }`}
            title={stage.name}
          >
            <span className="text-[10px] block">{stage.icon}</span>
          </button>
        ))}
      </div>

      {/* Stage header – shows icon, name, and stage number */}
      {currentStage && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{currentStage.icon}</span>
          <h2 className="text-xl font-bold">{currentStage.name}</h2>
          <p className="text-sm text-stone-400">Stage {stageNumber} of {STAGE_MAP.length}</p>
        </div>
      )}

      {/* Block‑level progress bar (thin) */}
      <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Floating XP animation */}
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

      {/* Footer with lesson metadata and block counter */}
      <div className="pt-2 border-t border-stone-800/50 flex items-center justify-between text-[10px] text-stone-600">
        <span>{metadata.subject} • {metadata.grade} • {metadata.topic}</span>
        <span>Blok {currentBlockIndex + 1} / {blocks.length}</span>
      </div>
    </div>
  );
}
