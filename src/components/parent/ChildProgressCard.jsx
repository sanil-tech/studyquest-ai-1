import React from 'react';
import { Target, Flame, Sparkles } from 'lucide-react';

export default function ChildProgressCard({ name, xp, streak, progress }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Prestasi {name}</h2>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
          <Target size={16} />
          {progress}% Silibus
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Flame className="text-orange-500 fill-orange-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">Konsistensi</p>
            <p className="text-xl font-black text-orange-700">{streak} Hari</p>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Sparkles className="text-yellow-500 fill-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-yellow-900 uppercase tracking-wider">Jumlah XP</p>
            <p className="text-xl font-black text-yellow-700">{xp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
