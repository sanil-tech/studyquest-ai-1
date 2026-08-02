import React, { useState, useEffect } from 'react';
import { getBatchConfig, getBatchStatus, processSp } from '../../services/contentProductionService';
import { PlayCircle, Loader2, CheckCircle2, AlertCircle, Clock, Save, FileText } from 'lucide-react';

const BatchGenerationRunner = ({ onBatchUpdate }) => {
  const [config, setConfig] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setConfig(getBatchConfig());
    getBatchStatus().then(setBatchItems);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOURCE_LIBRARY': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <Save className="w-4 h-4" /> };
      case 'APPROVED': return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'QUALITY_CHECK': return { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Clock className="w-4 h-4" /> };
      case 'GENERATING': return { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
      case 'REJECTED': return { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { color: 'text-stone-500', bg: 'bg-stone-900', icon: <FileText className="w-4 h-4" /> }; // MISSING
    }
  };

  const handleRunBatch = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Simple recursive runner to push items through the pipeline
    const runCycle = async () => {
      let currentItems = await getBatchStatus();
      setBatchItems(currentItems);
      onBatchUpdate();
      
      const pendingItems = currentItems.filter(item => 
        ['MISSING', 'GENERATING', 'QUALITY_CHECK', 'APPROVED'].includes(item.status)
      );

      if (pendingItems.length > 0) {
        // Process one step for the first pending item
        await processSp(pendingItems[0].sp_code);
        setTimeout(runCycle, 1000); // 1s delay for visual effect
      } else {
        setIsRunning(false);
      }
    };
    
    runCycle();
  };

  if (!config) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" /> Batch Runner
          </h3>
          <p className="text-sm text-stone-400">Executing {config.batch_id} ({config.subject} {config.year})</p>
        </div>
        <button
          onClick={handleRunBatch}
          disabled={isRunning || batchItems.every(i => i.status === 'RESOURCE_LIBRARY' || i.status === 'REJECTED')}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isRunning 
              ? 'bg-emerald-600/50 text-white cursor-wait' 
              : batchItems.every(i => i.status === 'RESOURCE_LIBRARY' || i.status === 'REJECTED')
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><PlayCircle className="w-4 h-4" /> Start Pipeline</>}
        </button>
      </div>

      <div className="space-y-3">
        {batchItems.map(item => {
          const style = getStatusStyle(item.status);
          return (
            <div key={item.sp_code} className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex justify-between items-center transition-colors hover:border-stone-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                    SP {item.sp_code}
                  </span>
                  {item.lesson_id && (
                    <span className="text-[10px] text-stone-500 font-mono">{item.lesson_id}</span>
                  )}
                </div>
                <div className="text-sm font-bold text-stone-200">{item.topic}</div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent ${style.bg} ${style.color}`}>
                {style.icon}
                <span className="text-xs font-bold uppercase tracking-wider">{item.status.replace('_', ' ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchGenerationRunner;
