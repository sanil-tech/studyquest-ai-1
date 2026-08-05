// src/components/parent/ParentMissionLauncher.jsx
// Parent action launcher to assign extra practice missions to linked child

import React, { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ParentMissionLauncher({ studentId, weaknesses = [], onMissionCreated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const targetWeakness = weaknesses[0] || {
    subject: "Matematik",
    skill: "Pecahan & Perpuluhan",
    misconception: "Memerlukan pengukuhan konsep asas.",
  };

  const handleAssignMission = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const res = await base44.functions.invoke("createParentMissionRequest", {
        student_id: studentId,
        subject: targetWeakness.subject || "Matematik",
        learning_standard_id: targetWeakness.skill || "Pecahan & Perpuluhan",
        form_level: "Tahun 4",
      });

      if (res.data?.success) {
        toast({
          title: "Misi Berjaya Diberikan! 🚀",
          description: `Misi latihan adaptif (${targetWeakness.skill}) telah dihantar ke dashboard anak anda.`,
        });
        if (onMissionCreated) onMissionCreated();
      } else {
        toast({
          title: "Perhatian",
          description: res.data?.error || "Misi pembelajaran sedang aktif bagi topik ini.",
        });
      }
    } catch (err) {
      toast({
        title: "Ralat Sistem",
        description: "Gagal menugaskan misi latihan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-stone-900 to-amber-950/40 border border-cyan-500/30 rounded-3xl space-y-3 text-left shadow-xl">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐢</span>
        <div>
          <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
            Tugaskan Misi Latihan Tambahan
          </h3>
          <p className="text-[11px] text-stone-300 font-bold">
            Suku mengesyorkan: "{targetWeakness.skill} memerlukan bimbingan tambahan"
          </p>
        </div>
      </div>

      <Button
        onClick={handleAssignMission}
        disabled={loading}
        className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-xs rounded-xl border-b-4 border-cyan-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Tugaskan Misi Latihan Adaptif ({targetWeakness.skill})</span>
          </>
        )}
      </Button>
    </div>
  );
}
