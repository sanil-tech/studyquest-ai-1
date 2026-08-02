import React from 'react';
import { Lightbulb } from 'lucide-react';

const ExplanationCard = ({ title, content, visual = null }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 animate-fade-in-up mt-4">
      <div className="flex items-center gap-3 mb-3 text-purple-600">
        <Lightbulb size={24} className="animate-pulse" />
        <h3 className="text-xl font-bold">{title || 'Mari Belajar'}</h3>
      </div>
      
      {visual && (
        <div className="bg-purple-50 rounded-xl p-4 mb-4 flex justify-center text-4xl">
          {visual}
        </div>
      )}
      
      <p className="text-gray-700 text-lg leading-relaxed">{content}</p>
    </div>
  );
};

export default ExplanationCard;
