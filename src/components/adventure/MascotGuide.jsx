import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, X } from "lucide-react";

/**
 * MascotGuide Component
 * 
 * Contextual companion featuring "Otan" (Borneo Orangutan) AI Guide & Learning Companion.
 * 
 * @param {Object} props
 * @param {string} props.message - Message or tip text from Otan
 * @param {string} props.emotion - Emotion/state ('excited' | 'curious' | 'thinking' | 'encourage' | 'encouraging' | 'happy' | 'celebrate' | 'proud')
 * @param {boolean} props.visible - Toggle visibility
 * @param {Function} props.onClose - Optional close callback
 * @param {Function} props.onRequestHint - Optional callback to trigger AI hint
 */
export function MascotGuide({
  message = "Selamat bertualang, Pengembara!",
  emotion = "happy",
  visible = true,
  onClose,
  onRequestHint
}) {
  if (!visible) return null;

  const getEmotionConfig = () => {
    switch (emotion) {
      case "excited":
        return {
          badge: "🔥 Otan Teruja!",
          avatar: "🦧",
          accent: "from-amber-500 to-orange-500",
          border: "border-amber-400 shadow-amber-500/20"
        };
      case "curious":
        return {
          badge: "🧐 Otan Ingin Tahu",
          avatar: "🦧",
          accent: "from-yellow-500 to-amber-600",
          border: "border-yellow-400/60"
        };
      case "thinking":
        return {
          badge: "💡 Petunjuk Otan",
          avatar: "🦧",
          accent: "from-indigo-600 to-amber-600",
          border: "border-indigo-400/60"
        };
      case "encourage":
      case "encouraging":
        return {
          badge: "💪 Semangat!",
          avatar: "🦧",
          accent: "from-emerald-500 to-amber-600",
          border: "border-emerald-400/60"
        };
      case "celebrate":
      case "proud":
        return {
          badge: "🎉 Tahniah!",
          avatar: "🦧",
          accent: "from-amber-400 via-orange-500 to-amber-600",
          border: "border-amber-400 shadow-amber-500/30 animate-pulse"
        };
      case "happy":
      default:
        return {
          badge: "🦧 Otan",
          avatar: "🦧",
          accent: "from-amber-500 to-orange-600",
          border: "border-amber-500/40"
        };
    }
  };

  const config = getEmotionConfig();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-900/80 border-2 ${config.border} rounded-3xl p-4 shadow-2xl backdrop-blur-md text-amber-100 flex items-start gap-4 my-4 overflow-hidden`}
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot Avatar */}
        <div className="relative shrink-0 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${config.accent} p-0.5 shadow-lg flex items-center justify-center text-3xl sm:text-4xl border-2 border-amber-200`}
          >
            {config.avatar}
          </motion.div>
          <span className="mt-1 text-[10px] font-black tracking-wider uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
            Otan
          </span>
        </div>

        {/* Speech Bubble / Guidance Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {config.badge}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-amber-200 transition-colors p-1"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-amber-50 leading-relaxed font-sans">
            "{message}"
          </p>

          {onRequestHint && (
            <button
              onClick={onRequestHint}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold rounded-xl border border-amber-500/30 transition-all active:scale-95"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Minta Petunjuk Otan
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
