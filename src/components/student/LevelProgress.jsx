import React from 'react';
import { Zap, Shield } from 'lucide-react';
import { calculateLevel } from '../../services/gamificationService';

const LevelProgress = ({ totalXp }) => {
  const { level, progressPercentage } = calculateLevel(totalXp);

  return (
    <div className="flex items-center gap-4 bg-stone-900/80 px-4 py-2 rounded-2xl border border-stone-800">
      
      {/* Level Badge */}
      <div className="relative">
        <Shield className="w-10 h-10 text-emerald-500 fill-emerald-950" />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-400">
          {level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tahap {level}</span>
          <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> {totalXp} XP
          </span>
        </div>
        
        <div className="h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
    </div>
  );
};

export default LevelProgress;
