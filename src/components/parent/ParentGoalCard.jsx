// src/components/parent/ParentGoalCard.jsx
// Displays active learning goals set by parent, progress bars, and goal creation launcher

import React, { useState } from "react";
import { Target, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ParentGoalCard({ studentId, goals = [], onRefresh }) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalType, setGoalType] = useState("quiz");
  const [targetValue, setTargetValue] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!studentId) return;

    try {
      setSubmitting(true);
      const res = await base44.functions.invoke("createParentLearningGoal", {
        student_id: studentId,
        goal_type: goalType,
        target_value: Number(targetValue),
      });

      if (res.data?.success) {
        toast({
          title: "Sasaran Dicipta! 🎯",
          description: "Sasaran pembelajaran berjaya ditetapkan untuk anak anda.",
        });
        setShowAddForm(false);
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: "Gagal",
          description: res.data?.error || "Gagal mencipta sasaran.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Ralat Sistem",
        description: "Ralat rangkaian semasa mencipta sasaran.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-4 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" /> Sasaran Pembelajaran Mingguan
        </h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs h-8 px-3 rounded-xl border-b-2 border-amber-600 active:translate-y-0.5 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Sasaran
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="p-4 bg-stone-950/90 border border-amber-500/30 rounded-2xl space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Jenis Sasaran</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="quiz">Selesaikan Ujian / Misi</option>
              <option value="study_time">Masa Pembelajaran (Minit)</option>
              <option value="adaptive_mission">Misi Adaptif Suku</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Nilai Sasaran</label>
            <input
              type="number"
              min="1"
              max="100"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs h-9 rounded-xl border-b-2 border-amber-600"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Simpan Sasaran"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="h-9 px-3 border-stone-700 text-stone-400 text-xs font-bold rounded-xl"
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((g, idx) => {
            const current = g.current_value || 0;
            const target = g.target_value || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));

            return (
              <div key={g.id || idx} className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-white capitalize">
                    {g.goal_type === "quiz" ? "Selesaikan Ujian Minda" : g.goal_type === "study_time" ? "Masa Pembelajaran" : "Misi Adaptif Suku"}
                  </span>
                  <span className="text-amber-300">
                    {current} / {target} {g.goal_type === "study_time" ? "Minit" : "Misi"} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center bg-stone-950/50 rounded-2xl border border-stone-800/80 text-xs font-bold text-stone-400">
          Belum ada sasaran mingguan ditetapkan. Tekan "Tambah Sasaran" untuk bermula.
        </div>
      )}
    </div>
  );
}
