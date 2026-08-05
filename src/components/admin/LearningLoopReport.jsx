import React from 'react';
import { AlertCircle, PlayCircle } from 'lucide-react';

const LearningLoopReport = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 flex flex-col items-center justify-center h-full text-center">
        <PlayCircle className="w-12 h-12 text-stone-700 mb-4" />
        <p className="text-stone-500 font-medium max-w-xs">Select a virtual learner and run the drill to view the end-to-end journey.</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-black text-white mb-6">Simulation Timeline</h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative">
        <div className="absolute top-4 bottom-4 left-4 w-px bg-stone-800" />
        
        {logs.map((log, index) => (
          <div key={log.id} className="relative pl-10">
            <div className={`absolute left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 border-stone-900 ${
              log.status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
            
            <div className={`bg-stone-950 border p-4 rounded-xl transition-all ${
              log.status === 'PASS' ? 'border-stone-800 hover:border-stone-700' : 'border-rose-900/50 bg-rose-950/10'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  log.status === 'PASS' ? 'bg-stone-800 text-stone-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {log.stage.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-600 font-mono">{log.time}</span>
              </div>
              <p className={`text-sm ${log.status === 'PASS' ? 'text-stone-300' : 'text-rose-300'}`}>
                {log.detail}
              </p>
              
              {log.status === 'FAIL' && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" /> Pipeline Handoff Failed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningLoopReport;
