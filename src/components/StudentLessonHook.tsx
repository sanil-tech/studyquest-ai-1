import React, { useState } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import { EngagementBlock } from '../types/engagement';

interface StudentLessonHookProps {
  block: EngagementBlock;
}

export default function StudentLessonHook({ block }: StudentLessonHookProps) {
  const [mediaError, setMediaError] = useState(false);

  const handleMediaError = () => {
    setMediaError(true);
  };

  const playTTS = () => {
    // Placeholder for actual TTS implementation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(block.text_content);
      utterance.lang = 'ms-MY';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech tidak disokong pada peranti ini.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Media Container or Fallback */}
      <div className="relative w-full aspect-video bg-amber-50 rounded-3xl overflow-hidden shadow-lg border-4 border-white flex items-center justify-center">
        {block.media && !mediaError ? (
          block.media.type === 'VIDEO' ? (
            <video
              src={block.media.url}
              autoPlay
              muted
              playsInline
              loop
              onError={handleMediaError}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={block.media.url}
              alt="Media Pembelajaran"
              onError={handleMediaError}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          // Fallback Mascot State
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
              🐢
            </div>
            {mediaError && (
              <div className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-50 px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" /> Media tidak dapat dimuatkan
              </div>
            )}
          </div>
        )}
      </div>

      {/* Narrative Overlay */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-100 relative -mt-12 mx-4 z-10 flex gap-4 items-start">
        {/* Mascot Avatar for Narrative */}
        <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-emerald-100 hidden sm:flex">
          🐢
        </div>
        
        <div className="flex-1 space-y-4">
          <p className="text-lg sm:text-xl font-medium text-stone-800 leading-relaxed">
            {block.text_content}
          </p>
          
          {/* TTS Audio Button - Touch target optimized >= 48px */}
          <div className="flex justify-end">
            <button
              onClick={playTTS}
              className="flex items-center gap-2 px-6 py-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl transition-all active:scale-95 shadow-sm"
              aria-label="Dengar audio teks ini"
            >
              <Volume2 className="w-6 h-6" /> 
              <span className="hidden sm:inline">Dengar Cerita</span>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
