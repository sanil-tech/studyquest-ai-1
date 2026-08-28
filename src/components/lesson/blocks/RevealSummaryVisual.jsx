// src/components/lesson/blocks/RevealSummaryVisual.jsx
// Interactive tap-to-reveal summary chips: child taps each card to uncover
// a key takeaway, making consolidation active rather than passive reading.

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function RevealSummaryVisual({ points = [], studentName, personalizeFn }) {
  const [revealed, setRevealed] = useState(new Set());

  const toggle = (idx) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!points.length) return null;

  const allRevealed = revealed.size === points.length;

  return (
    <div className="space-y-2">
      {points.map((pt, idx) => {
        const isRevealed = revealed.has(idx);
        const text = personalizeFn ? personalizeFn(pt, studentName) : pt;
        return (
          <motion.button
            key={idx}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => toggle(idx)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              isRevealed
                ? "bg-amber-950/40 border-amber-500/40"
                : "bg-stone-950 border-stone-800 hover:border-amber-500/50"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0 transition-all ${
                isRevealed ? "bg-amber-500/30" : "bg-stone-800"
              }`}
            >
              {isRevealed ? "💡" : "❓"}
            </span>
            {isRevealed ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold text-amber-100 leading-relaxed"
              >
                {text}
              </motion.p>
            ) : (
              <p className="text-xs font-black text-stone-500">
                Tekan untuk buka rahsia #{idx + 1}
              </p>
            )}
          </motion.button>
        );
      })}
      {allRevealed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11px] font-black text-emerald-300"
        >
          🎉 Semua rahsia terbuka! Syabas!
        </motion.p>
      )}
    </div>
  );
}