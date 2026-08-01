import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  transformBlocksToMissions,
  calculateMissionProgress
} from "../../lib/adventureEngine";
import { AdventureIntro } from "./AdventureIntro";
import { AdventureMap } from "./AdventureMap";
import { MissionStage } from "./MissionStage";
import { MascotGuide } from "./MascotGuide";
import { Info } from "lucide-react";

/**
 * LessonAdventure Component
 * 
 * Orchestrator component for StudyQuest Learning Adventure.
 * Transforms raw content blocks into RPG-style missions without changing Base44 data pipeline.
 * 
 * @param {Object} props
 * @param {Object} props.packageData - Raw package object from getLearningPackage()
 * @param {Array} props.contentBlocks - Array of lesson content blocks
 * @param {Array<string>} props.completedBlockIds - List of completed block IDs
 * @param {boolean} props.quizCompleted - Flag indicating if quiz is passed
 * @param {number} props.quizScore - Quiz score percentage
 * @param {Function} props.onCompleteBlock - Callback when a block is completed
 * @param {string} props.studentName - Student display name
 * @param {React.ReactNode} props.quizComponent - Custom quiz component element
 */
export function LessonAdventure({
  packageData = {},
  contentBlocks = [],
  completedBlockIds = [],
  quizCompleted = false,
  quizScore = 0,
  onCompleteBlock,
  studentName = "Pengembara",
  isSpeaking = false,
  onSpeak,
  quizComponent
}) {
  const [viewState, setViewState] = useState("intro"); // 'intro' | 'map' | 'mission'
  const [activeMissionId, setActiveMissionId] = useState(null);

  // Transform content blocks into structured Adventure object
  const adventure = useMemo(() => {
    return transformBlocksToMissions(contentBlocks, packageData, studentName);
  }, [contentBlocks, packageData, studentName]);

  // Compute overall mission progress
  const progressStats = useMemo(() => {
    return calculateMissionProgress(
      adventure,
      completedBlockIds,
      quizCompleted,
      quizScore
    );
  }, [adventure, completedBlockIds, quizCompleted, quizScore]);

  // Synchronize active mission with progress stats
  const activeMission = useMemo(() => {
    if (activeMissionId) {
      const found = progressStats.updatedMissions.find((m) => m.id === activeMissionId);
      if (found) return found;
    }
    if (progressStats.currentActiveMissionId) {
      const found = progressStats.updatedMissions.find(
        (m) => m.id === progressStats.currentActiveMissionId
      );
      if (found) return found;
    }
    return progressStats.updatedMissions[0];
  }, [activeMissionId, progressStats]);

  const handleSelectMission = (mission) => {
    setActiveMissionId(mission.id);
    setViewState("mission");
  };

  const handleCompleteMission = (mission) => {
    if (mission.blocks && mission.blocks.length > 0) {
      mission.blocks.forEach((block) => {
        if (onCompleteBlock) {
          onCompleteBlock(block.id, block.block_type);
        }
      });
    }

    // Automatically advance activeMissionId to next mission if available
    const currentIdx = progressStats.updatedMissions.findIndex((m) => m.id === mission.id);
    if (currentIdx >= 0 && currentIdx < progressStats.updatedMissions.length - 1) {
      const nextMission = progressStats.updatedMissions[currentIdx + 1];
      if (nextMission) {
        setActiveMissionId(nextMission.id);
      }
    }
  };

  return (
    <div className="w-full space-y-6 min-h-[600px] text-stone-100">
      <AnimatePresence mode="wait">
        {viewState === "intro" ? (
          <motion.div
            key="adventure-intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Adventure Intro Opening Screen */}
            <AdventureIntro
              adventure={adventure}
              onStart={() => setViewState("map")}
              studentName={studentName}
            />
          </motion.div>
        ) : viewState === "map" ? (
          <motion.div
            key="adventure-map"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Navigation & Info Trigger Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewState("intro")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-black rounded-xl border border-stone-800 transition-all active:scale-95"
              >
                <Info className="w-4 h-4 text-amber-400" /> Info Kembara & Otan
              </button>
            </div>

            {/* Guide Greeting on Map */}
            <MascotGuide
              message={adventure.mascot?.greeting || `Hai Pengembara ${studentName}! Otan sedia bertualang bersama kamu!`}
              emotion={progressStats.isFullyMastered ? "proud" : "happy"}
              studentName={studentName}
            />

            {/* Interactive Quest Map */}
            <AdventureMap
              adventure={{
                ...adventure,
                missions: progressStats.updatedMissions
              }}
              progress={progressStats}
              onSelectMission={handleSelectMission}
              activeMissionId={activeMission?.id}
              studentName={studentName}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mission-stage"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Single Mission Execution View */}
            <MissionStage
              mission={activeMission}
              onComplete={handleCompleteMission}
              onBackToMap={() => setViewState("map")}
              studentName={studentName}
              completedBlockIds={completedBlockIds}
              onBlockComplete={onCompleteBlock}
              isSpeaking={isSpeaking}
              onSpeak={onSpeak}
              quizComponent={quizComponent}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

