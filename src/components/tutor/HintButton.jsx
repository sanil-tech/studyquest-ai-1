import React from 'react';
import { HelpCircle } from 'lucide-react';

const HintButton = ({ onClick, hintsRemaining = 3 }) => {
  return (
    <button
      onClick={onClick}
      disabled={hintsRemaining <= 0}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md transition-transform active:scale-95 ${
        hintsRemaining > 0 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-300 hover:to-orange-300' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <HelpCircle size={20} />
      <span>Minta Bantuan ({hintsRemaining})</span>
    </button>
  );
};

export default HintButton;
