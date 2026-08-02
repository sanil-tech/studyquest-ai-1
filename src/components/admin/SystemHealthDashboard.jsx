import React, { useState, useEffect } from 'react';
import { runSystemHealthCheck, getErrorLog, runFinalDemoScenario } from '../../services/healthCheckService';
import DataIntegrityCheck from './DataIntegrityCheck';
import PilotReadinessChecklist from './PilotReadinessChecklist';
import { Activity, ShieldAlert, PlayCircle, Loader2, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

const SystemHealthDashboard = () => {
  const [health, setHealth] = useState(null);
  const [errors, setErrors] = useState([]);
  const [demoLog, setDemoLog] = useState([]);
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  useEffect(() => {
    runSystemHealthCheck().then(setHealth);
    getErrorLog().then(setErrors);
  }, []);

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    setDemoLog([]);
    // Expose the log updating dynamically for UI flair
    const fullLog = await runFinalDemoScenario();
    setDemoLog(fullLog);
    setIsRunningDemo(false);
  };

  if (!health) return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-500" /> MVP Stabilization & QA
          </h1>
          <p className="text-stone-400 mt-1">Final validation layer before Malaysian pilot launch.</p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {health.components.map((comp, idx) => (
            <div key={idx} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{comp.name}</span>
                {comp.status === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="text-sm font-medium text-stone-300">
                {comp.latency || comp.uptime || comp.coverage || comp.issue}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <DataIntegrityCheck />
            
            {/* Error Log */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Recent Critical Errors
              </h3>
              <div className="space-y-3">
                {errors.length === 0 ? (
                  <p className="text-stone-400 text-sm">No critical errors reported in the last 24 hours.</p>
                ) : errors.map(err => (
                  <div key={err.id} className="bg-stone-950 border border-rose-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                        {err.type}
                      </span>
                      <span className="text-[10px] text-stone-500">{new Date(err.date).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-medium text-stone-300 mb-1">{err.module}</p>
                    <p className="text-xs text-stone-400 font-mono">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PilotReadinessChecklist />

            {/* Final Demo Orchestrator */}
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Terminal className="w-24 h-24 text-indigo-400" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 relative z-10">Final Demo Scenario</h3>
              <p className="text-xs text-indigo-200 mb-6 relative z-10">Simulates a complete user journey programmatically.</p>
              
              <button
                onClick={handleRunDemo}
                disabled={isRunningDemo}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative z-10 mb-4"
              >
                {isRunningDemo ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                {isRunningDemo ? "Running..." : "Run E2E Simulation"}
              </button>

              {demoLog.length > 0 && (
                <div className="bg-stone-950 rounded-xl p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1 relative z-10">
                  {demoLog.map((log, idx) => (
                    <div key={idx} className="text-emerald-400">
                      <span className="text-stone-600 mr-2">{new Date(log.time).toLocaleTimeString()}</span>
                      {log.message}
                    </div>
                  ))}
                  {isRunningDemo && <div className="text-indigo-400 animate-pulse">Executing next step...</div>}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemHealthDashboard;
