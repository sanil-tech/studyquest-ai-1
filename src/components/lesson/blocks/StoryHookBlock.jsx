// src/components/lesson/blocks/StoryHookBlock.jsx
// Block 1: Emotional engagement & context setting
// Renders mascot story illustration, text, and mascot dialogue with TTS audio button

import React, { useMemo } from "react";
import { Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalize } from "@/lib/personalize";
import sukuPenyuMascotImg from "@/assets/images/suku_penyu_mascot_1785919182374.jpg";
import { generateDynamicImagePrompt, getPromptSeed } from "@/utils/generateDynamicImagePrompt";
import { getStaticFallbackImage } from "@/services/aiImageEngine";
import StoryHookMedia from "@/components/lesson/StoryHookMedia";

export default function StoryHookBlock({ content = {}, mascot, studentName = "Adik", onComplete, isCompleted }) {
  const payload = content.payload || content;
  const storyText = personalize(payload.story_text || payload.story_hook || payload.description || "", studentName);
  const dialogue = personalize(payload.mascot_dialogue || payload.dialogue_template || payload.dialogue || payload.story_hook || "", studentName);
  const helpText = personalize(
    payload.help_continuation ||
      payload.help_guide ||
      "Mari kita bantu Suku Penyu menyelesaikan cabaran ini dengan menguasai kemahiran subtopik ini bersama-sama!",
    studentName
  );
  const ttsScript = payload.tts_script || payload.voice_script || dialogue;
  const mascotEmoji = mascot?.includes("🦊") ? "🦊" : "🐢";
  const mascotName = mascot?.includes("Ejen") ? "Ejen Suku" : "Suku Penyu";

  // Build high quality Pollinations image URL matching exact story mission
  const computedStoryImageUrl = useMemo(() => {
    const rawUrl = payload.image_url || payload.visual_url || payload.visual?.image_url || payload.image;
    if (rawUrl && !rawUrl.includes("suku_penyu_mascot")) {
      return rawUrl;
    }

    const storyPromptText = payload.image_prompt || payload.visual_prompt || storyText || payload.topic || "";
    const prompt = generateDynamicImagePrompt({
      subject: payload.subject || "Matematik",
      grade: payload.grade || "Tahun 1",
      topic: payload.topic || "Nombor hingga 100",
      sceneType: "STORY",
      visualDescription: payload.image_prompt || payload.visual_prompt || payload.visual_description || "",
      storyText: storyPromptText
    });

    const seed = getPromptSeed(prompt);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${seed}`;
  }, [payload, storyText]);

  const fallbackSceneImg = getStaticFallbackImage(payload.topic, storyText);
  const storyVisual = computedStoryImageUrl || fallbackSceneImg;

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
          <StoryHookMedia content={content} storyVisual={storyVisual} fallbackSceneImg={fallbackSceneImg} />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent pointer-events-none" />
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