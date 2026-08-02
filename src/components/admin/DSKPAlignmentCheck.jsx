import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function DSKPAlignmentCheck({ passed, score, notes }) {
  return (
    <div className={`p-4 rounded-lg border ${passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {passed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
        <h4 className={`font-semibold ${passed ? 'text-green-800' : 'text-red-800'}`}>
          DSKP Alignment (Score: {score})
        </h4>
      </div>
      {notes.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-slate-700 ml-7">
          {notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-700 ml-7">Perfectly aligned with curriculum standards.</p>
      )}
    </div>
  );
}
