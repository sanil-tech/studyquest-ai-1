import React, { useState } from 'react';
import { submitStudentFeedback } from '../../services/feedbackService';
import feedbackRules from '../../data/feedbackRules.json';

const FeedbackPrompt = ({ childId, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = async (valueId) => {
    setIsSubmitting(true);
    await submitStudentFeedback(childId, valueId);
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Auto advance after short delay
    setTimeout(() => {
      if(onComplete) onComplete();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <p className="text-xl font-black text-emerald-400">Terima Kasih!</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6">
        Bagaimana perasaan kamu hari ini?
      </h3>
      
      <div className="flex justify-center gap-4 sm:gap-8">
        {feedbackRules.student_emoji_options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={isSubmitting}
            className="flex flex-col items-center gap-2 group transition-transform active:scale-95 disabled:opacity-50"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center text-4xl sm:text-5xl group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-all shadow-lg">
              {option.emoji}
            </div>
            <span className="text-sm font-bold text-stone-400 group-hover:text-white transition-colors">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPrompt;
