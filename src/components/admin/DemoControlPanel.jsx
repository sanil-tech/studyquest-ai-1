import React, { useState, useEffect } from 'react';
import { 
  getDemoProfiles, 
  loadDemoProfile,
  runDiagnosticSimulation,
  generateMissionSimulation,
  completeLessonSimulation,
  triggerMistakeSimulation,
  generateParentReportSimulation,
  generateAnalyticsSimulation,
  resetDemoStudent
} from '@/services/demoStudentService';
import { Play, RotateCcw, Activity, User, Brain, Heart, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const DemoControlPanel = () => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [simulationLog, setSimulationLog] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setProfiles(getDemoProfiles());
  }, []);

  const handleSelectProfile = (profileId) => {
    const profile = loadDemoProfile(profileId);
    setActiveProfile(profile);
    setSimulationLog([{ 
      time: new Date().toLocaleTimeString(), 
      action: "Profile Loaded", 
      result: profile 
    }]);
  };

  const addLog = (data) => {
    setSimulationLog(prev => [{ time: new Date().toLocaleTimeString(), ...data }, ...prev]);
  };

  const runAction = async (actionFn) => {
    if (!activeProfile) return;
    setIsSimulating(true);
    try {
      const res = await actionFn();
      addLog(res);
      // Refresh profile view if it was a mutation
      if (res.action.includes("Completed") || res.action.includes("Reset")) {
        setActiveProfile(loadDemoProfile(activeProfile.id));
      }
    } catch (err) {
      addLog({ action: "Error", result: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const SIMULATION_ACTIONS = [
    { label: "Run Diagnostic", icon: Activity, action: runDiagnosticSimulation, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
    { label: "Generate Mission", icon: Play, action: generateMissionSimulation, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
    { label: "Complete Lesson", icon: CheckCircle2, action: completeLessonSimulation, color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20" },
    { label: "Simulate Mistake (AI Tutor)", icon: AlertCircle, action: triggerMistakeSimulation, color: "text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20" },
    { label: "Generate Parent Report", icon: Heart, action: generateParentReportSimulation, color: "text-pink-400 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20" },
    { label: "Run Cohort Analytics", icon: Brain, action: generateAnalyticsSimulation, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20" },
  ];

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left Sidebar: Profiles & Actions */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Profile Selection */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-amber-400" /> Select Demo Profile
          </h2>
          <div className="flex flex-col gap-3">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  activeProfile?.id === p.id 
                    ? "bg-amber-500/20 border-amber-500/50 ring-1 ring-amber-500" 
                    : "bg-stone-950 border-stone-800 hover:border-stone-700"
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-stone-200">{p.name}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Status: {p.status}</div>
                </div>
                <div className="text-xs font-black text-amber-400">{p.mastery_state.overall}% Mastery</div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Actions */}
        <div className={`bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl transition-opacity ${!activeProfile ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" /> Trigger Actions
            </h2>
            <button 
              onClick={() => runAction(resetDemoStudent)}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {SIMULATION_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => runAction(action.action)}
                disabled={isSimulating}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content: Telemetry Log */}
      <div className="w-full lg:w-2/3 flex flex-col h-full max-h-[85vh]">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-400" /> Telemetry Log
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {simulationLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-500 font-bold text-sm">
                Select a profile and trigger an action to view the telemetry matrix.
              </div>
            ) : (
              simulationLog.map((log, idx) => (
                <div key={idx} className="bg-stone-950 border border-stone-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{log.action}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{log.time}</span>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-300 bg-stone-900/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.result, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DemoControlPanel;
