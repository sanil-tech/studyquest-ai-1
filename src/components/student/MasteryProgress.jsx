import React from 'react';

export default function MasteryProgress({ subjectName, progressPercentage }) {
  // Clamp progress between 0 and 100 for safety
  const safeProgress = Math.min(Math.max(progressPercentage || 0, 0), 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      
      {/* Subject Header */}
      <div className="flex justify-between items-end">
        <h3 className="font-bold text-gray-800 text-lg">{subjectName || "Matematik"}</h3>
        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm">
          {safeProgress}% Dikuasai
        </span>
      </div>

      {/* Visual Progress Bar (Friendly rounded style) */}
      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      {/* Encouragement Text */}
      <p className="text-xs text-gray-500 font-medium">
        {safeProgress === 100 
          ? "Hebat! Anda menguasai semua topik."
          : safeProgress > 50 
            ? "Teruskan usaha! Anda hampir di puncak."
            : "Satu langkah pada satu masa."}
      </p>

    </div>
  );
}
