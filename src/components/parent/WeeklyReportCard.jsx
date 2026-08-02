import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function WeeklyReportCard({ summaryText, timeString, totalMissions }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
      <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-4">
        <Calendar className="text-indigo-500" size={18} />
        Laporan Mingguan
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {summaryText}
      </p>

      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <TargetIcon size={14} className="text-indigo-400" />
          {totalMissions} Misi
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Clock size={14} className="text-purple-400" />
          {timeString}
        </div>
      </div>
    </div>
  );
}

function TargetIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
