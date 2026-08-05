import React from 'react';
import { CheckCircle2, Archive, Wrench } from 'lucide-react';

const LessonHealthCard = ({ lesson, onRepair, onArchive }) => {
  const isHealthy = lesson.status === "Healthy";
  
  return (
    <div className={`p-5 rounded-2xl border ${isHealthy ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              SP: {lesson.sp_code}
            </span>
            <span className="text-xs font-mono text-stone-500">{lesson.id}</span>
          </div>
          <h4 className="font-bold text-white text-sm">{lesson.title}</h4>
        </div>
        
        <div className={`text-xl font-black ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
          {lesson.score}
        </div>
      </div>

      {!isHealthy && lesson.missing_elements.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase font-bold text-stone-500 mb-1.5">Missing Elements:</p>
          <div className="flex flex-wrap gap-1.5">
            {lesson.missing_elements.map(el => (
              <span key={el} className="bg-rose-950 border border-rose-900/50 text-rose-300 text-[9px] px-1.5 py-0.5 rounded font-mono">
                {el}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        {isHealthy ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold w-full justify-center py-1.5">
            <CheckCircle2 className="w-4 h-4" /> Ready for Pilot
          </div>
        ) : (
          <>
            <button 
              onClick={() => onRepair(lesson)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" /> AI Repair
            </button>
            <button 
              onClick={() => onArchive(lesson)}
              className="px-3 bg-stone-900 hover:bg-stone-800 text-stone-400 py-1.5 rounded-lg text-xs font-bold transition-colors"
              title="Archive Lesson"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonHealthCard;
