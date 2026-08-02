import React from 'react';
import { passAcceptanceTest } from '../../services/alphaOperationsService';
import { ShieldCheck, CheckCircle2, Circle } from 'lucide-react';

const FounderAcceptanceRunner = ({ tests, onUpdate }) => {
  if (!tests) return null;

  const handlePass = async (id) => {
    const updated = await passAcceptanceTest(id);
    onUpdate(updated);
  };

  const isReady = tests.every(t => t.passed);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" /> Founder Acceptance
        </h3>
        <p className="text-sm text-stone-400 mt-1">Manual E2E verification required before Alpha Launch.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {tests.map(test => (
          <div key={test.id} className={`p-4 rounded-xl border transition-all ${
            test.passed ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700'
          }`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className={`font-bold mb-1 ${test.passed ? 'text-indigo-300' : 'text-white'}`}>{test.name}</h4>
                <p className="text-xs text-stone-500">{test.description}</p>
              </div>
              <button
                onClick={() => handlePass(test.id)}
                disabled={test.passed}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  test.passed 
                    ? 'bg-indigo-600/20 text-indigo-400 cursor-default'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 hover:border-stone-500'
                }`}
              >
                {test.passed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                {test.passed ? 'Verified' : 'Sign Off'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-stone-800 shrink-0">
        {isReady ? (
          <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Cleared for Alpha Launch
          </div>
        ) : (
          <div className="bg-stone-950 border border-stone-800 text-stone-500 p-4 rounded-xl text-center font-bold text-sm">
            Complete all tests to unlock Alpha
          </div>
        )}
      </div>
    </div>
  );
};

export default FounderAcceptanceRunner;
