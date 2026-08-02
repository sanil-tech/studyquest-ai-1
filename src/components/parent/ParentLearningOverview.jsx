// src/components/parent/ParentLearningOverview.jsx
// Displays child profile summary card for Parent Intelligence Dashboard

import React from "react";
import { Sparkles, Trophy, Award, BookOpen } from "lucide-react";

export default function ParentLearningOverview({ childProfile, learningProgress }) {
  if (!childProfile) return null;

  const { nickname, avatar, level, total_xp } = childProfile;
  const { quizzes_completed = 0, average_score = 0 } = learningProgress || {};

  return (
    <div className="p-6 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-2 border-stone-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-lg shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
            {avatar || "🐢"}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-500/20">
              Profil Anak
            </span>
            <span className="text-xs font-bold text-stone-400">
              Level {level} Explorer
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{nickname}</h2>
          <div className="flex items-center gap-3 text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1 text-amber-400">
              <Trophy className="w-3.5 h-3.5" /> {total_xp} XP
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <BookOpen className="w-3.5 h-3.5" /> {quizzes_completed} Misi Selesai
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-2xl text-center self-stretch sm:self-auto flex items-center justify-center gap-4 px-6">
        <div>
          <span className="text-[10px] font-black uppercase text-stone-400 block">Purata Skor</span>
          <span className="text-xl font-black text-amber-300">{average_score}%</span>
        </div>
      </div>
    </div>
  );
}
