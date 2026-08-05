// src/pages/TeacherDashboard.jsx
// Phase 8: Teacher AI Classroom Intelligence Dashboard Page
// Dark RPG styled classroom intelligence center featuring Suku AI Teacher Assistant, class EWMA mastery scores, DSKP Tahap Penguasaan distribution, common misconceptions, and student support launcher.

import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import AITeacherCoach from "@/components/teacher/AITeacherCoach";
import ClassMasteryOverview from "@/components/teacher/ClassMasteryOverview";
import StudentSupportList from "@/components/teacher/StudentSupportList";
import TeacherMissionLauncher from "@/components/teacher/TeacherMissionLauncher";

import ClassAnalyticsDashboard from "@/components/ClassAnalyticsDashboard";

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classInsights, setClassInsights] = useState(null);
  const [activeClassId, setActiveClassId] = useState("class_4_cemerlang");
  const [activeTab, setActiveTab] = useState("ANALYTICS"); // "ANALYTICS" | "OVERVIEW"

  const loadTeacherInsights = useCallback(async (classId) => {
    try {
      setLoading(true);
      const res = await base44.functions.invoke("getTeacherClassInsights", {
        class_id: classId || activeClassId,
      });

      if (res.data?.success) {
        setClassInsights(res.data);
      } else {
        toast({
          title: "Perhatian",
          description: res.data?.error || "Gagal memuatkan maklumat kelas.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("TeacherInsights error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeClassId, toast]);

  useEffect(() => {
    loadTeacherInsights();
  }, [loadTeacherInsights]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs font-bold text-stone-400">Suku sedang menganalisis penguasaan murid kelas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 p-4 sm:p-6 space-y-6 text-left max-w-6xl mx-auto">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Portal AI Bilik Darjah Guru
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Dashboard Intelijen Kelas</h1>
          <p className="text-xs text-stone-400 font-bold mt-0.5">
            Pantau penguasaan DSKP, miskonsepsi lazim, dan tugaskan pemulihan adaptif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* TAB SWITCHER */}
          <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("ANALYTICS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === "ANALYTICS" ? "bg-amber-500 text-stone-950 shadow-md" : "text-stone-400 hover:text-white"
              }`}
            >
              📊 Diagnostik & Analitis
            </button>
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === "OVERVIEW" ? "bg-indigo-600 text-white shadow-md" : "text-stone-400 hover:text-white"
              }`}
            >
              👩‍🏫 Gambaran Keseluruhan
            </button>
          </div>

          <button
            onClick={() => loadTeacherInsights(activeClassId)}
            className="h-9 px-3 border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW RENDERER */}
      {activeTab === "ANALYTICS" ? (
        <ClassAnalyticsDashboard classId={activeClassId} />
      ) : (
        <div className="space-y-6">
          {/* ═══ 1. SUKU AI TEACHER COACH ═══ */}
          <AITeacherCoach aiTeacherGuidance={classInsights?.ai_teacher_guidance} />

          {/* ═══ 2. CLASS MASTERY OVERVIEW ═══ */}
          <ClassMasteryOverview
            classSummary={classInsights?.class_summary}
            tpDistribution={classInsights?.tp_distribution}
          />

          {/* ═══ 3. TEACHER MISSION LAUNCHER ═══ */}
          <TeacherMissionLauncher
            classId={classInsights?.class_summary?.class_id}
            className={classInsights?.class_summary?.class_name}
            misconceptions={classInsights?.common_misconceptions}
            onMissionAssigned={() => loadTeacherInsights(activeClassId)}
          />

          {/* ═══ 4. STUDENT SUPPORT LIST ═══ */}
          <StudentSupportList
            students={classInsights?.students_needing_support || []}
            onSelectStudent={(student) => {
              toast({
                title: `Bimbingan Ditugaskan: ${student.nickname}`,
                description: `Misi pemulihan peribadi disediakan bagi ${student.nickname}.`,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
