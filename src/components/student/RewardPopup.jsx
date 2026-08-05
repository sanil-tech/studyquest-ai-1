import React, { useEffect, useState } from 'react';
import { Star, ChevronUp } from 'lucide-react';

const RewardPopup = ({ rewards, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rewards) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [rewards, onClose]);

  if (!rewards && !visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-stone-900 border-2 border-amber-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] transform transition-transform duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        <div className="w-20 h-20 bg-amber-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/50 animate-bounce">
          <Star className="w-10 h-10 text-white fill-white" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2">Hebat!</h2>
        <p className="text-stone-400 text-sm font-medium mb-8">Misi berjaya diselesaikan.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase">XP Diperoleh</span>
            <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">
              +{rewards?.xp || 0} <ChevronUp className="w-4 h-4" />
            </span>
          </div>
          
          <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase">Bintang</span>
            <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
              +{rewards?.stars || 0} <Star className="w-4 h-4 fill-amber-400" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RewardPopup;
