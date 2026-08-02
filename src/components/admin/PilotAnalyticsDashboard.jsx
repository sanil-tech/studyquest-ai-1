import React, { useState, useEffect } from 'react';
import LearningMetricCard from './LearningMetricCard';
import { generatePilotReport } from '@/services/learningAnalyticsService';
import { 
  Users, 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle,
  Lightbulb,
  Activity,
  FileBarChart
} from 'lucide-react';

const PilotAnalyticsDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await generatePilotReport();
        setReport(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-400 font-bold">
        Loading Pilot Analytics...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-rose-400 font-bold">
        Failed to load report.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            Pilot Measurement & Analytics
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Real-time telemetry for the first Malaysian student cohort (KSSR Tahun 1 Matematik).
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LearningMetricCard
          title="Total Active Students"
          value={report.students}
          icon={Users}
          colorClass="text-indigo-400"
        />
        <LearningMetricCard
          title="Average Mastery Gain"
          value={report.averageMasteryGain}
          icon={TrendingUp}
          trend="+15% vs target"
          trendLabel="Diagnostic vs Current"
          colorClass="text-emerald-400"
        />
        <LearningMetricCard
          title="AI Tutor Effectiveness"
          value={report.aiHelpSuccessRate}
          icon={BrainCircuit}
          trendLabel="Mistakes Resolved after Hint"
          colorClass="text-cyan-400"
        />
        <LearningMetricCard
          title="Avg Missions / Student"
          value={report.averageMissions}
          icon={FileBarChart}
          colorClass="text-amber-400"
        />
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Top Improvement Area
          </h3>
          <p className="text-3xl font-black text-emerald-300">{report.topImprovement}</p>
          <p className="text-stone-400 text-sm mt-2">
            Students are demonstrating high learning velocity in this topic after using the interactive widgets.
          </p>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Struggling Topics (SP Codes)
          </h3>
          <p className="text-xl font-bold text-rose-300">{report.problemAreas}</p>
          <p className="text-stone-400 text-sm mt-2">
            These SPs have the highest failure rate. Consider reviewing the AI Content Quality for these lessons.
          </p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-indigo-950/30 border border-indigo-900 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-indigo-300 flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-indigo-400" /> Analytics Engine Synthesis
        </h3>
        <p className="text-stone-300 text-sm leading-relaxed">
          {report.recommendations}
        </p>
      </div>
    </div>
  );
};

export default PilotAnalyticsDashboard;
