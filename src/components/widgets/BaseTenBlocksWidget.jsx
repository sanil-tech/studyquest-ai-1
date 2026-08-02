import React, { useState, useEffect } from "react";
import { Plus, Minus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function BaseTenBlocksWidget({ 
  targetNumber = 34, 
  onComplete, 
  isCompleted,
  onMistake
}) {
  const [puluhCount, setPuluhCount] = useState(0);
  const [saCount, setSaCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentValue = (puluhCount * 10) + saCount;

  useEffect(() => {
    if (isCompleted) {
      setPuluhCount(Math.floor(targetNumber / 10));
      setSaCount(targetNumber % 10);
      setIsCorrect(true);
    }
  }, [isCompleted, targetNumber]);

  const handleCheck = () => {
    if (currentValue === targetNumber) {
      setIsCorrect(true);
      setShowFeedback(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onComplete && !isCompleted) {
        onComplete();
      }
    } else {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      if (onMistake) {
        onMistake('UNKNOWN_MISTAKE'); // Can be specific if logic allows
      }
    }
  };

  return (
    <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-amber-300">Blok Asas 10</h3>
        <p className="text-sm font-bold text-stone-300">
          Sila bina nombor <span className="text-2xl text-lime-400 mx-1">{targetNumber}</span> menggunakan blok Puluh dan Sa.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Puluh Column */}
        <div className="p-4 bg-blue-950/30 border-2 border-blue-500/40 rounded-2xl flex flex-col items-center gap-4">
          <div className="text-center">
            <span className="px-3 py-1 bg-blue-900 text-blue-200 text-xs font-black uppercase rounded-full tracking-wider">
              Puluh (10)
            </span>
          </div>
          
          <div className="flex items-center gap-3 bg-stone-950/80 p-2 rounded-xl border border-stone-800">
            <Button 
              onClick={() => setPuluhCount(Math.max(0, puluhCount - 1))}
              disabled={puluhCount === 0 || isCorrect}
              className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-2xl font-black text-white w-8 text-center">{puluhCount}</span>
            <Button 
              onClick={() => setPuluhCount(puluhCount + 1)}
              disabled={puluhCount >= 9 || isCorrect}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 min-h-[160px] content-start">
            {Array.from({ length: puluhCount }).map((_, i) => (
              <div key={`puluh-${i}`} className="flex flex-col gap-0.5 animate-in slide-in-from-bottom-2">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={`p-${i}-${j}`} className="w-4 h-4 bg-blue-500 rounded-sm border border-blue-400" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sa Column */}
        <div className="p-4 bg-orange-950/30 border-2 border-orange-500/40 rounded-2xl flex flex-col items-center gap-4">
          <div className="text-center">
            <span className="px-3 py-1 bg-orange-900 text-orange-200 text-xs font-black uppercase rounded-full tracking-wider">
              Sa (1)
            </span>
          </div>
          
          <div className="flex items-center gap-3 bg-stone-950/80 p-2 rounded-xl border border-stone-800">
            <Button 
              onClick={() => setSaCount(Math.max(0, saCount - 1))}
              disabled={saCount === 0 || isCorrect}
              className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-2xl font-black text-white w-8 text-center">{saCount}</span>
            <Button 
              onClick={() => setSaCount(saCount + 1)}
              disabled={saCount >= 9 || isCorrect}
              className="w-10 h-10 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-1 max-w-[100px] min-h-[160px] content-start">
            {Array.from({ length: saCount }).map((_, i) => (
              <div key={`sa-${i}`} className="w-5 h-5 bg-orange-500 rounded-sm border border-orange-400 animate-in slide-in-from-bottom-2" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-stone-800">
        <div className="text-center">
          <span className="text-xs text-stone-400 font-bold">Jumlah Semasa:</span>
          <p className="text-3xl font-black text-white">{currentValue}</p>
        </div>

        {!isCorrect ? (
          <Button 
            onClick={handleCheck}
            className="w-full sm:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all"
          >
            Semak Jawapan
          </Button>
        ) : (
          <div className="px-6 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-black text-sm">Tahniah! Jawapan tepat.</span>
          </div>
        )}

        {showFeedback && !isCorrect && (
          <p className="text-rose-400 font-bold text-sm animate-pulse">
            Ops! Cuba kira semula blok Puluh dan Sa.
          </p>
        )}
      </div>
    </div>
  );
}
