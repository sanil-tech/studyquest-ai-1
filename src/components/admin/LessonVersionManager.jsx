import React, { useState, useEffect } from 'react';
import { getLessonVersions, updateLessonStatus } from '../../services/pilotReadinessService';
import { GitCommit, Check, Clock, Edit3, Archive } from 'lucide-react';

const LessonVersionManager = () => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    getLessonVersions().then(setVersions);
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateLessonStatus(id, status);
    getLessonVersions().then(setVersions); // Refresh
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'TESTING': return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case 'DRAFT': return "bg-stone-800 text-stone-300 border-stone-700";
      case 'ARCHIVED': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "";
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <GitCommit className="w-5 h-5 text-emerald-400" /> Lesson Version Control
      </h3>

      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.id} className="bg-stone-950 border border-stone-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{v.id}</span>
                <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded">{v.version}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getStatusStyle(v.status)}`}>
                {v.status}
              </span>
            </div>
            
            <p className="text-xs text-stone-400 mb-4">{v.changes}</p>
            
            <div className="flex justify-between items-center pt-3 border-t border-stone-800">
              <div className="text-[10px] text-stone-500">
                {v.generated_date} {v.approved_by && `• App by: ${v.approved_by}`}
              </div>
              <div className="flex gap-2">
                {v.status !== 'APPROVED' && (
                  <button 
                    onClick={() => handleStatusChange(v.id, 'APPROVED')}
                    className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors" title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {v.status === 'DRAFT' && (
                  <button 
                    onClick={() => handleStatusChange(v.id, 'TESTING')}
                    className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors" title="Send to Testing"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
                {v.status !== 'ARCHIVED' && (
                  <button 
                    onClick={() => handleStatusChange(v.id, 'ARCHIVED')}
                    className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded transition-colors" title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonVersionManager;
