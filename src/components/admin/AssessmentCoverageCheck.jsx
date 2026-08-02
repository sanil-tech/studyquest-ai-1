import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssessmentCoverageCheck({ passed, score, notes }) {
  return (
    <div className={`p-4 rounded-lg border ${passed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {passed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
        <h4 className={`font-semibold ${passed ? 'text-green-800' : 'text-orange-800'}`}>
          Assessment Coverage (Score: {score})
        </h4>
      </div>
      {notes.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-slate-700 ml-7">
          {notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-700 ml-7">All required phases (Concept, Practice, Assessment) are present.</p>
      )}
    </div>
  );
}
