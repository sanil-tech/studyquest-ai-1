import React, { useEffect, useState } from 'react';
import { getParentDashboard } from '../../services/parentInsightService';
import ChildProgressCard from './ChildProgressCard';
import StrengthCard from './StrengthCard';
import ImprovementCard from './ImprovementCard';
import WeeklyReportCard from './WeeklyReportCard';
import RecommendationCard from './RecommendationCard';

export default function ParentDashboard({ studentId = 'stu_demo' }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        // Using the newly created Parent Insight Engine
        const data = await getParentDashboard(studentId);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load parent insights:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-indigo-400 font-bold">
        Memuatkan Maklumat Anak Anda...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Tiada data ditemui.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#F8FAFC] min-h-screen p-4 pb-20 font-sans">
      
      {/* Header */}
      <div className="mb-6 pt-4 px-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pantauan Ibu Bapa</h1>
        <p className="text-sm text-gray-500 mt-1">Laporan Kecerdasan Buatan (AI) mingguan.</p>
      </div>

      {/* 1. Core Metrics */}
      <ChildProgressCard 
        name={dashboardData.childName}
        xp={dashboardData.totalXP}
        streak={dashboardData.learningStreak}
        progress={dashboardData.overallProgress}
      />

      {/* 2. Actionable Recommendations */}
      <RecommendationCard 
        recommendations={dashboardData.recommendations} 
      />

      {/* 3. Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        <StrengthCard strengths={dashboardData.strongestSubjects} />
        <ImprovementCard improvements={dashboardData.improvementAreas} />
      </div>

      {/* 4. Weekly Activity Log */}
      <WeeklyReportCard 
        summaryText={dashboardData.weeklySummary.summaryText}
        timeString={dashboardData.weeklySummary.timeString}
        totalMissions={dashboardData.weeklySummary.totalMissions}
      />
      
    </div>
  );
}
