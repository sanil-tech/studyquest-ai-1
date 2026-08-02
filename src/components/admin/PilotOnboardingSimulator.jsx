import React, { useState, useEffect } from 'react';
import { getSimulationProfiles, runOnboardingDrill } from '../../services/pilotOnboardingService';
import LearningLoopReport from './LearningLoopReport';
import FailurePointReport from './FailurePointReport';
import { Rocket, Users, Play, RotateCcw } from 'lucide-react';

const PilotOnboardingSimulator = () => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [drillRan, setDrillRan] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfiles(getSimulationProfiles());
  }, []);

  const handleRunDrill = async (profileId) => {
    setIsRunning(true);
    setLogs([]);
    setError(null);
    setDrillRan(false);
    
    setActiveProfile(profiles.find(p => p.id === profileId));

    const result = await runOnboardingDrill(
      profileId, 
      (log) => setLogs(prev => [...prev, log]),
      (err) => setError(err)
    );

    setDrillRan(true);
    setIsRunning(false);
  };

  const handleReset = () => {
    setLogs([]);
    setActiveProfile(null);
    setDrillRan(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-sky-500" /> Pilot Onboarding Drill
            </h1>
            <p className="text-stone-400 mt-1">End-to-End simulation of the student journey to guarantee pipeline integrity.</p>
          </div>
          <button 
            onClick={handleReset}
            disabled={isRunning || !drillRan}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors disabled:opacity-30"
          >
            <RotateCcw className="w-4 h-4" /> Reset Simulator
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
          
          {/* Left: Learner Profiles */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col h-full">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-sky-400" /> Virtual Learners
            </h3>
            
            <div className="space-y-4">
              {profiles.map(profile => (
                <div key={profile.id} className={`bg-stone-950 border p-4 rounded-xl transition-all ${
                  activeProfile?.id === profile.id ? 'border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.15)]' : 'border-stone-800'
                }`}>
                  <div className="font-bold text-white mb-1">{profile.name}</div>
                  <p className="text-xs text-stone-400 mb-4 h-12 leading-relaxed">{profile.description}</p>
                  
                  <button
                    onClick={() => handleRunDrill(profile.id)}
                    disabled={isRunning}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      isRunning && activeProfile?.id === profile.id
                        ? 'bg-sky-900 text-sky-300'
                        : isRunning 
                          ? 'bg-stone-900 text-stone-600'
                          : 'bg-stone-800 hover:bg-stone-700 text-white'
                    }`}
                  >
                    {isRunning && activeProfile?.id === profile.id ? 'Simulating Journey...' : <><Play className="w-4 h-4" /> Inject Learner</>}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Simulation Output */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <LearningLoopReport logs={logs} />
            </div>
            
            <div className="shrink-0">
               <FailurePointReport error={error} drillRan={drillRan} isSuccess={!error} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PilotOnboardingSimulator;
