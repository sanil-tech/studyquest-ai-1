import React from 'react';
import { Lightbulb, ArrowRight, Target } from 'lucide-react';

export default function ParentActionCard({ childName, weakSubtopic, tpLevel, remediationHint }) {
  // If no weak subtopic provided, show a positive encouragement
  if (!weakSubtopic) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-emerald-900 tracking-tight">Prestasi Memuaskan!</h4>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            {childName} sedang menguasai topik dengan baik (TP5-TP6). Teruskan memberi galakan!
          </p>
        </div>
      </div>
    );
  }

  // Display specific remediation action for parents
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start gap-4 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
        <Lightbulb className="w-5 h-5 text-rose-600" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-rose-900 tracking-tight flex items-center gap-2">
          Fokus Bimbingan: {weakSubtopic} 
          <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[10px] rounded-full uppercase font-black">
            Tahap {tpLevel <= 2 ? "Asas (TP1-2)" : "Perkembangan (TP3-4)"}
          </span>
        </h4>
        <p className="text-sm text-rose-800 font-medium mt-2 leading-relaxed">
          {remediationHint || `Cuba uji kefahaman ${childName} dengan latihan asas berkaitan ${weakSubtopic}.`}
        </p>
        
        <button className="mt-3 text-xs font-bold text-rose-600 flex items-center gap-1 hover:text-rose-800 transition-colors">
          Lihat Modul Ulangkaji <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
