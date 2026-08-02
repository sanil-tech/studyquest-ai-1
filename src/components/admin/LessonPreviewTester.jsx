import React, { useState } from 'react';
import rules from '../../data/pilotReadinessRules.json';
import { Eye, CheckSquare, Square, ThumbsUp } from 'lucide-react';

const LessonPreviewTester = () => {
  const [activeChecks, setActiveChecks] = useState({});

  const toggleCheck = (item) => {
    setActiveChecks(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const allPassed = rules.qa_checklist.every(item => activeChecks[item]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
        <Eye className="w-5 h-5 text-indigo-400" /> Human QA Tester
      </h3>
      <p className="text-xs text-stone-400 mb-6">Verify human-readable quality and flow before version approval.</p>

      <div className="space-y-3">
        {rules.qa_checklist.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleCheck(item)}
            className="w-full flex items-center gap-3 p-3 bg-stone-950 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors text-left group"
          >
            {activeChecks[item] ? (
              <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-600 group-hover:text-stone-500 shrink-0 transition-colors" />
            )}
            <span className={`text-sm font-medium transition-colors ${activeChecks[item] ? 'text-stone-300 line-through opacity-70' : 'text-stone-200'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-stone-800">
        <button
          disabled={!allPassed}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            allPassed 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {allPassed ? "Sign Off QA" : "Complete Manual QA"}
        </button>
      </div>
    </div>
  );
};

export default LessonPreviewTester;
