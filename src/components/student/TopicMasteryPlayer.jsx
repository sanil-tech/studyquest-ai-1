import React, { useState, useEffect } from 'react';
import { useBase44 } from '@base44/sdk/react';
import { ChevronRight, Target, Brain, ArrowRight } from 'lucide-react';
import RemediationView from './RemediationView';

export default function TopicMasteryPlayer({ studentId, topic, onBack }) {
  const base44 = useBase44();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Fetch questions generated in Fasa 2
        let fetched = await base44.entities.QuestionBank.filter({
          topic_id: topic.id,
          status: "published"
        });
        
        // Ensure N x 5 distribution order or shuffle
        if (fetched && fetched.length > 0) {
          setQuestions(fetched);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };
    if (topic?.id) fetchQuestions();
  }, [topic, base44]);

  const handleSelectOption = (idx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentIdx].id]: idx
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const payload = {
        student_id: studentId,
        assessment_id: topic.id,
        duration_seconds: 120, // Example hardcoded or calculated
        answers: questions.map(q => ({
          question_id: q.id,
          selected_option_id: selectedAnswers[q.id]?.toString(),
          is_correct: selectedAnswers[q.id] === q.correct_index,
          subtopic_id: q.subtopic_id,
          tp_level: q.tp_level
        }))
      };

      // Call Fasa 1 endpoint
      const response = await base44.functions.evaluateDiagnosticQuiz(payload);
      
      if (response && response.success) {
        setResult(response);
      } else {
        console.error("Submission failed", response);
        alert("Ralat semasa menghantar kuiz.");
      }
    } catch (err) {
      console.error("Error submitting", err);
      alert("Ralat pelayan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-cyan-400 font-bold animate-pulse">Menyiapkan Kuiz Diagnostik...</div>;
  if (!questions || questions.length === 0) return <div className="text-center p-8 text-stone-400">Tiada soalan ditemui untuk topik ini.</div>;

  if (result) {
    return (
      <RemediationView 
        result={result} 
        topic={topic} 
        onClose={onBack}
        questions={questions}
      />
    );
  }

  const currentQ = questions[currentIdx];
  let options = [];
  try {
    options = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
  } catch(e) { options = []; }

  const hasSelected = selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onBack} className="text-stone-400 hover:text-white transition-colors text-sm font-medium">
          ← Kembali
        </button>
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                i === currentIdx ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 
                selectedAnswers[questions[i].id] !== undefined ? 'bg-cyan-900' : 'bg-stone-800'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-stone-800/80 text-cyan-400 text-xs font-black uppercase rounded-full border border-stone-700/50 flex items-center gap-2">
            <Brain className="w-3 h-3" /> TP {currentQ.tp_level}
          </span>
          <span className="text-sm font-bold text-stone-500">
            Soalan {currentIdx + 1} daripada {questions.length}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-snug">
          {currentQ.question_text}
        </h2>

        <div className="space-y-4">
          {options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQ.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  isSelected 
                    ? "bg-cyan-950/50 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                    : "bg-stone-800/50 border-stone-700/50 text-stone-300 hover:bg-stone-800 hover:border-stone-600"
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                  isSelected ? "bg-cyan-500 border-cyan-400 text-stone-950" : "border-stone-600 text-stone-400"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-medium text-base">{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          {currentIdx < questions.length - 1 ? (
            <button 
              onClick={handleNext}
              disabled={!hasSelected}
              className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-stone-200 text-stone-950 font-black rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Seterusnya <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!hasSelected || submitting}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black rounded-xl transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {submitting ? "Memproses..." : "Hantar Jawapan"} <Target className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
