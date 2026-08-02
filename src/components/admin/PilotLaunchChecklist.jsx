import React, { useState, useEffect } from 'react';
import { getLaunchReadiness } from '../../services/pilotReadinessService';
import AICostMonitor from './AICostMonitor';
import DevicePerformanceTest from './DevicePerformanceTest';
import LessonPreviewTester from './LessonPreviewTester';
import LessonVersionManager from './LessonVersionManager';
import { Rocket, Server, BrainCircuit, Activity, BookOpen, Layers } from 'lucide-react';

const PilotLaunchChecklist = () => {
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    getLaunchReadiness().then(setReadiness);
  }, []);

  if (!readiness) return null;

  const readinessItems = [
    { key: 'system', icon: <Server />, label: 'System Infrastructure', data: readiness.system },
    { key: 'content', icon: <BookOpen />, label: 'Content Taxonomy', data: readiness.content },
    { key: 'assessment', icon: <Activity />, label: 'Assessment Logic', data: readiness.assessment },
    { key: 'aiTutor', icon: <BrainCircuit />, label: 'AI Tutor Engine', data: readiness.aiTutor },
    { key: 'device', icon: <Layers />, label: 'Cross-Device Perf', data: readiness.device },
  ];

  const canLaunch = Object.values(readiness).every(item => item.status === 'PASS');

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-amber-500" /> Production Readiness
            </h1>
            <p className="text-stone-400 mt-1">Final validation layer prior to real-world deployment.</p>
          </div>
          
          <div className="flex gap-4">
            {readinessItems.map(item => (
              <div key={item.key} className="flex flex-col items-center group relative cursor-help">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  item.data.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {React.cloneElement(item.icon, { className: "w-4 h-4" })}
                </div>
                {/* Tooltip */}
                <div className="absolute top-full mt-2 w-48 p-2 bg-stone-900 border border-stone-800 rounded shadow-xl text-xs text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  <div className="font-bold text-white mb-1">{item.label}</div>
                  {item.data.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AICostMonitor />
              <DevicePerformanceTest />
            </div>
            <LessonVersionManager />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <LessonPreviewTester />

            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Go / No-Go Decision</h3>
              <p className="text-sm text-stone-400 mb-6">
                Pilot launch requires all subsystems to report a PASS state. Warnings must be acknowledged by administration.
              </p>
              
              <button
                disabled={!canLaunch}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  canLaunch
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-105'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Rocket className="w-5 h-5" />
                {canLaunch ? 'Initiate Pilot Launch' : 'Launch Inhibited'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PilotLaunchChecklist;
