import React, { useState } from "react";
import BlockRenderer from "../lesson/BlockRenderer";
import { MascotGuide } from "./MascotGuide";
import { MissionComplete } from "./MissionComplete";
import { getOtanTip, getOtanDialogue, calculateAdventureReward } from "../../lib/adventureEngine";
import { ArrowLeft, CheckCircle } from "lucide-react";

/**
 * MissionStage Component
 * 
 * Manages the execution loop for a single adventure mission.
 * Reuses BlockRenderer for rendering content blocks.
 * 
 * @param {Object} props
 * @param {Object} props.mission - Current mission object
 * @param {Function} props.onComplete - Callback when mission is cleared
 * @param {Function} props.onBackToMap - Callback to return to quest map
 * @param {string} props.studentName - Student name for personalization
 * @param {React.ReactNode} props.quizComponent - Optional quiz component for CHALLENGE stage
 */
export function MissionStage({
  mission,
  onComplete,
  onBackToMap,
  studentName = "Pengembara",
  completedBlockIds = [],
  onBlockComplete,
  isSpeaking = false,
  onSpeak,
  quizComponent
}) {
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState({ xp: 0, coins: 0 });
  const [counsel, setCounsel] = useState(() => {
    const startDialogue = getOtanDialogue("MISSION_START", studentName);
    return {
      message: startDialogue.message || getOtanTip(mission?.stage, "start"),
      emotion: startDialogue.emotion || "excited"
    };
  });

  if (!mission) {
    return (
      <div className="p-8 text-center bg-stone-900 rounded-3xl border border-stone-800 text-stone-300">
        Pilih mission daripada Peta Kembara untuk memulakan!
      </div>
    );
  }

  const stageName = mission.stage || "DISCOVER";
  const blocks = mission.blocks || [];
  const isChallenge = stageName === "CHALLENGE";

  const handleStageSuccess = () => {
    const rewards = calculateAdventureReward(mission, true);
    setEarnedRewards(rewards);
    const completeDialogue = getOtanDialogue("MISSION_COMPLETE", studentName);
    setCounsel({
      message: completeDialogue.message,
      emotion: completeDialogue.emotion
    });
    setShowRewardModal(true);

    if (onComplete) {
      onComplete(mission, rewards);
    }
  };

  const handleHintRequest = () => {
    const hintDialogue = getOtanDialogue("HINT_REQUEST", studentName);
    setCounsel({
      message: hintDialogue.message,
      emotion: hintDialogue.emotion
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Stage Header Navigation */}
      <div className="flex items-center justify-between bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
        <button
          onClick={onBackToMap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-black rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Peta Kembara
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
            {mission.icon || "🌟"} {stageName}
          </span>
          <span className="text-xs font-bold text-stone-300 hidden sm:inline">
            {mission.title}
          </span>
        </div>
      </div>

      {/* Otan Guidance Callout */}
      <MascotGuide
        message={counsel.message}
        emotion={counsel.emotion}
        onRequestHint={handleHintRequest}
      />

      {/* Main Content Area */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative min-h-[400px]">
        {isChallenge ? (
          /* Boss Challenge Quiz View */
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  👑 Misi Kejuaraan Boss
                </span>
                <h2 className="text-lg font-black text-stone-100">
                  {mission.title}
                </h2>
              </div>
              <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                +{mission.reward?.xp || 150} XP
              </span>
            </div>

            {quizComponent || (
              <div className="p-6 bg-stone-900 rounded-2xl text-center space-y-4">
                <p className="text-sm font-bold text-stone-300">
                  Misi Kejuaraan sedia ditewaskan! Selesaikan soalan quiz untuk memperoleh badge kejuaraan.
                </p>
                <button
                  onClick={handleStageSuccess}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl shadow-lg transition-all"
                >
                  Selesaikan Cabaran Boss 👑
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Blocks View (Reusing BlockRenderer) */
          <div className="space-y-6">
            {blocks.map((block) => (
              <div key={block.id || block.title} className="space-y-4">
                <BlockRenderer
                  block={block}
                  studentName={studentName}
                  isSpeaking={isSpeaking}
                  onSpeak={onSpeak}
                  isCompleted={completedBlockIds.includes(block.id)}
                  onComplete={() => {
                    if (onBlockComplete) {
                      onBlockComplete(block.id, block.block_type);
                    }
                  }}
                />
              </div>
            ))}

            {/* Action Footer Button */}
            <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-medium text-stone-400">
                Ketik selesai setelah membaca atau menyiapkan latihan ini.
              </span>

              <button
                onClick={handleStageSuccess}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-stone-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 border-b-4 border-emerald-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                Selesai Misi Ini!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mission Reward Modal Overlay */}
      {showRewardModal && (
        <MissionComplete
          mission={mission}
          reward={earnedRewards}
          badge={mission.reward?.badge}
          studentName={studentName}
          onContinue={() => {
            setShowRewardModal(false);
            if (onBackToMap) onBackToMap();
          }}
        />
      )}
    </div>
  );
}
