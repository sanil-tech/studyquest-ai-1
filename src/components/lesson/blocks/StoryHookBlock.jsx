// src/components/lesson/blocks/StoryHookBlock.jsx
// Block 1: Emotional engagement & context setting
// Renders mascot story illustration, text, and mascot dialogue with TTS audio button

import React from "react";
import { Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";
import sukuPenyuMascotImg from "@/assets/images/suku_penyu_mascot_1785919182374.jpg";

export default function StoryHookBlock({ content, mascot, studentName, onComplete, isCompleted }) {
  const storyText = personalize(content.story_text || "", studentName);
  const dialogue = personalize(content.mascot_dialogue || "", studentName);
  const ttsScript = content.tts_script || dialogue;
  const mascotEmoji = mascot?.includes("🦊") ? "🦊" : "🐢";
  const mascotName = mascot?.includes("Ejen") ? "Ejen Suku" : "Suku Penyu";
  const storyVisual = content.image_url || content.visual_url || content.visual?.image_url || sukuPenyuMascotImg;

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = (ttsScript || dialogue).replace(/[🐢🦊✨🎒🪙]/g, "").replace(/\{student_name\}/g, studentName);
    const utt = new SpeechSynthesisUtterance(cleanText);
    utt.lang = "ms-MY";
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  return (
    <div className="p-5 bg-gradient-to-br from-amber-950/50 via-stone-900 to-indigo-950/50 border-2 border-amber-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Misi Kembara {mascotName}
        </span>
        <button
          onClick={handleSpeak}
          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
        >
          <Volume2 className="w-3.5 h-3.5" /> Dengar {mascotName}
        </button>
      </div>

      {/* Story Card with Suku Penyu Visual Banner & Story Text */}
      <div className="overflow-hidden bg-stone-950/90 rounded-2xl border border-stone-800 space-y-3 shadow-lg">
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-t from-stone-950 via-stone-900 to-amber-950/40 flex items-center justify-center overflow-hidden">
          <img
            src={storyVisual}
            alt="Suku Penyu Mascot Story Visual"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = sukuPenyuMascotImg;
            }}
            className="w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500/90 text-stone-950 text-[10px] font-black uppercase rounded-lg shadow">
              Kisah Misi {mascotName}
            </span>
            <span className="text-xs">🐢✨</span>
          </div>
        </div>

        {storyText && (
          <p className="text-xs sm:text-sm text-stone-200 font-semibold leading-relaxed px-4 pb-3 pt-1">
            {storyText}
          </p>
        )}
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
            {personalize(
              content.help_continuation ||
                content.help_guide ||
                "Mari kita bantu Suku Penyu menyelesaikan cabaran ini dengan menguasai kemahiran subtopik ini bersama-sama!",
              studentName
            )}
          </p>
        </div>
      </div>

      {/* Mascot dialogue bubble with profile picture */}
      <div className="p-4 bg-stone-950/90 rounded-2xl border border-stone-800 flex items-start gap-3 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
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
        <div className="space-y-1 flex-1">
          <h4 className="text-xs font-black text-amber-400">{mascotName} {mascotEmoji}</h4>
          <p className="text-sm font-bold text-stone-200 leading-relaxed">
            "{dialogue}"
          </p>
        </div>
      </div>

      {/* Continue button — awards +10 XP */}
      <Button
        onClick={onComplete}
        className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-amber-700 active:translate-y-1 transition-all"
      >
        {isCompleted ? "Misi Bermula ✓" : "Jom Mula Kembara! ➡️"}
      </Button>
    </div>
  );
}
