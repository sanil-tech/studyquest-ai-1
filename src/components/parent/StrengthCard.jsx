import React from 'react';
import { Star } from 'lucide-react';

export default function StrengthCard({ strengths }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-5">
      <h3 className="text-emerald-900 font-bold flex items-center gap-2 mb-3">
        <Star className="text-emerald-600 fill-emerald-600" size={18} />
        Kekuatan Utama
      </h3>
      <ul className="space-y-2">
        {strengths.map((strength, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800 font-medium leading-relaxed">
            <span className="text-emerald-500 font-black mt-0.5">•</span>
            {strength}
          </li>
        ))}
      </ul>
    </div>
  );
}
