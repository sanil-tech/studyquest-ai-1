import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDiagnosticAssessment, submitAnswer, updateMasteryEngine } from '../services/diagnosticAssessmentService';
import { initializeStudentJourney } from '../services/studentJourneyService';
// Assuming this can render diagnostic widgets if we mock standard lessons

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [studentInfo, setStudentInfo] = useState({ name: '', year: 'Tahun 1', subject: 'Matematik' });
  
  // Diagnostic state
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Step 1: Collect Info
  const handleStart = async () => {
    // Generate a test ID - simulating what a backend auth session would provide
    const studentId = `stu_${studentInfo.name.toLowerCase().replace(/\s/g, '_')}`;
    // Initialize Journey (which handles creating diagnostic if needed)
    const journey = await initializeStudentJourney(studentId, studentInfo.name, 'KSSR_SEMAKAN', studentInfo.subject, studentInfo.year);
    
    if (journey.status === 'NEEDS_DIAGNOSTIC') {
      // The journey service created a diagnostic, let's just create one directly here for the UI to bind to
      const session = createDiagnosticAssessment(studentId, 'KSSR_SEMAKAN', studentInfo.subject, studentInfo.year);
      setSessionId(session.sessionId);
      
      // Flatten questions from all assessments in this session for simplicity
      const allQuestions = session.assessments.flatMap(a => a.questions);
      setQuestions(allQuestions);
      setStep(2);
    } else {
      // Already has data, go home
      localStorage.setItem('currentStudentId', studentId);
      localStorage.setItem('currentStudentName', studentInfo.name);
      navigate('/home');
    }
  };

  const handleAnswerSubmit = (answer) => {
    const currentQ = questions[currentQIndex];
    submitAnswer(sessionId, currentQ.id, answer, 30); // Hardcoded 30s for demo
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setStep(4);
    }
  };

  const completeOnboarding = () => {
    updateMasteryEngine(sessionId); // Push to Mastery Engine
    localStorage.setItem('currentStudentId', `stu_${studentInfo.name.toLowerCase().replace(/\s/g, '_')}`);
    localStorage.setItem('currentStudentName', studentInfo.name);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden">
        
        {step === 1 && (
          <div className="p-8 text-center">
            <h1 className="text-3xl font-black text-indigo-900 mb-2">Selamat Datang ke StudyQuest!</h1>
            <p className="text-gray-500 mb-8">Platform pembelajaran pintar anda.</p>
            
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={studentInfo.name}
                  onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none"
                  placeholder="Cth: Amir"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tahun Berapa?</label>
                <select 
                  value={studentInfo.year}
                  onChange={(e) => setStudentInfo({...studentInfo, year: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none bg-white"
                >
                  <option>Tahun 1</option>
                  <option>Tahun 2</option>
                  <option>Tahun 3</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={!studentInfo.name}
              className="mt-8 w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Mula Pengembaraan!
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 text-center bg-gradient-to-b from-purple-500 to-indigo-600 text-white">
            <div className="text-6xl mb-4">🕵️‍♂️</div>
            <h2 className="text-2xl font-bold mb-4">Mari Kenal Pasti Tahap Kamu!</h2>
            <p className="mb-8 opacity-90 text-sm leading-relaxed">
              Kami akan berikan beberapa cabaran ringkas. Jangan risau kalau salah, ini bukan peperiksaan! Ini cuma cara StudyQuest mencari misi yang paling sesuai untuk kamu.
            </p>
            <button 
              onClick={() => setStep(3)}
              className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
            >
              Mula Cabaran
            </button>
          </div>
        )}

        {step === 3 && questions.length > 0 && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-400">
              <span>Cabaran {currentQIndex + 1} / {questions.length}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-6">{questions[currentQIndex].question}</h3>

            {questions[currentQIndex].type === 'MULTIPLE_CHOICE' ? (
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQIndex].choices.map((c, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAnswerSubmit(c)}
                    className="p-4 border-2 border-indigo-100 rounded-xl font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-500 transition-colors text-left"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              // For interactive widgets, we provide a mock simple input for this demo phase
              <div className="space-y-4">
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  [Interactive Widget Placeholder: {questions[currentQIndex].widget_type}]<br/>
                  Target Answer: {questions[currentQIndex].correct_answer}
                </p>
                <input 
                  type="text" 
                  placeholder="Taip jawapan..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAnswerSubmit(e.currentTarget.value);
                  }}
                />
                <p className="text-xs text-gray-400">Tekan Enter untuk hantar</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">🧠</div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">AI Sedang Memproses...</h2>
            <p className="text-gray-500 mb-8">Membuat laluan pembelajaran khas untuk {studentInfo.name}!</p>
            <button 
              onClick={completeOnboarding}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700"
            >
              Lihat Papan Pemuka
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
