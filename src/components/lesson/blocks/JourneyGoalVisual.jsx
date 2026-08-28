// src/components/lesson/blocks/JourneyGoalVisual.jsx
// Interactive 3-node mission path: child taps each milestone to "activate"
// their learning goal journey (Tengok → Faham → Boleh!).

import React, { useState } from "react";
import { motion } from "framer-motion";

const NODES = [
  { emoji: "👀", label: "Tengok" },
  { emoji: "🤔", label: "Faham" },
  { emoji: "✅", label: "Boleh!" },
];

export default function JourneyGoalVisual() {
  const [active, setActive] = useState(0);

  return (
    <div className="p-3 bg-stone-950/60 rounded-2xl border border-indigo-500/20">
      <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 text-center">
        🗺️ Laluan Misi Saya
      </p>
      <div className="flex items-center justify-between gap-1">
        {NODES.map((node, idx) => {
          const isActive = idx <= active;
          return (
            <React.Fragment key={idx}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setActive(idx)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                    isActive
                      ? "bg-indigo-500/30 border-indigo-400 shadow-lg shadow-indigo-500/30"
                      : "bg-stone-900 border-stone-700"
                  }`}
                >
                  {isActive ? node.emoji : "🔒"}
                </div>
                <span
                  className={`text-[10px] font-black ${isActive ? "text-indigo-300" : "text-stone-500"}`}
                >
                  {node.label}
                </span>
              </motion.button>
              {idx < NODES.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-all ${idx < active ? "bg-indigo-500" : "bg-stone-700"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {active >= NODES.length - 1 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-black text-emerald-300 mt-2"
        >
          🎯 Sedia untuk mula!
        </motion.p>
      )}
    </div>
  );
}