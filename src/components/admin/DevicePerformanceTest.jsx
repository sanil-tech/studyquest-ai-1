import React, { useState, useEffect } from 'react';
import { getDeviceTestResults } from '../../services/pilotReadinessService';
import { Smartphone, Monitor, CheckCircle2, AlertTriangle } from 'lucide-react';

const DevicePerformanceTest = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    getDeviceTestResults().then(setResults);
  }, []);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Smartphone className="w-5 h-5 text-indigo-400" /> Device Compatibility
      </h3>

      <div className="space-y-4">
        {results.map((device, idx) => (
          <div key={idx} className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {device.device.includes("Desktop") ? (
                <Monitor className="w-5 h-5 text-stone-500" />
              ) : (
                <Smartphone className="w-5 h-5 text-stone-500" />
              )}
              <div>
                <div className="text-sm font-bold text-stone-200">{device.device}</div>
                <div className="text-[10px] text-stone-500 font-mono mt-1">Load: {device.loadTimeMs}ms | FPS: {device.avgFps}</div>
              </div>
            </div>
            
            <div>
              {device.status === 'PASS' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" /> WARN
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-stone-500 mt-4 leading-relaxed">
        * Mobile browser load times exceeding 3000ms may cause high bounce rates during initial pilot onboarding.
      </p>
    </div>
  );
};

export default DevicePerformanceTest;
