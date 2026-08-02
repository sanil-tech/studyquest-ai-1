import React from 'react';
import { generateWeeklyReport } from '../../services/learningEvidenceService';
import { Calendar, Target, TrendingUp, Lightbulb } from 'lucide-react';

const WeeklyReport = ({ studentId }) => {
  let report = null;
  try {
    report = generateWeeklyReport(studentId);
  } catch (e) {
    return null;
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-400" /> Ringkasan Mingguan
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-stone-300 mb-1">{report.greeting}</h4>
          <p className="text-xs text-stone-400 leading-relaxed">{report.summary}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 mb-2">
              <Target className="w-3 h-3" /> Kemahiran Dikuasai
            </h5>
            <ul className="space-y-2">
              {report.mastered.map((item, idx) => (
                <li key={idx} className="text-xs text-emerald-200 flex items-start gap-2">
                  <span className="text-emerald-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-4">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3" /> Sedang Berkembang
            </h5>
            <ul className="space-y-2">
              {report.improving.map((item, idx) => (
                <li key={idx} className="text-xs text-amber-200 flex items-start gap-2">
                  <span className="text-amber-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-stone-300 mb-1">Tip Minggu Ini</h5>
            <p className="text-xs text-stone-400">{report.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
