import React, { useState, useEffect } from 'react';
import { getRepairQueue, generateRepairInstruction } from '../../services/lessonAuditService';
import { Wrench, Terminal, Bot } from 'lucide-react';

const LessonRepairQueue = () => {
  const [queue, setQueue] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    getRepairQueue().then(setQueue);
  }, []);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Wrench className="w-5 h-5 text-amber-400" /> AI Repair Queue
      </h3>
      
      <div className="space-y-3">
        {queue.length === 0 ? (
          <p className="text-stone-500 text-sm">No lessons currently in repair queue.</p>
        ) : (
          queue.map(lesson => (
            <div key={lesson.id} className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                  {lesson.sp_code}
                </span>
                <button 
                  onClick={() => setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)}
                  className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300"
                >
                  {selectedLesson?.id === lesson.id ? 'Close Prompt' : 'View AI Prompt'}
                </button>
              </div>
              <p className="text-sm font-medium text-stone-300">{lesson.title}</p>
              
              {selectedLesson?.id === lesson.id && (
                <div className="mt-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-10">
                    <Bot className="w-12 h-12 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-mono text-indigo-400">AI Content Engine Instructions</span>
                  </div>
                  <pre className="text-xs text-indigo-200 font-mono whitespace-pre-wrap relative z-10">
                    {generateRepairInstruction(lesson)}
                  </pre>
                  <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-xs transition-colors relative z-10">
                    Send to Engine
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonRepairQueue;
