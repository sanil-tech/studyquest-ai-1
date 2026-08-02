import React, { useState, useEffect } from 'react';
import { getPilotFeedbackMetrics } from '../../services/feedbackService';
import { Users, Smile, Heart, MessageSquare, AlertTriangle } from 'lucide-react';

const PilotFeedbackDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getPilotFeedbackMetrics().then(setMetrics);
  }, []);

  if (!metrics) return null;

  return (
    <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          Pilot Feedback & Trust Metrics
        </h2>
        <p className="text-stone-400 text-sm mt-1">
          Monitoring parent satisfaction and student enjoyment during the 30-day MVP.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10">
          <Users className="w-5 h-5 text-blue-400 mb-2 opacity-80" />
          <div className="text-2xl font-black text-white">{metrics.familyCount}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mt-1">Keluarga Berdaftar</div>
        </div>
        
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
          <Users className="w-5 h-5 text-indigo-400 mb-2 opacity-80" />
          <div className="text-2xl font-black text-white">{metrics.activeStudents}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mt-1">Pelajar Aktif</div>
        </div>

        <div className="p-4 rounded-2xl border border-pink-500/30 bg-pink-500/10">
          <Heart className="w-5 h-5 text-pink-400 mb-2 opacity-80" />
          <div className="text-2xl font-black text-white">{metrics.parentSatisfactionScore}/5</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mt-1">Kepuasan Ibu Bapa</div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <Smile className="w-5 h-5 text-amber-400 mb-2 opacity-80" />
          <div className="text-2xl font-black text-white">{metrics.studentEnjoymentScore}%</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-1">Skor Keseronokan</div>
        </div>
      </div>

      {metrics.commonComplaints.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Isu Berbangkit (Ibu Bapa)
          </h3>
          <ul className="space-y-2">
            {metrics.commonComplaints.map((complaint, idx) => (
              <li key={idx} className="text-xs text-stone-400 flex items-start gap-2">
                <span className="text-stone-600">•</span> {complaint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PilotFeedbackDashboard;
