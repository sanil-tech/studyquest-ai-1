import React, { useState, useEffect } from 'react';
import { getMissingSps, triggerGeneration } from '../../services/contentFactoryService';
import { Bot, Zap, Loader2 } from 'lucide-react';

const LessonGenerationQueue = ({ onGenerateComplete }) => {
  const [missingSps, setMissingSps] = useState([]);
  const [generatingCode, setGeneratingCode] = useState(null);

  const fetchQueue = async () => {
    const data = await getMissingSps();
    setMissingSps(data);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleGenerate = async (spCode) => {
    setGeneratingCode(spCode);
    try {
      await triggerGeneration(spCode);
      await fetchQueue();
      if (onGenerateComplete) {
        onGenerateComplete();
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingCode(null);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Bot className="w-5 h-5 text-indigo-400" /> AI Generation Queue
      </h3>

      <div className="space-y-3">
        {missingSps.length === 0 ? (
          <p className="text-stone-500 text-sm">No missing SPs detected. Curriculum fully covered.</p>
        ) : (
          missingSps.map(sp => (
            <div key={sp.sp_code} className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                    MISSING: {sp.sp_code}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">{sp.subject} - {sp.year}</span>
                </div>
                <div className="text-sm font-bold text-stone-200">{sp.topic}</div>
              </div>
              
              <button
                onClick={() => handleGenerate(sp.sp_code)}
                disabled={generatingCode !== null}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  generatingCode === sp.sp_code
                    ? 'bg-indigo-600 text-white cursor-wait'
                    : generatingCode !== null
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                }`}
              >
                {generatingCode === sp.sp_code ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Auto-Generate</>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonGenerationQueue;
