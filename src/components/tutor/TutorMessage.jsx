import React from 'react';
import { Bot } from 'lucide-react';

const TutorMessage = ({ message, type = 'hint' }) => {
  const isError = type === 'misconception';
  const isEncouragement = type === 'encouragement';
  
  let bgClass = 'bg-blue-50 border-blue-200 text-blue-900';
  let iconColor = 'text-blue-500';
  
  if (isError) {
    bgClass = 'bg-orange-50 border-orange-200 text-orange-900';
    iconColor = 'text-orange-500';
  } else if (isEncouragement) {
    bgClass = 'bg-green-50 border-green-200 text-green-900';
    iconColor = 'text-green-500';
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${bgClass} animate-fade-in-up shadow-sm`}>
      <div className={`p-2 bg-white rounded-full shadow-sm ${iconColor}`}>
        <Bot size={24} />
      </div>
      <div className="flex-1">
        <p className="text-lg font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default TutorMessage;
