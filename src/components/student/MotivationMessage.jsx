import React from 'react';
import { generateMotivationMessage } from '../../services/retentionService';
import { MessageCircle } from 'lucide-react';

const MotivationMessage = ({ state = 'success' }) => {
  const message = generateMotivationMessage(state);

  return (
    <div className="flex items-start gap-4">
      {/* Avatar placeholder for AI Tutor / Mascot */}
      <div className="w-12 h-12 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
      
      {/* Speech Bubble */}
      <div className="relative bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-none p-4 shadow-xl">
        {/* Pointer */}
        <div className="absolute -left-2 top-0 w-4 h-4 bg-stone-900 border-l border-t border-stone-800 transform -skew-x-12" />
        
        <p className="relative z-10 text-sm font-medium text-stone-200">
          "{message}"
        </p>
      </div>
    </div>
  );
};

export default MotivationMessage;
