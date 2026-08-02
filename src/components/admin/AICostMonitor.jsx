import React, { useState, useEffect } from 'react';
import { getCostMetrics } from '../../services/pilotReadinessService';
import { Wallet, Server, Zap, AlertCircle } from 'lucide-react';

const AICostMonitor = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getCostMetrics().then(setMetrics);
  }, []);

  if (!metrics) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" /> AI Content Cost
        </h3>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          metrics.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {metrics.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Zap className="w-4 h-4 text-amber-400" /> 
            <span className="text-xs font-bold uppercase">Generated</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.generatedCount}</div>
          <div className="text-[10px] text-stone-500 mt-1">API Cost Incurred</div>
        </div>
        <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Server className="w-4 h-4 text-indigo-400" /> 
            <span className="text-xs font-bold uppercase">Cached</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.cachedCount}</div>
          <div className="text-[10px] text-stone-500 mt-1">Zero Cost Delivery</div>
        </div>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-1">Estimated API Cost</div>
            <div className="text-3xl font-black text-emerald-400">RM {metrics.estimatedCostMyr}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-stone-400">{metrics.estimatedTokens.toLocaleString()}</div>
            <div className="text-[10px] text-stone-500 uppercase">Est. Tokens</div>
          </div>
        </div>
      </div>

      {metrics.estimatedCostMyr > 50 && (
        <div className="mt-4 flex items-start gap-2 bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-200">
            Consider expanding the caching layer or reducing context window size. Content generation costs are trending high.
          </p>
        </div>
      )}
    </div>
  );
};

export default AICostMonitor;
