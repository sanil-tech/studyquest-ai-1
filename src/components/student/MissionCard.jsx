import React from 'react';
import { Target, Play, Clock, Sparkles } from 'lucide-react';

export default function MissionCard({ mission, onStartMission }) {
  if (!mission) {
    return (
      <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
        <Sparkles className="mx-auto mb-4 opacity-80" size={48} />
        <h2 className="text-2xl font-black mb-2">Semua Selesai!</h2>
        <p className="text-emerald-50 font-medium">Anda telah menyelesaikan semua misi hari ini. Berehatlah dengan tenang.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 shadow-xl relative overflow-hidden group">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="bg-white/10 backdrop-blur-sm rounded-[22px] p-6 text-white h-full flex flex-col relative z-10">
        
        {/* Mission Type Tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <Target size={16} className="text-purple-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
              {mission.type || "Cabaran Hari Ini"}
            </span>
          </div>
        </div>

        {/* Mission Title */}
        <h2 className="text-2xl font-black mb-2 leading-tight">
          {mission.title}
        </h2>
        
        <p className="text-indigo-100 text-sm mb-6 opacity-90 leading-relaxed">
          {mission.description}
        </p>

        {/* Mission Metadata (Tasks) */}
        {mission.tasks && (
          <ul className="space-y-2 mb-8">
            {mission.tasks.map((task, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-indigo-50">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                {task}
              </li>
            ))}
          </ul>
        )}

        {/* Footer / CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/20">
          
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium">
            <Clock size={16} />
            <span>~10 Minit</span>
          </div>

          <button 
            onClick={() => onStartMission(mission)}
            className="bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105 transition-all active:scale-95 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_4px_14px_0_rgba(255,255,255,0.39)]"
          >
            <Play size={18} className="fill-indigo-700" />
            Mula Misi
          </button>

        </div>
      </div>
    </div>
  );
}