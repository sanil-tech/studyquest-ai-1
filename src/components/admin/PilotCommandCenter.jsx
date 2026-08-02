import React, { useState, useEffect } from 'react';
import { getPilotOverviewMetrics, getStudentHealthList } from '../../services/pilotOperationsService';
import StudentHealthCard from './StudentHealthCard';
import IssueTracker from './IssueTracker';
import PilotActivityFeed from './PilotActivityFeed';
import { Rocket, Target, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const PilotCommandCenter = () => {
  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getPilotOverviewMetrics().then(setMetrics);
    getStudentHealthList().then(setStudents);
  }, []);

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-indigo-500" /> Pilot Command Center
            </h1>
            <p className="text-stone-400 mt-1">Real-time operations for Malaysian family MVP pilot.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <Users className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.totalFamilies}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Families</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <Target className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.activeToday}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">DAU</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.averageStreak}</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Avg Streak (Days)</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-2xl font-black text-white">+{metrics.averageMasteryGain}%</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Avg Mastery Gain</div>
          </div>
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-pink-400 mb-2" />
            <div className="text-2xl font-black text-white">{metrics.parentSatisfaction}/5</div>
            <div className="text-[10px] uppercase text-stone-500 font-bold mt-1">Satisfaction</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Health */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
              <h3 className="text-lg font-black text-white mb-6">Student Health Monitoring</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {students.map(student => (
                  <StudentHealthCard key={student.id} student={student} />
                ))}
              </div>
            </div>

            <IssueTracker />
          </div>

          {/* Right Column: Feed */}
          <div className="space-y-6">
            <PilotActivityFeed />
          </div>

        </div>

      </div>
    </div>
  );
};

export default PilotCommandCenter;
