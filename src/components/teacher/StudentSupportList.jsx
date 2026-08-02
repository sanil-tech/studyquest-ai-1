// src/components/teacher/StudentSupportList.jsx
// Displays list of students requiring pedagogical intervention or foundation support

import React from "react";
import { AlertCircle, User, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentSupportList({ students = [], onSelectStudent }) {
  if (!students.length) {
    return (
      <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-3xl text-center text-stone-400 font-bold text-xs">
        Semua murid dalam kelas mencapai penguasaan kukuh (TP4+). Tiada murid memerlukan pemulihan khas. 🎉
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-4 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" /> Senarai Murid Perlu Bimbingan & Pemulihan ({students.length})
        </h3>
      </div>

      <div className="space-y-2.5">
        {students.map((student) => (
          <div
            key={student.student_id}
            className="p-4 bg-stone-950/90 border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-rose-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
                {student.avatar || "🦧"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-white">{student.nickname}</h4>
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/30 text-[10px] font-black rounded-lg">
                    TP{student.tp_level} ({student.mastery_score}%)
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-medium">
                  <strong className="text-rose-400">Punca:</strong> {student.weakness}
                </p>
              </div>
            </div>

            {onSelectStudent && (
              <Button
                onClick={() => onSelectStudent(student)}
                size="sm"
                className="w-full sm:w-auto h-8 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shrink-0"
              >
                <span>Bimbing</span> <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
