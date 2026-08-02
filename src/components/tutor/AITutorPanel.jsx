import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TutorMessage from './TutorMessage';
import HintButton from './HintButton';
import ExplanationCard from './ExplanationCard';
import { generateHint, explainConcept, respondToMistake, generateEncouragement } from '../../services/aiTutorService';

const AITutorPanel = ({ context, mistakeType, isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const newMessages = [];
      
      if (mistakeType) {
        const misconception = respondToMistake(mistakeType);
        if (misconception) {
          newMessages.push({ id: Date.now(), text: misconception, type: 'misconception' });
        } else {
          newMessages.push({ id: Date.now(), text: generateEncouragement('STRUGGLE'), type: 'encouragement' });
        }
      } else {
        newMessages.push({ id: Date.now(), text: "Hello! Saya Suku. Perlukan bantuan?", type: 'hint' });
      }
      setMessages(newMessages);
      setHintLevel(0);
    }
  }, [isVisible, mistakeType]);

  const requestHint = () => {
    if (hintLevel >= 3) return;
    const nextLevel = hintLevel + 1;
    setHintLevel(nextLevel);
    
    // Using GENERIC category for prototype. Real implementation would pass category based on SP.
    const hint = generateHint(context, nextLevel, "GENERIC");
    
    setMessages(prev => [...prev, { id: Date.now(), text: hint, type: 'hint' }]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-24 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold text-lg">AI Tutor Suku</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 max-h-96">
        {messages.map(msg => (
          <TutorMessage key={msg.id} message={msg.text} type={msg.type} />
        ))}
        
        {hintLevel === 3 && (
          <ExplanationCard 
            title="Konsep Utama" 
            content={explainConcept(context, context?.currentSkill?.title || "Topik ini", "Visual Bantuan")}
          />
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
        <HintButton onClick={requestHint} hintsRemaining={3 - hintLevel} />
      </div>
    </div>
  );
};

export default AITutorPanel;
