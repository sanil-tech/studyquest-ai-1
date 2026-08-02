import React, { useState, useEffect } from "react";
import { CheckCircle2, RotateCcw, PieChart, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function FractionSlicerWidget({ 
  targetFraction = "1/2", 
  shapeType = "circle",
  onComplete, 
  isCompleted,
  onMistake
}) {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(2);
  const [shadedSlices, setShadedSlices] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentShape, setCurrentShape] = useState(shapeType);

  useEffect(() => {
    let num = 1;
    let den = 2;
    if (targetFraction && typeof targetFraction === 'string' && targetFraction.includes("/")) {
      const parts = targetFraction.split("/");
      num = parseInt(parts[0].trim(), 10);
      den = parseInt(parts[1].trim(), 10);
      if (isNaN(num)) num = 1;
      if (isNaN(den) || den === 0) den = 2;
    }
    setNumerator(num);
    setDenominator(den);
    setCurrentShape(shapeType === "rectangle" ? "rectangle" : "circle");

    if (isCompleted) {
      setIsCorrect(true);
      // For correct fractions that are equivalent (e.g. 2/4 for target 1/2)
      // we'll just shade the numerator amount from the denominator scale
      setShadedSlices(Array.from({ length: num }).map((_, i) => i));
    } else {
      setShadedSlices([]);
      setIsCorrect(false);
    }
  }, [targetFraction, shapeType, isCompleted]);

  const toggleSlice = (index) => {
    if (isCorrect) return;
    setShadedSlices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
    setShowFeedback(false);
  };

  const handleReset = () => {
    if (isCorrect) return;
    setShadedSlices([]);
    setShowFeedback(false);
  };

  const handleCheck = () => {
    const shadedCount = shadedSlices.length;
    const currentVal = shadedCount / denominator;
    const targetVal = numerator / denominator;
    
    if (Math.abs(currentVal - targetVal) < 0.001) {
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

  // Helper to draw SVG pie slices
  const getSlicePath = (index, totalSlices, cx, cy, radius) => {
    if (totalSlices === 1) {
      return `M ${cx}, ${cy - radius} A ${radius},${radius} 0 1,1 ${cx}, ${cy + radius} A ${radius},${radius} 0 1,1 ${cx}, ${cy - radius} Z`;
    }
    const startAngle = (index / totalSlices) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((index + 1) / totalSlices) * 2 * Math.PI - Math.PI / 2;
    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy + radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy + radius * Math.sin(endAngle);
    
    // If slice > 180 degrees, large arc is 1
    const largeArcFlag = (1 / totalSlices) > 0.5 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="p-6 bg-stone-900 border-2 border-stone-800 rounded-3xl space-y-6">
      <div className="text-center space-y-2 flex flex-col items-center">
        <h3 className="text-xl font-black text-amber-300">Pecahan Interaktif</h3>
        <p className="text-sm font-bold text-stone-300 max-w-sm">
          Lorekkan pecahan <span className="text-xl text-emerald-400 font-black mx-1">{targetFraction}</span> dengan menekan pada bahagian bentuk di bawah.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-2">
        <button
          onClick={() => setCurrentShape("circle")}
          disabled={isCorrect}
          className={`p-2 rounded-xl border ${currentShape === 'circle' ? 'bg-amber-500 text-stone-950 border-amber-400' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
        >
          <PieChart className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentShape("rectangle")}
          disabled={isCorrect}
          className={`p-2 rounded-xl border ${currentShape === 'rectangle' ? 'bg-amber-500 text-stone-950 border-amber-400' : 'bg-stone-800 text-stone-400 border-stone-700'}`}
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center items-center py-4">
        {currentShape === "circle" ? (
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl drop-shadow-xl border-4 border-stone-700 bg-stone-800">
             <svg width="100%" height="100%" viewBox="0 0 200 200">
                {Array.from({ length: denominator }).map((_, i) => {
                  const isShaded = shadedSlices.includes(i);
                  return (
                    <path
                      key={i}
                      d={getSlicePath(i, denominator, 100, 100, 100)}
                      fill={isShaded ? "#10b981" : "#292524"}
                      stroke="#44403c"
                      strokeWidth={denominator > 1 ? "2" : "0"}
                      className={`cursor-pointer transition-colors duration-300 ${!isCorrect ? 'hover:opacity-80' : ''}`}
                      onClick={() => toggleSlice(i)}
                    />
                  );
                })}
             </svg>
          </div>
        ) : (
          <div className="w-full max-w-sm h-32 sm:h-48 border-4 border-stone-700 rounded-2xl overflow-hidden flex bg-stone-800 shadow-2xl drop-shadow-xl">
            {Array.from({ length: denominator }).map((_, i) => {
              const isShaded = shadedSlices.includes(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleSlice(i)}
                  className={`
                    flex-1 cursor-pointer transition-colors duration-300
                    ${isShaded ? 'bg-emerald-500' : 'bg-stone-800'}
                    ${i !== denominator - 1 ? 'border-r-4 border-stone-700' : ''}
                    ${!isCorrect ? 'hover:bg-opacity-80' : ''}
                  `}
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-stone-800">
        <div className="flex items-center gap-4 w-full justify-between sm:justify-center">
           <div className="text-center sm:text-right">
             <span className="text-xs text-stone-400 font-bold block">Dilorekkan:</span>
             <p className="text-2xl font-black text-white">{shadedSlices.length} <span className="text-stone-500">/</span> {denominator}</p>
           </div>
           
           {!isCorrect && (
              <button 
                onClick={handleReset}
                className="h-10 px-3 text-xs font-black text-rose-400 hover:text-rose-300 flex items-center gap-1.5 bg-rose-950/30 rounded-xl border border-rose-500/20"
              >
                <RotateCcw className="w-4 h-4" /> Padam
              </button>
           )}
        </div>

        {!isCorrect ? (
          <Button 
            onClick={handleCheck}
            disabled={shadedSlices.length === 0}
            className="w-full sm:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm rounded-xl border-b-4 border-emerald-700 active:translate-y-1 transition-all disabled:opacity-50"
          >
            Semak Jawapan
          </Button>
        ) : (
          <div className="px-6 py-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-black text-sm">Tahniah! Pecahan tepat.</span>
          </div>
        )}

        {showFeedback && !isCorrect && (
          <p className="text-rose-400 font-bold text-sm animate-pulse text-center">
            Lorekkan bilangan bahagian yang betul! Cuba lagi.
          </p>
        )}
      </div>
    </div>
  );
}
