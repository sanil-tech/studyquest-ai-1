import React from 'react';
import { generateCertificate } from '../../services/learningEvidenceService';
import { Award } from 'lucide-react';

const ProgressCertificate = ({ studentId, topicName }) => {
  let cert = null;
  try {
    cert = generateCertificate(studentId, topicName);
  } catch (e) {
    return null;
  }

  if (!cert || !cert.earned) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-1 shadow-2xl overflow-hidden relative group">
      <div className="bg-stone-950/90 backdrop-blur-xl rounded-[22px] p-8 text-center relative h-full flex flex-col items-center justify-center">
        
        {/* Animated Background Rays */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
          <div className="absolute inset-[-100%] animate-[spin_20s_linear_infinite]" 
               style={{ background: 'conic-gradient(from 0deg, transparent 0 45deg, rgba(251, 191, 36, 0.5) 45deg 90deg, transparent 90deg 135deg, rgba(251, 191, 36, 0.5) 135deg 180deg, transparent 180deg 225deg, rgba(251, 191, 36, 0.5) 225deg 270deg, transparent 270deg 315deg, rgba(251, 191, 36, 0.5) 315deg 360deg)' }} 
          />
        </div>

        <Award className="w-16 h-16 text-amber-400 mb-4 relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1 relative z-10">
          {cert.title}
        </h3>
        
        <p className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4 relative z-10">
          {cert.message}
        </p>
        
        <div className="mt-auto relative z-10 border-t border-stone-800 pt-4 w-full">
          <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
            Disahkan pada {cert.date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressCertificate;
