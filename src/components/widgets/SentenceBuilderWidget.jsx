import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function SentenceBuilderWidget({ 
  targetSentence = "Ahmad membaca buku di perpustakaan", 
  wordBank = null,
  onComplete, 
  isCompleted,
  onMistake
}) {
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize and scramble words on mount
  useEffect(() => {
    if (isCompleted) {
      const correctWords = targetSentence.split(" ").filter(w => w.trim());
      setSelectedWords(correctWords.map((w, i) => ({ id: `w-${i}`, word: w })));
      setAvailableWords([]);
      setIsCorrect(true);
      return;
    }

    let wordsToScramble = [];
    if (wordBank && Array.isArray(wordBank) && wordBank.length > 0) {
      wordsToScramble = [...wordBank];
    } else {
      wordsToScramble = targetSentence.split(" ").filter(w => w.trim());
    }

    // Fisher-Yates shuffle
    const shuffled = [...wordsToScramble];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Map to objects with unique IDs to handle duplicate words
    setAvailableWords(shuffled.map((w, i) => ({ id: `av-${i}`, word: w })));
    setSelectedWords([]);
  }, [targetSentence, wordBank, isCompleted]);

  const handleSelectWord = (wordObj) => {
    if (isCorrect) return;
    setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));
    setSelectedWords(prev => [...prev, wordObj]);
  };

  const handleDeselectWord = (wordObj) => {
    if (isCorrect) return;
    setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
    setAvailableWords(prev => [...prev, wordObj]);
  };

  const handleReset = () => {
    if (isCorrect) return;
    setAvailableWords(prev => [...prev, ...selectedWords]);
    setSelectedWords([]);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    const currentSentence = selectedWords.map(w => w.word).join(" ").trim().toLowerCase();
    const target = targetSentence.trim().toLowerCase();

    if (currentSentence === target) {
      setIsCorrect(true);
      setShowFeedback(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (onComplete && !isCompleted) {
        onComplete();
      }
    } else {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      if (onMistake) {
        onMistake('UNKNOWN_MISTAKE');
      }
    }
  };

  return (
    <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-emerald-300">Bina Ayat</h3>
        <p className="text-sm font-bold text-stone-300">
          Susun perkataan di bawah untuk membentuk ayat yang betul.
        </p>
      </div>

      {/* Ayat Anda (Selected Words) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-stone-400 tracking-wider">Ayat Anda</span>
          {selectedWords.length > 0 && !isCorrect && (
            <button 
              onClick={handleReset}
              className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-500/20"
            >
              <RotateCcw className="w-3 h-3" /> Padam Semua
            </button>
          )}
        </div>
        
        <div className={`
          min-h-[80px] p-4 rounded-2xl border-2 flex flex-wrap content-start gap-2 transition-all
          ${isCorrect ? 'bg-emerald-950/40 border-emerald-500/50' : 
            showFeedback ? 'bg-rose-950/20 border-rose-500/50' : 'bg-stone-950/50 border-stone-700/50'}
        `}>
          {selectedWords.length === 0 && (
             <span className="text-sm font-bold text-stone-500 my-auto mx-auto italic">
               Klik perkataan di bawah untuk menyusun ayat...
             </span>
          )}
          {selectedWords.map((w) => (
            <button
              key={w.id}
              onClick={() => handleDeselectWord(w)}
              disabled={isCorrect}
              className={`
                px-4 py-2 rounded-xl text-sm font-black shadow-sm transform transition-all active:scale-95
                ${isCorrect ? 'bg-emerald-600 text-white cursor-default border-emerald-500' : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border-stone-600 border'}
              `}
            >
              {w.word}
            </button>
          ))}
        </div>
        {showFeedback && !isCorrect && (
          <p className="text-rose-400 font-bold text-xs pl-2">Cuba lagi! Susun perkataan mengikut urutan yang betul.</p>
        )}
      </div>

      {/* Pilihan Perkataan (Word Pool) */}
      {!isCorrect && (
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-stone-400 tracking-wider">Pilihan Perkataan</span>
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-wrap gap-2 min-h-[80px] content-start">
            {availableWords.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelectWord(w)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-sm transform transition-all active:scale-95 border border-indigo-400/50"
              >
                {w.word}
              </button>
            ))}
            {availableWords.length === 0 && selectedWords.length > 0 && (
              <span className="text-sm font-bold text-indigo-400/50 my-auto mx-auto italic">
                Semua perkataan telah dipilih...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4 pt-4 border-t border-stone-800">
        {!isCorrect ? (
          <Button 
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="w-full sm:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all disabled:opacity-50"
          >
            Semak Jawapan
          </Button>
        ) : (
          <div className="px-6 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-black text-sm">Tahniah! Ayat berjaya dibina.</span>
          </div>
        )}
      </div>
    </div>
  );
}
