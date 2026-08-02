import React, { useState, useEffect } from 'react';
import { getPilotActivityFeed } from '../../services/pilotOperationsService';
import { Activity, BookOpen, AlertTriangle, MessageSquare, Shield } from 'lucide-react';

const PilotActivityFeed = () => {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    getPilotActivityFeed().then(setFeed);
  }, []);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'learning': return { icon: <BookOpen className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      case 'struggle': return { icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      case 'feedback': return { icon: <MessageSquare className="w-4 h-4" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      case 'admin': return { icon: <Shield className="w-4 h-4" />, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
      default: return { icon: <Activity className="w-4 h-4" />, color: "text-stone-400 bg-stone-800 border-stone-700" };
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6">
      <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-emerald-400" /> Activity Feed
      </h3>

      <div className="space-y-4">
        {feed.map((event) => {
          const style = getTypeStyle(event.type);
          return (
            <div key={event.id} className="flex gap-4">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${style.color}`}>
                  {style.icon}
                </div>
                {/* Connector line for feed */}
                <div className="absolute top-8 bottom-[-16px] left-1/2 w-px bg-stone-800 -translate-x-1/2 last:hidden"></div>
              </div>
              <div className="pt-1 pb-2">
                <p className="text-sm text-stone-300 font-medium">{event.text}</p>
                <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PilotActivityFeed;
