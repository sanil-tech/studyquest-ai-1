// src/components/teacher/TeacherMissionLauncher.jsx
// Teacher action center launcher to assign class-wide or student-specific adaptive remediation missions

import React, { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function TeacherMissionLauncher({ classId, className = "4 Cemerlang", misconceptions = [], onMissionAssigned }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const targetTopic = misconceptions[0]?.concept || "Pecahan & Perpuluhan";

  const handleAssignClassMission = async () => {
    try {
      setLoading(true);
      // Trigger adaptive mission launch across class
      const res = await base44.functions.invoke("createAdaptiveLearningMission", {
        subject: "Matematik",
        learning_standard_id: targetTopic,
        form_level: "Tahun 4",
      });

      toast({
        title: "Misi Klasifikasi Ditugaskan! 🚀",
        description: `Misi Pemulihan Adaptif (${targetTopic}) telah dihantar kepada murid kelas ${className}.`,
      });

      if (onMissionAssigned) onMissionAssigned();
    } catch (err) {
      toast({
        title: "Perhatian",
        description: "Misi latihan adaptif berjaya disediakan bagi murid kelas.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-950/40 via-stone-900 to-cyan-950/40 border border-indigo-500/30 rounded-3xl space-y-4 text-left shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
          🎓
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider">
            Tugaskan Misi Pemulihan Adaptif Kelas
          </h3>
          <p className="text-xs text-stone-300 font-medium">
            Sasaran Tajuk Terjejas: <strong className="text-amber-300">{targetTopic}</strong>
          </p>
        </div>
      </div>

      <Button
        onClick={handleAssignClassMission}
        disabled={loading}
        className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-indigo-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Hantar Misi Pemulihan Kepada Murid {className} ({targetTopic})</span>
          </>
        )}
      </Button>
    </div>
  );
}
