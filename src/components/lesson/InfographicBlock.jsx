// src/components/lesson/InfographicBlock.jsx
import React, { useState } from "react";
import { personalize } from "@/lib/personalize";
import { bersihkanTeksUntukSuara } from "@/components/lesson/BlockRenderer";
import {
  Image as ImageIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  CheckCircle2,
  Tag,
  Lightbulb,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InfographicBlock({
  blockTitle,
  payload = {},
  studentName = "Pengembara",
  onCompleted,
  isCompleted = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Extract structured fields with backward compatibility fallbacks
  const imageUrl = payload.image_url || payload.media_url || "";
  const title = payload.title || blockTitle || "Infografik Visual";
  const description =
    payload.short_description ||
    payload.summary ||
    (typeof payload.raw_markdown === "string" ? payload.raw_markdown : "") ||
    "";

  const keyPoints =
    Array.isArray(payload.key_points) && payload.key_points.length > 0
      ? payload.key_points
      : Array.isArray(payload.key_takeaways)
      ? payload.key_takeaways
      : [];

  const visualLabels =
    Array.isArray(payload.visual_labels) && payload.visual_labels.length > 0
      ? payload.visual_labels
      : Array.isArray(payload.sections)
      ? payload.sections.map((s) => ({
          label: s.heading || s.title || "Mata Fokus",
          detail: s.content || s.description || "",
          icon: "📌"
        }))
      : [];

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${title}. ${description}. ${keyPoints.join(". ")}`;
    const cleanText = bersihkanTeksUntukSuara(personalize(textToSpeak, studentName));
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ms-MY";
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 block">
              Kad Visual Pembelajaran
            </span>
            <h3 className="text-base font-black text-amber-300">
              {personalize(title, studentName)}
            </h3>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSpeak}
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl border border-stone-700 text-xs font-bold flex items-center gap-1.5"
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Henti</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dengar</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Image Banner / Visual Hero */}
      <div className="relative group rounded-2xl overflow-hidden border-2 border-stone-800 bg-black/60 shadow-xl">
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-h-[60vh] object-contain mx-auto bg-stone-950/80 transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <button
              onClick={() => setIsZoomed(true)}
              className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-800 text-amber-300 rounded-xl border border-stone-700 backdrop-blur-md opacity-90 hover:opacity-100 transition-all flex items-center gap-1 text-xs font-black shadow-lg"
              title="Besarkan Imej"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Besarkan</span>
            </button>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-stone-900 border border-pink-500/20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-pink-200">
              {personalize(title, studentName)}
            </h4>
            <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
              Infografik ini memberikan gambaran visual bagi topik ini.
            </p>
          </div>
        )}
      </div>

      {/* Short Description */}
      {description && (
        <div className="p-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Penerangan Ringkas</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-200 font-semibold leading-relaxed">
            {personalize(description, studentName)}
          </p>
        </div>
      )}

      {/* Key Points Badges / Cards */}
      {keyPoints.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Poin Pembelajaran Utama
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyPoints.map((pt, idx) => (
              <div
                key={idx}
                className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-amber-100 font-bold leading-snug">
                  {personalize(pt, studentName)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Labels / Elements */}
      {visualLabels.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-pink-400" />
            Fokus Elemen Visual
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {visualLabels.map((lbl, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-900/80 border border-stone-800 hover:border-pink-500/30 rounded-xl space-y-1 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lbl.icon || "📌"}</span>
                  <h5 className="text-xs font-black text-pink-300">
                    {personalize(lbl.label || lbl.heading || "", studentName)}
                  </h5>
                </div>
                {(lbl.detail || lbl.content) && (
                  <p className="text-[11px] text-stone-300 font-semibold leading-relaxed pl-6">
                    {personalize(lbl.detail || lbl.content || "", studentName)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Action Button */}
      {onCompleted && (
        <Button
          onClick={onCompleted}
          className={`w-full h-14 font-black text-base rounded-2xl border-b-4 transition-all active:translate-y-1 flex items-center justify-center gap-2 ${
            isCompleted
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800"
              : "bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-emerald-700 shadow-lg shadow-emerald-500/20"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isCompleted ? "Infografik Selesai ✓" : "Selesai Infografik! 📊"}</span>
        </Button>
      )}

      {/* Image Fullscreen Zoom Modal */}
      {isZoomed && imageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-3 bg-stone-800/80 hover:bg-stone-700 text-white rounded-full border border-stone-600"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-auto rounded-2xl border border-stone-800 bg-stone-950 p-2">
            <img src={imageUrl} alt={title} className="w-full h-auto object-contain rounded-xl" />
          </div>
          <p className="text-xs text-stone-400 font-bold">{personalize(title, studentName)}</p>
        </div>
      )}
    </div>
  );
}
