// src/components/lesson/blocks/TapCountVisual.jsx
// Interactive tap-to-count visual: child taps objects to count and compare
// quantities (banyak / sedikit / sama banyak). Designed for phone screens.

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TapCountVisual({
  emojisA = ["🍎", "🍎", "🍎", "🍎", "🍎"],
  emojisB = ["🍪", "🍪", "🍪"],
  labelA = "Kumpulan A",
  labelB = "Kumpulan B",
}) {
  const [countedA, setCountedA] = useState(new Set());
  const [countedB, setCountedB] = useState(new Set());

  const toggle = (setter, idx) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const ca = countedA.size;
  const cb = countedB.size;

  const comparison =
    ca === 0 && cb === 0
      ? "👆 Tekan objek untuk kira!"
      : ca > cb
        ? `A lebih BANYAK! (${ca} > ${cb})`
        : ca < cb
          ? `B lebih BANYAK! (${cb} > ${ca})`
          : `Sama banyak! (${ca} = ${cb})`;

  const renderGroup = (emojis, counted, setter, label, accent) => (
    <div className={`p-3 rounded-2xl border ${accent} bg-stone-950/60`}>
      <p className="text-[10px] font-black text-stone-400 uppercase mb-2 text-center">{label}</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {emojis.map((e, idx) => {
          const isCounted = counted.has(idx);
          return (
            <motion.button
              key={idx}
              type="button"
              whileTap={{ scale: 1.35 }}
              onClick={() => toggle(setter, idx)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                isCounted
                  ? "bg-amber-500/30 border-2 border-amber-400"
                  : "bg-stone-900 border border-stone-700 opacity-60"
              }`}
            >
              {e}
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-xs font-black text-amber-300 mt-2">
        Kira: {counted.size} / {emojis.length}
      </p>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {renderGroup(emojisA, countedA, setCountedA, labelA, "border-amber-500/30")}
        {renderGroup(emojisB, countedB, setCountedB, labelB, "border-cyan-500/30")}
      </div>
      <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-700 text-center">
        <motion.p
          key={comparison}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs font-black text-amber-300"
        >
          {comparison}
        </motion.p>
      </div>
    </div>
  );
}