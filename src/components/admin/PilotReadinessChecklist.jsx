import React, { useState } from 'react';
import { systemHealthRules as rules } from '../../data/domainRules.js';
import { CheckSquare, Square, Rocket } from 'lucide-react';

const PilotReadinessChecklist = () => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = rules.readiness_checklist.every(item => checkedItems[item.id]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
        <CheckSquare className="w-5 h-5 text-emerald-400" /> Pilot Readiness
      </h3>
      <p className="text-xs text-stone-400 mb-6">Manual QA verification required before greenlighting launch.</p>

      <div className="space-y-3">
        {rules.readiness_checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-800 transition-colors text-left group"
          >
            {checkedItems[item.id] ? (
              <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-600 group-hover:text-stone-400 shrink-0 transition-colors" />
            )}
            <span className={`text-sm font-medium transition-colors ${checkedItems[item.id] ? 'text-stone-300 line-through opacity-70' : 'text-stone-200'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-stone-800">
        <button
          disabled={!allChecked}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            allChecked 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <Rocket className="w-5 h-5" />
          {allChecked ? "Greenlight Pilot Launch" : "Complete Checklist to Launch"}
        </button>
      </div>
    </div>
  );
};

export default PilotReadinessChecklist;
