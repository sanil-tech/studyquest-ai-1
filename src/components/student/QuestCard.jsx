import React from 'react';
import { Play, Star, Trophy, Sparkles } from 'lucide-react';

const QuestCard = ({ questData, onStart }) => {
  if (!questData) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-stone-950 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      
      {/* Sparkle effects */}
      <div className="absolute top-0 right-0 p-4 opacity-50 transition-transform group-hover:scale-110 group-hover:rotate-12">
        <Sparkles className="w-24 h-24 text-indigo-500/20" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">
            <Trophy className="w-3 h-3" /> Cabaran Hari Ini
          </div>
          
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {questData.narrative.title}
            </h3>
            <p className="text-sm sm:text-base text-indigo-200 mt-2 font-medium">
              {questData.narrative.desc}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 bg-stone-900/50 px-3 py-1.5 rounded-xl border border-stone-800">
              <span className="text-xs font-bold text-stone-400">Ganjaran:</span>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                {questData.rewards.xp} XP
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-900/50 px-3 py-1.5 rounded-xl border border-stone-800">
              <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                {questData.rewards.stars} <Star className="w-4 h-4 fill-amber-400" />
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm rounded-2xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50"
        >
          Mula Pengembaraan <Play className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default QuestCard;
