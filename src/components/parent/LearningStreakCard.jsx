// src/components/parent/LearningStreakCard.jsx
// Displays child learning streak activity (🔥), current/longest streak, and weekly checkmarks

import React from "react";
import { Flame, Calendar, CheckCircle2 } from "lucide-react";

export default function LearningStreakCard({ currentStreak = 0, longestStreak = 14, weeklyActivity = [] }) {
  const days = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
  const activeDays = weeklyActivity.length > 0 ? weeklyActivity : [true, true, true, true, true, false, false];

  return (
    <div className="p-6 bg-gradient-to-br from-orange-950/30 via-stone-900 to-stone-950 border border-orange-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> 🔥 Streak Pembelajaran Konsisten
        </h3>
        <span className="text-xs font-black text-amber-300 bg-orange-950/80 border border-orange-500/30 px-3 py-1 rounded-full">
          {currentStreak} Hari Streak
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Streak Semasa</span>
          <span className="text-xl font-black text-orange-400">{currentStreak} Hari</span>
        </div>
        <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
          <span className="text-[10px] font-black uppercase text-stone-400 block">Rekod Tertinggi</span>
          <span className="text-xl font-black text-amber-300">{Math.max(currentStreak, longestStreak)} Hari</span>
        </div>
      </div>

      {/* Weekly Activity Checklist */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
          Aktiviti Mingguan
        </span>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {days.map((day, idx) => {
            const isActive = activeDays[idx] !== undefined ? activeDays[idx] : idx < 5;
            return (
              <div
                key={day}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  isActive
                    ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
                    : "bg-stone-950 border-stone-800 text-stone-600"
                }`}
              >
                <span className="text-[9px] font-black uppercase">{day.slice(0, 3)}</span>
                <span className="text-sm">{isActive ? "✅" : "❌"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
