import React, { useState, useEffect } from 'react';
import { getSimulationProfiles, runLearningLoopSimulation } from '../../services/learningSimulationService';
import LearningFlowReport from './LearningFlowReport';
import { PlayCircle, User, Loader2, Network } from 'lucide-react';

const LearningLoopSimulator = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadedProfiles = getSimulationProfiles();
    setProfiles(loadedProfiles);
    if (loadedProfiles.length > 0) {
      setSelectedProfileId(loadedProfiles[0].id);
    }
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setResult(null);
    try {
      const res = await runLearningLoopSimulation(selectedProfileId);
      setResult(res);
    } catch (e) {
      console.error(e);
    }
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-500" /> Learning Loop Validation
          </h1>
          <p className="text-stone-400 mt-1">End-to-end mathematical proof of the AI engine pipeline.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" /> Select Virtual Learner
              </h3>
              
              <div className="space-y-3 mb-6">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedProfileId === p.id 
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold text-white mb-1">{p.name}</div>
                    <div className="text-xs text-stone-400 leading-relaxed">{p.description}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                {isSimulating ? "Simulating Pipeline..." : "Run E2E Validation"}
              </button>
            </div>
          </div>

          {/* Right Column: Report */}
          <div className="lg:col-span-2">
            {isSimulating ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" />
                  <Network className="w-12 h-12 text-indigo-500 animate-pulse relative z-10" />
                </div>
                <p className="mt-6 text-stone-400 text-sm font-medium">Pushing virtual student through AI pipeline...</p>
                <div className="mt-4 flex gap-2 text-[10px] text-stone-500 font-mono">
                  <span className="animate-pulse delay-75">Recommendation</span> →
                  <span className="animate-pulse delay-150">Content</span> →
                  <span className="animate-pulse delay-300">Assessment</span> →
                  <span className="animate-pulse delay-500">Mastery</span>
                </div>
              </div>
            ) : result ? (
              <LearningFlowReport result={result} />
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <Network className="w-12 h-12 text-stone-700 mb-4" />
                <h3 className="text-stone-300 font-bold mb-2">Awaiting Simulation</h3>
                <p className="text-stone-500 text-sm max-w-sm">Select a virtual learner profile and run the simulation to validate the engine cascade.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LearningLoopSimulator;
