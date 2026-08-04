import React from 'react';
import { Activity, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { pilotOperationsRules as rules } from '../../data/domainRules.js';

const StudentHealthCard = ({ student }) => {
  const config = rules.health_status[student.healthStatus];

  const getIcon = () => {
    switch (student.healthStatus) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default: return <Activity className="w-5 h-5 text-stone-400" />;
    }
  };

  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-400"
  };

  return (
    <div className={`border rounded-2xl p-4 flex flex-col justify-between ${colorClasses[config.color] || "bg-stone-900 border-stone-800"}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-white text-sm">{student.name}</h4>
          <p className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">{student.level}</p>
        </div>
        <div className="bg-stone-950 p-1.5 rounded-lg border border-inherit">
          {getIcon()}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          Status: <span className="text-white">{config.label}</span>
        </div>
        
        {student.flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {student.flags.map((flag, idx) => (
              <span key={idx} className="bg-black/30 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono">
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHealthCard;
