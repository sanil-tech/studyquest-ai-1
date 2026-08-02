import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecommendationCard({ recommendations }) {
  const navigate = useNavigate();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-5 mt-4 text-white relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <Lightbulb className="text-yellow-300" size={18} />
          Cadangan AI Minggu Ini
        </h3>
        
        <ul className="space-y-3">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm text-indigo-50 leading-relaxed">
                {rec.message}
              </p>
              <button 
                onClick={() => navigate('/home')} // Route parent to child view for now
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold self-start flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 shadow-sm"
              >
                {rec.action}
                <ArrowRight size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
