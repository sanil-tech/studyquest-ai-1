// src/components/student/AILearningCoach.jsx
// Phase 4.2: AI Learning Coach Student UI for StudyQuest (RPG Theme & Suku Mascot)

import React from "react";
import {
  Sparkles,
  Target,
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AILearningCoach({ insights, onStartMission }) {
  if (!insights) return null;

  const {
    student_summary = { total_xp: 0, level: 1, coins: 0 },
    mastery_summary = [],
    learning_alerts = [],
    adaptive_missions = [],
    ai_message = { mascot: "Suku", message: "Suku sedia membantu perjalanan kembara kamu!" }
  } = insights;

  return (
    <div className="space-y-6 text-left">
      {/* A) AI COACH HEADER CARD (Suku Mascot Identity) */}
      <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-amber-950/60 via-stone-900 to-cyan-950/60 border-2 border-amber-500/30 rounded-3xl shadow-2xl space-y-4">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Mascot Avatar Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 p-1 shadow-lg shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl shadow-inner border border-amber-400/40">
              🐢
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> Suku AI Learning Coach
              </span>
              <span className="text-xs text-stone-400 font-bold">
                Tahap {student_summary.level} • {student_summary.total_xp} XP
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Misi Kembara Bersama Suku
            </h2>
            {/* Mascot Speech Bubble */}
            <div className="p-3.5 bg-stone-950/90 border border-stone-800 rounded-2xl text-xs sm:text-sm font-bold text-amber-200 leading-relaxed shadow-inner">
              💬 "{ai_message.message || "Suku sedia membimbing kamu mencapai kejayaan!"}"
            </div>
          </div>
        </div>
      </div>

      {/* B) MASTERY OVERVIEW SECTION */}
      {mastery_summary.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Ringkasan Penguasaan Subjek
            </h3>
            <span className="text-[11px] text-stone-400 font-bold">
              {mastery_summary.length} Subjek Dinilai
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mastery_summary.map((item, idx) => {
              const score = Math.min(100, Math.max(0, item.mastery_score || 0));
              let statusBadge = { label: "Sedang Berkembang", color: "bg-amber-950/80 text-amber-300 border-amber-500/40" };

              if (item.mastery_level === "mastered" || score >= 85) {
                statusBadge = { label: "Cemerlang", color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" };
              } else if (item.mastery_level === "needs_foundation" || score < 60) {
                statusBadge = { label: "Perlu Bimbingan Asas", color: "bg-rose-950/80 text-rose-300 border-rose-500/40" };
              }

              return (
                <div
                  key={idx}
                  className="p-4 bg-stone-900/90 border border-stone-800 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">{item.subject}</h4>
                      <span className="text-[10px] font-bold text-stone-400">
                        {item.skill || "Kemahiran Kurikulum"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-black rounded-lg">
                        TP{item.tp_level || 3}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-stone-400">Skor Penguasaan</span>
                      <span className="text-amber-300">{score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* C) LEARNING ALERTS SECTION */}
      {learning_alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-rose-300 flex items-center gap-2 uppercase tracking-wider px-1">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Amaran Fokus Pembelajaran
          </h3>

          <div className="space-y-2.5">
            {learning_alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/30">
                    ⚠️
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-rose-200">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-stone-300 font-medium leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => onStartMission && onStartMission(adaptive_missions[0] || { subject: alert.title })}
                  className="w-full sm:w-auto h-10 px-4 bg-rose-500 hover:bg-rose-400 text-stone-950 font-black text-xs rounded-xl border-b-2 border-rose-700 active:translate-y-0.5 transition-all shrink-0"
                >
                  {alert.action || "Mulakan Latihan"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D) ADAPTIVE MISSIONS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
            <Target className="w-4 h-4 text-cyan-400" /> Misi Pembelajaran Adaptif
          </h3>
          <span className="text-[11px] text-stone-400 font-bold">
            {adaptive_missions.length} Misi Sedia Ada
          </span>
        </div>

        {adaptive_missions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adaptive_missions.map((mission, idx) => {
              const tierColor =
                mission.quiz_tier === "remediation"
                  ? "from-rose-950/40 border-rose-500/30"
                  : mission.quiz_tier === "challenge"
                  ? "from-amber-950/40 border-amber-500/30"
                  : "from-cyan-950/40 border-cyan-500/30";

              return (
                <div
                  key={idx}
                  className={`p-5 bg-gradient-to-br ${tierColor} via-stone-900 to-stone-950 border-2 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-stone-950 text-cyan-300 text-[10px] font-black uppercase rounded-lg border border-cyan-500/30 flex items-center gap-1">
                        🎯 {mission.quiz_tier || "ADAPTIF"}
                      </span>
                      <span className="text-[11px] font-bold text-amber-300">
                        {mission.question_count || 10} Soalan
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white leading-tight">
                      {mission.title || `Misi Adaptif: ${mission.subject}`}
                    </h4>
                    <p className="text-xs text-stone-300 font-medium leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => onStartMission && onStartMission(mission)}
                    className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Mula Misi Adaptif 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          /* E) EMPTY STATE */
          <div className="p-8 text-center bg-stone-900/80 border border-stone-800 rounded-3xl space-y-3">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-amber-500/20">
              🐢
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-300 max-w-sm mx-auto leading-relaxed">
              "Suku sedang memerhati perjalanan pembelajaran kamu. Teruskan belajar untuk membuka misi adaptif baharu!"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
