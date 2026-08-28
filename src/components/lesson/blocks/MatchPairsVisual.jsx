// src/components/lesson/blocks/MatchPairsVisual.jsx
// Interactive one-to-one matching visual for the CPA Pictorial stage.
// Child taps a top object then a bottom object to "padankan" (match) them.
// A YELLOW LINE is drawn between matched pairs so "garisan kuning" is visible.
// Leftover (unmatched) top objects reveal which group is "BANYAK" (more).

import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function MatchPairsVisual({
  topItems = ["🔵", "🔵", "🔵", "🔵", "🔵"],
  bottomItems = ["🔵", "🔵", "🔵"],
  topLabel = "Guli Merah",
  bottomLabel = "Guli Biru",
}) {
  const [pairs, setPairs] = useState([]);
  const [selTop, setSelTop] = useState(null);
  const containerRef = useRef(null);
  const topRefs = useRef([]);
  const bottomRefs = useRef([]);
  const [lines, setLines] = useState([]);

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
    setLines([]);
  };

  const recomputeLines = useCallback(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const next = pairs
      .map((p) => {
        const tEl = topRefs.current[p.topIdx];
        const bEl = bottomRefs.current[p.bottomIdx];
        if (!tEl || !bEl) return null;
        const tr = tEl.getBoundingClientRect();
        const br = bEl.getBoundingClientRect();
        return {
          x1: tr.left + tr.width / 2 - cRect.left,
          y1: tr.top + tr.height / 2 - cRect.top,
          x2: br.left + br.width / 2 - cRect.left,
          y2: br.top + br.height / 2 - cRect.top,
        };
      })
      .filter(Boolean);
    setLines(next);
  }, [pairs]);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines]);

  useLayoutEffect(() => {
    const handler = () => recomputeLines();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [recomputeLines]);

  const resultText = allMatched
    ? leftoverTop > 0
      ? `Ada ${leftoverTop} ${topLabel.toLowerCase()} tinggal → ${topLabel.toUpperCase()} BANYAK! 🔥`
      : `Sama banyak! (${topItems.length} = ${bottomItems.length})`
    : selTop !== null
      ? `Sekarang tekan ${bottomLabel.toLowerCase()} untuk padankan!`
      : `Tekan ${topLabel.toLowerCase()} dulu untuk padankan!`;

  const renderRow = (items, label, refsArr, matchedSet, onClick, accent, isBottom) => (
    <div className={`p-2.5 rounded-2xl border ${accent} bg-stone-950/60`}>
      <p className="text-[10px] font-black text-stone-400 uppercase mb-1.5 text-center">{label}</p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {items.map((e, idx) => {
          const isMatched = matchedSet.has(idx);
          const isSelected = !isBottom && selTop === idx;
          return (
            <motion.button
              key={idx}
              ref={(el) => (refsArr.current[idx] = el)}
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
      <div ref={containerRef} className="relative space-y-2">
        {/* Yellow matching-line overlay (drawn between matched pairs) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: "visible" }}
        >
          {lines.map((ln, i) => (
            <line
              key={i}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke="#facc15"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="4 3"
              opacity={0.95}
            />
          ))}
        </svg>

        {renderRow(topItems, topLabel, topRefs, matchedTop, handleTop, "border-rose-500/30", false)}

        {/* Always-visible yellow line + label so "garisan kuning" is truthful */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex-1 h-0.5 bg-yellow-400/70 rounded-full" />
          <span className="text-[9px] font-black text-yellow-400 uppercase tracking-wider whitespace-nowrap">
            Garisan Kuning (Padanan 1-ke-1)
          </span>
          <div className="flex-1 h-0.5 bg-yellow-400/70 rounded-full" />
        </div>

        {renderRow(bottomItems, bottomLabel, bottomRefs, matchedBottom, handleBottom, "border-cyan-500/30", true)}
      </div>

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