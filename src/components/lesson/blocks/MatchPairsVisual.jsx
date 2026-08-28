// src/components/lesson/blocks/MatchPairsVisual.jsx
// Interactive one-to-one matching visual for the CPA Pictorial stage.
// Child taps a top object then a bottom object to "padankan" (match) them.
// Leftover (unmatched) top objects reveal which group is "BANYAK" (more).

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function MatchPairsVisual({
  topItems = ["🔴", "🔴", "🔴", "🔴", "🔴"],
  bottomItems = ["🔵", "🔵", "🔵"],
  topLabel = "Guli Merah",
  bottomLabel = "Guli Biru",
}) {
  const [pairs, setPairs] = useState([]);
  const [selTop, setSelTop] = useState(null);

  const matchedTop = new Set(pairs.map((p) => p.topIdx));
  const matchedBottom = new Set(pairs.map((p) => p.bottomIdx));
  const leftoverTop = topItems.length - matchedTop.size;
  const allMatched = matchedBottom.size === bottomItems.length;

  const handleTop = (idx) => {
    if (matchedTop.has(idx)) return;
    setSelTop(idx);
  };

  const handleBottom = (idx) => {
    if (matchedBottom.has(idx) || selTop === null) return;
    setPairs((prev) => [...prev, { topIdx: selTop, bottomIdx: idx }]);
    setSelTop(null);
  };

  const reset = () => {
    setPairs([]);
    setSelTop(null);
  };

  const resultText = allMatched
    ? leftoverTop > 0
      ? `Ada ${leftoverTop} guli merah tinggal → MERAH BANYAK! 🔥`
      : `Sama banyak! (${topItems.length} = ${bottomItems.length})`
    : selTop !== null
      ? "Sekarang tekan guli biru untuk padankan!"
      : "Tekan guli merah dulu untuk padankan!";

  const renderRow = (items, label, matchedSet, onClick, accent, isBottom) => (
    <div className={`p-2.5 rounded-2xl border ${accent} bg-stone-950/60`}>
      <p className="text-[10px] font-black text-stone-400 uppercase mb-1.5 text-center">{label}</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {items.map((e, idx) => {
          const isMatched = matchedSet.has(idx);
          const isSelected = !isBottom && selTop === idx;
          return (
            <motion.button
              key={idx}
              type="button"
              whileTap={{ scale: 1.25 }}
              onClick={() => onClick(idx)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all border-2 ${
                isMatched
                  ? "bg-stone-900 border-stone-700 opacity-30"
                  : isSelected
                    ? "bg-amber-500/30 border-amber-400 scale-110"
                    : isBottom
                      ? "bg-stone-900 border-cyan-600/40 hover:border-cyan-400"
                      : "bg-stone-900 border-rose-600/40 hover:border-rose-400"
              }`}
            >
              {isMatched ? "✅" : e}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {renderRow(topItems, topLabel, matchedTop, handleTop, "border-rose-500/30", false)}
      {renderRow(bottomItems, bottomLabel, matchedBottom, handleBottom, "border-cyan-500/30", true)}
      <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-center space-y-1.5">
        <motion.p
          key={resultText}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs font-black text-amber-300"
        >
          {resultText}
        </motion.p>
        {allMatched && (
          <button
            type="button"
            onClick={reset}
            className="text-[10px] font-bold text-stone-400 hover:text-amber-300 underline"
          >
            ↺ Cuba lagi
          </button>
        )}
      </div>
    </div>
  );
}