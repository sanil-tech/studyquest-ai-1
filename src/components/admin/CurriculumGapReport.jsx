import React, { useState, useEffect } from 'react';
import { analyzeCurriculumGaps } from '../../services/contentFactoryService';
import { Target, Layers, FileX, Clock } from 'lucide-react';

const CurriculumGapReport = ({ onUpdate }) => {
  const [metrics, setMetrics] = useState(null);

  const fetchMetrics = async () => {
    const data = await analyzeCurriculumGaps();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh hook to allow parent to trigger updates
    if (onUpdate) {
      onUpdate(fetchMetrics);
    }
  }, [onUpdate]);

  if (!metrics) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" /> Curriculum Gap Analysis
        </h3>
        <div className="text-xl font-black text-indigo-400">
          {metrics.completionPercentage}% <span className="text-sm text-stone-500 font-bold uppercase">Complete</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-4 bg-stone-950 rounded-full overflow-hidden mb-6 flex">
        <div 
          className="h-full bg-emerald-500" 
          style={{ width: `${(metrics.coveredSps / metrics.totalSps) * 100}%` }}
        />
        <div 
          className="h-full bg-indigo-500/50" 
          style={{ width: `${(metrics.pendingApprovalSps / metrics.totalSps) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
          <Layers className="w-4 h-4 text-stone-400 mb-2" />
          <div className="text-2xl font-black text-white">{metrics.totalSps}</div>
          <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Total Taxonomy SPs</div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl">
          <Layers className="w-4 h-4 text-emerald-500 mb-2" />
          <div className="text-2xl font-black text-emerald-400">{metrics.coveredSps}</div>
          <div className="text-[10px] uppercase text-emerald-500/70 font-bold mt-1">Covered in Library</div>
        </div>
        <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-xl">
          <Clock className="w-4 h-4 text-indigo-500 mb-2" />
          <div className="text-2xl font-black text-indigo-400">{metrics.pendingApprovalSps}</div>
          <div className="text-[10px] uppercase text-indigo-500/70 font-bold mt-1">Pending QA Approval</div>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl">
          <FileX className="w-4 h-4 text-rose-500 mb-2" />
          <div className="text-2xl font-black text-rose-400">{metrics.missingSps}</div>
          <div className="text-[10px] uppercase text-rose-500/70 font-bold mt-1">Missing Gaps</div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumGapReport;
