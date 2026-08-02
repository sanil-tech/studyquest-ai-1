import React, { useState, useEffect } from 'react';
import { Users, Activity, Flame, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { calculateCohortRetention } from '../../services/retentionService';
import demoStudents from '../../data/demoStudents.json';

const RetentionDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // In MVP, we simulate cohort data based on demoStudents.
    // We add simulated retention fields for the sake of the dashboard.
    const simulatedCohort = demoStudents.map((s, i) => ({
      ...s,
      currentStreak: s.status === 'ADVANCED' ? 14 : s.status === 'ON_TRACK' ? 3 : 0,
      daysActive: s.status === 'ADVANCED' ? 30 : s.status === 'ON_TRACK' ? 10 : 2
    }));

    setMetrics(calculateCohortRetention(simulatedCohort));
  }, []);

  if (!metrics) return null;

  const KPI_CARDS = [
    { label: "Daily Active Students", value: metrics.dailyActiveStudents, icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { label: "Returning Students", value: metrics.returningStudents, icon: Activity, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { label: "Average Streak", value: `${metrics.averageStreak} Days`, icon: Flame, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
    { label: "7-Day Retention", value: `${metrics.retention7Day}%`, icon: ShieldCheck, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
    { label: "30-Day Retention", value: `${metrics.retention30Day}%`, icon: TrendingUp, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { label: "Mission Completion Rate", value: `${metrics.missionCompletionRate}%`, icon: Target, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
  ];

  return (
    <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          Pilot Retention Analytics
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          Monitoring 30-day cohort stickiness and habit formation.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {KPI_CARDS.map((card, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border flex flex-col gap-3 ${card.color}`}>
            <div className="flex items-center justify-between">
              <card.icon className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{card.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetentionDashboard;
