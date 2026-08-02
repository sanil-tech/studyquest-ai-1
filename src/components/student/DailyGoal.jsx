import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { getDailyGoalStatus } from '../../services/retentionService';

const DailyGoal = ({ questsCompletedToday }) => {
  const goalStatus = getDailyGoalStatus(questsCompletedToday);

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      goalStatus.isCompleted 
        ? 'bg-emerald-500/10 border-emerald-500/30' 
        : 'bg-stone-900/80 border-stone-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${
          goalStatus.isCompleted ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-500'
        }`}>
          {goalStatus.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Sasaran Harian</div>
          <div className={`font-black ${goalStatus.isCompleted ? 'text-emerald-400' : 'text-white'}`}>
            {goalStatus.title}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-stone-300">
            {goalStatus.current} / {goalStatus.target}
          </div>
        </div>
      </div>
      
      {/* Mini Progress Bar */}
      <div className="mt-3 h-1.5 bg-stone-950 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${goalStatus.isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'}`}
          style={{ width: `${(goalStatus.current / goalStatus.target) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default DailyGoal;
