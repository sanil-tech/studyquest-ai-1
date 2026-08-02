import React, { useState } from 'react';
import { getBenchmarkMetrics, evaluateLesson } from '../../services/lessonReviewService';
import { ClipboardCheck, Loader2 } from 'lucide-react';

const LessonQualityScoreCard = ({ lesson, onScoreComplete }) => {
  const metrics = getBenchmarkMetrics();
  const [scores, setScores] = useState(
    metrics.reduce((acc, m) => ({ ...acc, [m.id]: 85 }), {})
  );
  const [isScoring, setIsScoring] = useState(false);

  const handleScoreChange = (id, value) => {
    setScores(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleSubmit = async () => {
    setIsScoring(true);
    try {
      const evaluated = await evaluateLesson(lesson.id, scores);
      if (onScoreComplete) onScoreComplete(evaluated);
    } catch (e) {
      console.error(e);
    }
    setIsScoring(false);
  };

  if (!lesson) return null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-400" /> Quality Scorecard
        </h3>
        <p className="text-sm text-stone-400 mt-1">Evaluating: <span className="font-mono text-stone-300">{lesson.id}</span></p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {metrics.map(m => (
          <div key={m.id} className="bg-stone-950 p-3 rounded-xl border border-stone-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-stone-200">{m.label}</label>
              <span className="text-xs text-stone-500 font-mono">wt: {m.weight}</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" max="100" 
                value={scores[m.id]} 
                onChange={(e) => handleScoreChange(m.id, e.target.value)}
                className="flex-1 accent-emerald-500"
              />
              <span className="text-lg font-black w-12 text-right text-emerald-400">{scores[m.id]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-stone-800 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={isScoring}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isScoring ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Final Score"}
        </button>
      </div>
    </div>
  );
};

export default LessonQualityScoreCard;
