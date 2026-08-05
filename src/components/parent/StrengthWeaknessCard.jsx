// src/components/parent/StrengthWeaknessCard.jsx
// Displays child strengths (🌟) and needs support areas (🎯) for Parent Intelligence Dashboard

import React from "react";
import { Sparkles, Target } from "lucide-react";

export default function StrengthWeaknessCard({ strengths = [], weaknesses = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {/* 🌟 STRENGTHS CARD */}
      <div className="p-5 bg-gradient-to-br from-emerald-950/30 via-stone-900 to-stone-950 border border-emerald-500/30 rounded-3xl space-y-3 shadow-lg">
        <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> 🌟 Kekuatan Pembelajaran
        </h3>

        {strengths.length > 0 ? (
          <div className="space-y-2">
            {strengths.map((item, idx) => (
              <div key={idx} className="p-3 bg-stone-950/80 rounded-2xl border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between font-black text-xs text-emerald-200">
                  <span>{item.subject}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{item.skill}</span>
                </div>
                <p className="text-[11px] text-stone-300 font-medium leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 font-bold py-4 text-center">
            Kekuatan topik akan dipaparkan setelah lebih banyak soalan diselesaikan.
          </p>
        )}
      </div>

      {/* 🎯 NEEDS SUPPORT CARD */}
      <div className="p-5 bg-gradient-to-br from-rose-950/30 via-stone-900 to-stone-950 border border-rose-500/30 rounded-3xl space-y-3 shadow-lg">
        <h3 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" /> 🎯 Kawasan Perlu Bimbingan
        </h3>

        {weaknesses.length > 0 ? (
          <div className="space-y-2">
            {weaknesses.map((item, idx) => (
              <div key={idx} className="p-3 bg-stone-950/80 rounded-2xl border border-rose-500/20 space-y-1">
                <div className="flex items-center justify-between font-black text-xs text-rose-200">
                  <span>{item.subject}</span>
                  <span className="text-[10px] text-rose-400 font-bold">{item.skill}</span>
                </div>
                <p className="text-[11px] text-stone-300 font-medium leading-relaxed">
                  <strong className="text-rose-400">Diagnosis:</strong> {item.misconception}
                </p>
                <p className="text-[10px] text-cyan-300 font-bold pt-1 border-t border-stone-800">
                  💡 Cadangan: {item.recommended_action}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 font-bold py-4 text-center">
            Tiada kelemahan ketara ditemui buat masa ini! 🎉
          </p>
        )}
      </div>
    </div>
  );
}
