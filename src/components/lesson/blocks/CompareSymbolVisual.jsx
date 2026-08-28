// src/components/lesson/blocks/CompareSymbolVisual.jsx
// Interactive comparison-symbol reveal for the CPA Abstract stage.
// Bridges concrete counts → abstract symbol: child taps the centre to
// reveal > , < or = between two quantities.

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function CompareSymbolVisual({
  leftCount = 5,
  rightCount = 3,
  leftLabel = "Merah",
  rightLabel = "Biru",
}) {
  const [revealed, setRevealed] = useState(false);

  const symbol = leftCount > rightCount ? ">" : leftCount < rightCount ? "<" : "=";
  const word =
    leftCount > rightCount ? "Lebih Banyak" : leftCount < rightCount ? "Kurang" : "Sama Banyak";

  return (
    <div className="p-3 bg-stone-950/60 rounded-2xl border border-indigo-500/20 space-y-2">
      <div className="flex items-center justify-center gap-2.5">
        <div className="text-center">
          <p className="text-2xl font-black text-rose-300">{leftCount}</p>
          <p className="text-[10px] font-bold text-stone-400">{leftLabel}</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 1.25 }}
          onClick={() => setRevealed(true)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transition-all ${
            revealed
              ? "bg-indigo-500/30 border-indigo-400 text-indigo-200"
              : "bg-stone-900 border-stone-700 text-stone-500 hover:border-indigo-400"
          }`}
        >
          {revealed ? symbol : "?"}
        </motion.button>
        <div className="text-center">
          <p className="text-2xl font-black text-cyan-300">{rightCount}</p>
          <p className="text-[10px] font-bold text-stone-400">{rightLabel}</p>
        </div>
      </div>
      {revealed ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-black text-indigo-300"
        >
          {leftCount} {symbol} {rightCount} → {word}! 🎯
        </motion.p>
      ) : (
        <p className="text-center text-[10px] font-bold text-stone-500">
          Tekan kotak ❓ untuk lihat simbol
        </p>
      )}
    </div>
  );
}