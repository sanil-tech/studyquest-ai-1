import React from 'react';
import { Bug, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const BugTriageDashboard = ({ bugs }) => {
  if (!bugs) return null;

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'P0': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'P1': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'P2': return <Info className="w-4 h-4 text-sky-500" />;
      default: return <Bug className="w-4 h-4 text-stone-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'IN_PROGRESS': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'BACKLOG': return 'text-stone-400 bg-stone-900 border-stone-800';
      default: return 'text-stone-400 bg-stone-900 border-stone-800';
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" /> Triage Backlog
          </h3>
          <p className="text-sm text-stone-400 mt-1">Incoming telemetry and user reports.</p>
        </div>
        <div className="bg-rose-950/30 border border-rose-900/50 text-rose-400 px-3 py-1 rounded-lg text-xs font-bold">
          {bugs.filter(b => b.priority === 'P0').length} Critical
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {bugs.map(bug => (
          <div key={bug.id} className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex gap-4">
            <div className="shrink-0 mt-0.5">
              {getPriorityIcon(bug.priority)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-stone-500 font-mono">{bug.id} • {bug.reporter}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(bug.status)}`}>
                  {bug.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-stone-300 line-clamp-2">{bug.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BugTriageDashboard;
