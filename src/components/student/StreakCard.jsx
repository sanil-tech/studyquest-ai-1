import React from 'react';
import { Flame } from 'lucide-react';

const StreakCard = ({ streakDays }) => {
  const isActive = streakDays > 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
      isActive 
        ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' 
        : 'bg-stone-900/50 border-stone-800'
    }`}>
      <div className={`p-2 rounded-xl ${isActive ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-stone-800'}`}>
        <Flame className={`w-5 h-5 ${isActive ? 'text-white fill-white animate-pulse' : 'text-stone-500'}`} />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Streak Semasa</div>
        <div className={`font-black ${isActive ? 'text-orange-400' : 'text-stone-500'}`}>
          {streakDays} {streakDays === 1 ? 'Hari' : 'Hari'}
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
