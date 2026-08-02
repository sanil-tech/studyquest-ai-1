import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function NumberScaleWidget({ 
  leftVal = 42, 
  rightVal = 68,
  correctRelation = "LESS_THAN", 
  onComplete, 
  isCompleted,
  onMistake
}) {
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);

  useEffect(() => {
    let angle = 0;
    if (leftVal > rightVal) angle = -12;
    else if (rightVal > leftVal) angle = 12;
    setTiltAngle(angle);

    if (isCompleted) {
      setIsCorrect(true);
      setSelectedRelation(correctRelation);
    } else {
      setIsCorrect(false);
      setSelectedRelation(null);
    }
  }, [leftVal, rightVal, correctRelation, isCompleted]);

  const handleSelect = (relation) => {
    if (isCorrect) return;
    setSelectedRelation(relation);
    setShowFeedback(false);
  };

  const handleReset = () => {
    if (isCorrect) return;
    setSelectedRelation(null);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    if (selectedRelation === correctRelation) {
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

  const getLabel = (rel) => {
    if (rel === "GREATER_THAN") return "Lebih Besar ( > )";
    if (rel === "LESS_THAN") return "Lebih Kecil ( < )";
    return "Sama Dengan ( = )";
  };

  return (
    <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-amber-300 flex items-center justify-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" /> Timbangan Nombor
        </h3>
        <p className="text-sm font-bold text-stone-300">
          Pilih hubungan yang betul antara kedua-dua nombor ini.
        </p>
      </div>

      {/* CSS Animation Balance Scale */}
      <div className="relative w-full max-w-sm mx-auto h-48 sm:h-56 mt-4 flex flex-col items-center justify-end overflow-visible">
        
        {/* Beam and Trays container */}
        <div 
          className="absolute top-10 w-[85%] h-2 bg-stone-500 rounded-full flex justify-between origin-center transition-transform duration-1000 ease-out z-10 border-b-2 border-stone-600 shadow-xl"
          style={{ transform: `rotate(${tiltAngle}deg)` }}
        >
          {/* Left Tray Hanger */}
          <div className="relative -left-6 top-1">
            <div className="absolute w-0.5 h-16 sm:h-20 bg-stone-600 left-1/2 origin-top" style={{ transform: `translateX(-50%) rotate(${-tiltAngle}deg)` }}>
              {/* Left Tray Plate */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-20 sm:w-24 h-4 bg-amber-600 rounded-b-xl border-t border-amber-400 flex items-end justify-center pb-5 z-20 shadow-lg">
                <div className="absolute bottom-3 bg-amber-950 border-2 border-amber-500 rounded-xl w-14 sm:w-16 h-10 sm:h-12 flex items-center justify-center shadow-inner shadow-amber-900/50">
                  <span className="text-lg sm:text-xl font-black text-amber-300">{leftVal}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Tray Hanger */}
          <div className="relative -right-6 top-1">
             <div className="absolute w-0.5 h-16 sm:h-20 bg-stone-600 left-1/2 origin-top" style={{ transform: `translateX(-50%) rotate(${-tiltAngle}deg)` }}>
               {/* Right Tray Plate */}
               <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-20 sm:w-24 h-4 bg-amber-600 rounded-b-xl border-t border-amber-400 flex items-end justify-center pb-5 z-20 shadow-lg">
                 <div className="absolute bottom-3 bg-amber-950 border-2 border-amber-500 rounded-xl w-14 sm:w-16 h-10 sm:h-12 flex items-center justify-center shadow-inner shadow-amber-900/50">
                   <span className="text-lg sm:text-xl font-black text-amber-300">{rightVal}</span>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Center Pivot Pin on Beam */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-stone-300 rounded-full shadow-sm z-30" />
        </div>

        {/* Center Pillar */}
        <div className="w-4 h-36 bg-gradient-to-b from-stone-600 to-stone-800 rounded-t-full border-x-2 border-stone-500 z-0 relative shadow-2xl">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-32 h-6 bg-stone-700 rounded-t-2xl border-t-4 border-stone-500" />
        </div>
      </div>

      {/* Sentence Builder Format Display */}
      <div className="text-center p-4 bg-stone-950/80 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-center gap-3 mt-8">
        <span className="text-2xl font-black text-amber-300">{leftVal}</span>
        <span className="px-4 py-2 bg-stone-800 border-2 border-stone-600 border-dashed rounded-xl text-sm font-bold text-stone-300 min-w-[150px]">
          {selectedRelation ? getLabel(selectedRelation) : "________________"}
        </span>
        <span className="text-2xl font-black text-amber-300">{rightVal}</span>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {["GREATER_THAN", "EQUAL", "LESS_THAN"].map(rel => (
          <button
            key={rel}
            disabled={isCorrect}
            onClick={() => handleSelect(rel)}
            className={`
              p-3 rounded-xl border-2 font-black text-sm transition-all transform active:scale-95
              ${selectedRelation === rel 
                ? "bg-amber-500 border-amber-400 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                : "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:border-stone-500"}
              ${isCorrect && selectedRelation !== rel ? "opacity-30" : ""}
            `}
          >
            {getLabel(rel)}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-stone-800">
        <div className="flex w-full justify-between sm:justify-center px-2">
           {!isCorrect && selectedRelation && (
              <button 
                onClick={handleReset}
                className="h-10 px-4 text-xs font-black text-rose-400 hover:text-rose-300 flex items-center gap-1.5 bg-rose-950/30 rounded-xl border border-rose-500/20 mr-auto sm:mr-4"
              >
                <RotateCcw className="w-4 h-4" /> Tukar Jawapan
              </button>
           )}
           
           {!isCorrect ? (
             <Button 
               onClick={handleCheck}
               disabled={!selectedRelation}
               className="w-full sm:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all disabled:opacity-50 ml-auto sm:ml-0"
             >
               Semak Jawapan
             </Button>
           ) : (
             <div className="px-6 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2 mx-auto">
               <CheckCircle2 className="w-5 h-5 text-emerald-400" />
               <span className="text-emerald-300 font-black text-sm">Tepat! Pemahaman yang hebat.</span>
             </div>
           )}
        </div>

        {showFeedback && !isCorrect && (
          <p className="text-rose-400 font-bold text-sm animate-pulse text-center">
            Perhatikan timbangan! Nombor yang mana lebih berat/besar?
          </p>
        )}
      </div>
    </div>
  );
}
