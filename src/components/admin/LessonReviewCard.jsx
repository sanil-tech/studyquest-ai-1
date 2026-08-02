import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function LessonReviewCard({ report }) {
  if (!report) return null;

  const { overall, checks } = report;

  return (
    <div className={`p-6 rounded-xl border-2 ${overall.approved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {overall.approved ? (
            <ShieldCheck className="w-10 h-10 text-green-600" />
          ) : (
            <ShieldAlert className="w-10 h-10 text-red-600" />
          )}
          <div>
            <h3 className={`text-xl font-bold ${overall.approved ? 'text-green-900' : 'text-red-900'}`}>
              {overall.approved ? 'Quality Check Passed' : 'Quality Check Failed'}
            </h3>
            <p className="text-sm font-medium text-slate-700">Overall Score: {overall.score}/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Alignment</p>
          <p className={`text-lg font-bold ${checks.alignment.passed ? 'text-green-600' : 'text-red-600'}`}>
            {checks.alignment.score}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Pedagogy</p>
          <p className={`text-lg font-bold ${checks.pedagogy.passed ? 'text-green-600' : 'text-red-600'}`}>
            {checks.pedagogy.score}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Assessment</p>
          <p className={`text-lg font-bold ${checks.assessment.passed ? 'text-green-600' : 'text-red-600'}`}>
            {checks.assessment.score}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Engagement</p>
          <p className={`text-lg font-bold ${checks.engagement.passed ? 'text-green-600' : 'text-red-600'}`}>
            {checks.engagement.score}
          </p>
        </div>
      </div>
    </div>
  );
}
