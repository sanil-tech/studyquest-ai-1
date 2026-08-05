import React from 'react';
import { CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';

const LearningFlowReport = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-stone-800">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" /> Simulation Results
          </h3>
          <p className="text-sm text-stone-400 mt-1">Profile: <strong className="text-stone-300">{result.profileName}</strong> | SP: <strong className="text-stone-300">{result.targetSp}</strong></p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400">{result.finalScore}%</div>
          <div className="text-[10px] uppercase font-bold text-stone-500">Final Assessment</div>
        </div>
      </div>

      <div className="relative">
        {/* Connector Line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-stone-800" />

        <div className="space-y-6">
          {result.steps.map((step, idx) => (
            <div key={step.id} className="relative flex gap-4 pl-10 group">
              {/* Node */}
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-stone-950 border-2 border-stone-800 flex items-center justify-center z-10 transition-colors group-hover:border-indigo-500">
                {step.status === 'PASS' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex-1 transition-all group-hover:border-stone-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {step.module}
                    </span>
                    <span className="text-sm font-bold text-stone-200">{step.action}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm font-medium text-emerald-400 mb-1">{step.result}</div>
                <p className="text-xs text-stone-400 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-stone-800 flex justify-between items-center">
        <span className="text-sm font-bold text-stone-400">Final Mastery State:</span>
        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          result.finalState === 'MASTERED' ? 'bg-emerald-500/20 text-emerald-400' :
          result.finalState === 'REVIEW_REQUIRED' ? 'bg-rose-500/20 text-rose-400' :
          'bg-amber-500/20 text-amber-400'
        }`}>
          {result.finalState}
        </span>
      </div>
    </div>
  );
};

export default LearningFlowReport;
