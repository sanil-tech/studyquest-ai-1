import React from 'react';
import { ShieldAlert, Wrench, CheckCircle } from 'lucide-react';

const FailurePointReport = ({ error, drillRan, isSuccess }) => {
  
  if (!drillRan) return null;

  if (isSuccess && !error) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-3xl p-6 mt-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-emerald-400 font-bold">Pipeline Verified</h4>
          <p className="text-sm text-emerald-500/70">All system handoffs completed successfully. No data dropped.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-6 mt-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-rose-900/50 rounded-full flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h4 className="text-rose-400 font-bold text-lg">E2E Pipeline Failure Detected</h4>
          <p className="text-sm text-rose-300/70 mt-1">The end-to-end validation service caught an unhandled exception during the simulated handoff between services.</p>
        </div>
      </div>
      
      <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl font-mono text-sm text-rose-300">
        {"> "}{error}
      </div>

      <div className="mt-4 flex gap-3">
        <button className="bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-stone-700 transition-colors">
          <Wrench className="w-4 h-4" /> Create Bug Ticket
        </button>
      </div>
    </div>
  );
};

export default FailurePointReport;