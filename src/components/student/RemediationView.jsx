import React from 'react';
import { Award, AlertOctagon, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RemediationView({ result, topic, onClose, questions }) {
  const navigate = useNavigate();
  const { is_topic_unlocked, subtopics, failed_subtopic_ids } = result;

  const handleRemediation = (subId) => {
    // Navigate to Lesson Content Block corresponding to this subtopic
    // Real implementation would pass lessonId or subtopic mapping
    navigate(`/lesson/${topic.id}?subtopic=${subId}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl relative overflow-hidden ${
        is_topic_unlocked 
          ? "bg-amber-950/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
          : "bg-rose-950/40 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.2)]"
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
          is_topic_unlocked ? "bg-amber-500 border-amber-300 text-stone-950" : "bg-rose-500 border-rose-300 text-white"
        }`}>
          {is_topic_unlocked ? <Award className="w-10 h-10" /> : <AlertOctagon className="w-10 h-10" />}
        </div>
        
        <div className="space-y-2 relative z-10">
          <h2 className={`text-3xl font-black ${is_topic_unlocked ? "text-amber-400" : "text-rose-400"}`}>
            {is_topic_unlocked ? "Tahniah! Topik Dikuasai" : "Misi Pemulihan Diperlukan!"}
          </h2>
          <p className="text-stone-300 max-w-xl mx-auto">
            {is_topic_unlocked 
              ? "Anda telah berjaya melepasi tahap minimum 60% untuk semua subtopik. Pengembaraan seterusnya telah dibuka!" 
              : "Terdapat beberapa subtopik yang belum mencapai tahap minimum 60%. Mari kita ulangkaji bersama!"}
          </p>
        </div>
      </div>

      {/* Subtopic Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-2">Analisis Prestasi Subtopik</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subtopics.map((sub, idx) => {
            const isFailed = !sub.is_passed;
            // Collect hints for failed subtopics
            const wrongQuestions = questions?.filter(q => q.subtopic_id === sub.subtopic_id && !result.answers?.find(a => a.question_id === q.id && a.is_correct));
            
            return (
              <div key={idx} className={`p-5 rounded-2xl border-2 flex flex-col justify-between ${
                isFailed ? "bg-stone-900 border-rose-500/50" : "bg-stone-900 border-emerald-500/30"
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Subtopik</h4>
                      <div className="text-lg font-black text-white">{sub.subtopic_id}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${isFailed ? "text-rose-400" : "text-emerald-400"}`}>
                        {sub.score_percentage}%
                      </div>
                      <div className="text-xs font-bold text-stone-500">TP Tertinggi: {sub.max_tp_achieved}</div>
                    </div>
                  </div>

                  {/* Remediation Hints */}
                  {isFailed && wrongQuestions?.length > 0 && (
                    <div className="mt-4 p-3 bg-rose-950/30 border border-rose-900 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" /> Bimbingan AI
                      </div>
                      <p className="text-sm text-stone-300">
                        {wrongQuestions[0].explanation || "Sila ulangkaji konsep asas bagi topik ini."}
                      </p>
                    </div>
                  )}
                </div>

                {isFailed && (
                  <button 
                    onClick={() => handleRemediation(sub.subtopic_id)}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors border border-stone-700 hover:border-rose-500"
                  >
                    <RotateCcw className="w-5 h-5" /> Ulangkaji Subtopik Ini
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 flex justify-center">
        {is_topic_unlocked ? (
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-1"
          >
            Teruskan Pengembaraan <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors font-medium"
          >
            Kembali ke Peta Utama
          </button>
        )}
      </div>

    </div>
  );
}
