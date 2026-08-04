// src/components/lesson/blocks/StoryHookBlock.jsx
// Block 1: Emotional engagement & context setting
// Renders mascot dialogue with TTS audio button

import React from "react";
import { Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";

export default function StoryHookBlock({ content, mascot, studentName, onComplete, isCompleted }) {
  const storyText = personalize(content.story_text || "", studentName);
  const dialogue = personalize(content.mascot_dialogue || "", studentName);
  const ttsScript = content.tts_script || dialogue;
  const mascotEmoji = mascot?.includes("🦊") ? "🦊" : "🐢";
  const mascotName = mascot?.includes("Ejen") ? "Ejen Suku" : "Suku Penyu";

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

      {/* Story text */}
      {storyText && (
        <p className="text-xs text-stone-300 font-semibold leading-relaxed p-3 bg-stone-950/50 rounded-2xl border border-stone-800">
          {storyText}
        </p>
      )}

      {/* Mascot dialogue bubble */}
      <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
          {mascotEmoji}
        </div>
        <div className="space-y-1">
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
