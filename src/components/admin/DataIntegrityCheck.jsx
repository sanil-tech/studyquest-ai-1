import React, { useState, useEffect } from 'react';
import { runDataIntegrityCheck } from '../../services/healthCheckService';
import { Database, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DataIntegrityCheck = () => {
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const runCheck = async () => {
    setIsChecking(true);
    const res = await runDataIntegrityCheck();
    setResult(res);
    setIsChecking(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" /> Data Integrity
        </h3>
        <button 
          onClick={runCheck}
          disabled={isChecking}
          className="p-2 hover:bg-stone-800 rounded-lg transition-colors text-stone-400 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isChecking ? (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-stone-400 text-sm">Validating records...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center">
              <div className="text-2xl font-black text-white">{result.totalScanned}</div>
              <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Records Scanned</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${result.issuesFound > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className={`text-2xl font-black ${result.issuesFound > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.issuesFound}
              </div>
              <div className={`text-[10px] uppercase font-bold mt-1 ${result.issuesFound > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                Issues Found
              </div>
            </div>
          </div>

          {result.issuesFound === 0 ? (
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-200">All data structures verified successfully. No missing fields or broken relationships detected.</p>
            </div>
          ) : (
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" /> Validation Errors
              </h4>
              <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                {result.issuesList.map((issue, idx) => (
                  <li key={idx} className="text-xs text-stone-400 flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DataIntegrityCheck;
