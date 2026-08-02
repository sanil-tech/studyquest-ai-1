import React, { useState } from 'react';
import { submitParentFeedback } from '../../services/feedbackService';
import feedbackRules from '../../data/feedbackRules.json';
import { Send, CheckCircle2 } from 'lucide-react';

const FeedbackForm = ({ parentId }) => {
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitParentFeedback(parentId, responses);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-3xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Terima Kasih!</h3>
        <p className="text-stone-400 text-sm">Maklum balas anda amat berharga untuk meningkatkan kualiti StudyQuest.</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-white">Maklum Balas Ibu Bapa</h3>
        <p className="text-stone-400 text-sm mt-1">Bantu kami menambah baik pengalaman pilot ini.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {feedbackRules.parent_survey.questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-bold text-stone-200 mb-3">
              {q.text}
            </label>
            
            {q.type === 'scale_1_to_5' ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setResponses(prev => ({ ...prev, [q.id]: val }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                      responses[q.id] === val 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={responses[q.id] || ''}
                onChange={e => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] text-sm"
                placeholder="Taip komen anda di sini..."
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting || Object.keys(responses).length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Menghantar..." : "Hantar Maklum Balas"} <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
