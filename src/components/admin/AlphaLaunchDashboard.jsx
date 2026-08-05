import React, { useState, useEffect } from 'react';
import FounderAcceptanceRunner from './FounderAcceptanceRunner';
import AlphaUserTracker from './AlphaUserTracker';
import BugTriageDashboard from './BugTriageDashboard';
import { getAcceptanceTests, getAlphaUsers, getBugBacklog } from '../../services/alphaOperationsService';
import { Rocket, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getVersionString } from '../../config/version';

const AlphaLaunchDashboard = () => {
  const [tests, setTests] = useState(null);
  const [users, setUsers] = useState(null);
  const [bugs, setBugs] = useState(null);
  const [readiness, setReadiness] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const t = await getAcceptanceTests();
      const u = await getAlphaUsers();
      const b = await getBugBacklog();
      setTests(t);
      setUsers(u);
      setBugs(b);
      setReadiness(Math.round((t.filter(x => x.passed).length / t.length) * 100));
    };
    loadData();
  }, []);

  const handleTestUpdate = (updatedTests) => {
    setTests(updatedTests);
    setReadiness(Math.round((updatedTests.filter(x => x.passed).length / updatedTests.length) * 100));
  };

  const isReady = readiness === 100;

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-indigo-500" /> Alpha Operations Command
            </h1>
            <p className="text-stone-400 mt-1 font-mono text-xs">{getVersionString()}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Launch Readiness</div>
              <div className={`text-2xl font-black ${isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                {readiness}%
              </div>
            </div>
            {isReady ? (
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 animate-pulse">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Left Column: Acceptance */}
          <div className="lg:col-span-1">
            <FounderAcceptanceRunner tests={tests} onUpdate={handleTestUpdate} />
          </div>

          {/* Middle Column: Telemetry */}
          <div className="lg:col-span-1">
            <AlphaUserTracker users={users} />
          </div>

          {/* Right Column: Triage */}
          <div className="lg:col-span-1">
            <BugTriageDashboard bugs={bugs} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlphaLaunchDashboard;
