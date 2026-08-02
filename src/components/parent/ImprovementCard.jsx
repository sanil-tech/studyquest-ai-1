import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ImprovementCard({ improvements }) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="bg-rose-50 rounded-2xl shadow-sm border border-rose-100 p-5">
      <h3 className="text-rose-900 font-bold flex items-center gap-2 mb-3">
        <AlertCircle className="text-rose-500" size={18} />
        Kawasan Perlu Perhatian
      </h3>
      <ul className="space-y-2">
        {improvements.map((improvement, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-rose-800 font-medium leading-relaxed">
            <span className="text-rose-500 font-black mt-0.5">•</span>
            {improvement}
          </li>
        ))}
      </ul>
    </div>
  );
}
