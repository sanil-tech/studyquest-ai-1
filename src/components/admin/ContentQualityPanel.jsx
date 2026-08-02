import React from 'react';
import LessonReviewCard from './LessonReviewCard';
import DSKPAlignmentCheck from './DSKPAlignmentCheck';
import AssessmentCoverageCheck from './AssessmentCoverageCheck';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ContentQualityPanel({ report, onApprove, onReject }) {
  if (!report) return null;

  return (
    <div className="space-y-6">
      <LessonReviewCard report={report} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DSKPAlignmentCheck 
          passed={report.checks.alignment.passed} 
          score={report.checks.alignment.score}
          notes={report.checks.alignment.notes} 
        />
        <AssessmentCoverageCheck 
          passed={report.checks.assessment.passed} 
          score={report.checks.assessment.score}
          notes={report.checks.assessment.notes} 
        />
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-md">Pedagogical Review</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {!report.checks.pedagogy.passed && (
            <div className="flex gap-3 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Learning Objective Issues</p>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {report.checks.pedagogy.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            </div>
          )}
          
          {!report.checks.engagement.passed && (
            <div className="flex gap-3 text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Engagement Issues</p>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {report.checks.engagement.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            </div>
          )}

          {report.checks.pedagogy.passed && report.checks.engagement.passed && (
            <p className="text-green-700 font-medium">All pedagogical and engagement checks passed successfully.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onReject}
          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
        >
          Reject & Edit Manually
        </button>
        <button
          onClick={onApprove}
          disabled={!report.overall.approved}
          className={`px-6 py-2 rounded-lg font-medium text-white shadow-sm ${
            report.overall.approved 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Approve AI Quality
        </button>
      </div>
    </div>
  );
}
