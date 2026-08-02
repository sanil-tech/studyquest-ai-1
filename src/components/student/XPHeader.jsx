import React from 'react';
import { Sparkles, Flame, UserCircle } from 'lucide-react';

export default function XPHeader({ studentName, xp, streak }) {
  return (
    <div className="bg-white px-6 py-4 rounded-b-2xl shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
      
      {/* Student Profile Info */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <UserCircle size={28} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Selamat datang</p>
          <h1 className="text-lg font-bold text-gray-900">{studentName || "Pengembara"}</h1>
        </div>
      </div>

      {/* Stats Container */}
      <div className="flex items-center gap-4">
        
        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="font-bold text-orange-700">{streak}</span>
        </div>

        {/* Total XP */}
        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
          <Sparkles size={18} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-yellow-700">{xp} XP</span>
        </div>
        
      </div>
    </div>
  );
}
