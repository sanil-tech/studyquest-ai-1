import React from 'react';
import { generateTimeline } from '../../services/learningEvidenceService';
import { History, TrendingUp, CheckCircle2 } from 'lucide-react';

const LearningTimeline = ({ studentId }) => {
  let timeline = [];
  try {
    timeline = generateTimeline(studentId);
  } catch (e) {
    return null;
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <TrendingUp className="w-48 h-48 text-indigo-500" />
      </div>

      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-8 relative z-10">
        <History className="w-5 h-5 text-indigo-400" /> Bukti Pembelajaran
      </h3>

      <div className="relative z-10 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-700 before:to-transparent">
        {timeline.map((event, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-stone-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
              event.highlight ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-stone-800 bg-stone-950/80 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${event.highlight ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {event.stage}
                </span>
                {event.score && (
                  <span className={`text-xs font-black ${event.highlight ? 'text-emerald-400' : 'text-stone-400'}`}>
                    {event.score}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white mb-1">{event.title}</h4>
              <p className="text-xs text-stone-400 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningTimeline;
