import React, { useState, useEffect } from 'react';
import { getReviewQueue, markAsGoldTemplate } from '../../services/lessonReviewService';
import LessonPreviewMode from './LessonPreviewMode';
import LessonQualityScoreCard from './LessonQualityScoreCard';
import { Medal, Star, AlertTriangle, ShieldCheck, ArrowRightCircle } from 'lucide-react';

const GoldStandardManager = () => {
  const [queue, setQueue] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);

  const fetchQueue = async () => {
    const data = await getReviewQueue();
    setQueue(data);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleScoreComplete = (evaluatedLesson) => {
    setQueue(prev => prev.map(l => l.id === evaluatedLesson.id ? evaluatedLesson : l));
    setActiveLesson(evaluatedLesson); // Keep it active to show the result
  };

  const handlePromoteGold = async (id) => {
    await markAsGoldTemplate(id);
    await fetchQueue();
    setActiveLesson(null); // Clear after promotion
  };

  const renderStatus = (lesson) => {
    switch(lesson.status) {
      case 'GOLD_CANDIDATE': return <span className="bg-amber-500/20 text-amber-400 border-amber-500/30 border px-2 py-1 rounded text-[10px] font-bold">GOLD CANDIDATE ({lesson.finalScore})</span>;
      case 'APPROVED_AS_TEMPLATE': return <span className="bg-purple-500/20 text-purple-400 border-purple-500/30 border px-2 py-1 rounded text-[10px] font-bold">GOLD TEMPLATE ACTIVE</span>;
      case 'APPROVED': return <span className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border px-2 py-1 rounded text-[10px] font-bold">APPROVED ({lesson.finalScore})</span>;
      case 'REPAIR_REQUIRED': return <span className="bg-rose-500/20 text-rose-400 border-rose-500/30 border px-2 py-1 rounded text-[10px] font-bold">REPAIR REQUIRED ({lesson.finalScore})</span>;
      default: return <span className="bg-stone-800 text-stone-400 border-stone-700 border px-2 py-1 rounded text-[10px] font-bold">UNSCORED</span>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Medal className="w-8 h-8 text-amber-500" /> Gold Standard Validation
          </h1>
          <p className="text-stone-400 mt-1">Reviewing Batch 001 to establish structural templates for the AI Content Engine.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
          
          {/* Left: Review Queue */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col h-full">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Pending Review
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {queue.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeLesson?.id === lesson.id 
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-white text-sm">{lesson.topic}</div>
                    <div className="text-[10px] text-stone-500 font-mono">{lesson.id}</div>
                  </div>
                  <div className="mt-2">
                    {renderStatus(lesson)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Preview / Score result */}
          <div className="flex flex-col h-full">
            {activeLesson ? (
              activeLesson.status === 'GOLD_CANDIDATE' ? (
                <div className="bg-amber-950/20 border-2 border-amber-500/50 rounded-3xl p-8 flex flex-col items-center justify-center h-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
                  <Star className="w-20 h-20 text-amber-400 mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
                  <h2 className="text-3xl font-black text-white mb-2">Score: {activeLesson.finalScore}</h2>
                  <p className="text-amber-200/70 mb-8 max-w-sm">This lesson exhibits exceptional pedagogical structure. Promote it to a Gold Template to train the AI Content Engine for future batches.</p>
                  
                  <button 
                    onClick={() => handlePromoteGold(activeLesson.id)}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all scale-105"
                  >
                    Promote to Gold Template
                  </button>
                </div>
              ) : activeLesson.status === 'REPAIR_REQUIRED' ? (
                <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-8 flex flex-col items-center justify-center h-full text-center">
                  <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
                  <h2 className="text-2xl font-black text-rose-400 mb-2">Score: {activeLesson.finalScore}</h2>
                  <p className="text-rose-200/70">Failed quality gates. Sent back to the Content Factory for automatic repair.</p>
                </div>
              ) : activeLesson.status === 'APPROVED_AS_TEMPLATE' ? (
                <div className="bg-purple-950/20 border border-purple-900/50 rounded-3xl p-8 flex flex-col items-center justify-center h-full text-center">
                  <Medal className="w-16 h-16 text-purple-500 mb-4" />
                  <h2 className="text-2xl font-black text-purple-400 mb-2">Template Active</h2>
                  <p className="text-purple-200/70">The AI Content Engine is now using this structure for future generation.</p>
                </div>
              ) : (
                <LessonPreviewMode lesson={activeLesson} />
              )
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 flex flex-col items-center justify-center h-full text-center">
                <ArrowRightCircle className="w-12 h-12 text-stone-700 mb-4" />
                <p className="text-stone-500 font-medium">Select a lesson from the queue to review and score.</p>
              </div>
            )}
          </div>

          {/* Right: Score Card */}
          <div className="h-full">
             {activeLesson && activeLesson.status === 'PENDING_REVIEW' ? (
               <LessonQualityScoreCard lesson={activeLesson} onScoreComplete={handleScoreComplete} />
             ) : (
               <div className="bg-stone-900/50 border border-stone-800/50 rounded-3xl p-6 h-full flex items-center justify-center">
                 <p className="text-stone-600 text-sm text-center">Scorecard locked.<br/>Select an unscored lesson.</p>
               </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GoldStandardManager;
