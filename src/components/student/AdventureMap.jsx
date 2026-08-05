import React from 'react';
import { Map, Lock, CheckCircle2 } from 'lucide-react';
import worldMap from '../../data/worldMap.json';

const AdventureMap = ({ currentWorldId, masteryProfile }) => {
  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Map className="w-64 h-64 text-amber-500" />
      </div>

      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6 relative z-10">
        <Map className="w-6 h-6 text-emerald-400" />
        Peta Pengembaraan
      </h2>

      <div className="flex flex-col gap-4 relative z-10">
        {worldMap.map((world, index) => {
          const isUnlocked = world.world_id <= currentWorldId;
          const isCurrent = world.world_id === currentWorldId;
          const isCompleted = world.world_id < currentWorldId;

          return (
            <div 
              key={world.world_id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isCurrent 
                  ? "bg-emerald-900/30 border-emerald-500/50 ring-2 ring-emerald-500/30" 
                  : isCompleted
                  ? "bg-stone-800/50 border-stone-700"
                  : "bg-stone-950/80 border-stone-800 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${
                  isCurrent ? "bg-emerald-500 text-white shadow-emerald-500/50" : 
                  isCompleted ? "bg-stone-700 text-stone-300" : 
                  "bg-stone-900 text-stone-600"
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className={`font-black text-lg ${isUnlocked ? 'text-stone-100' : 'text-stone-500'}`}>
                    {world.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">{world.description}</p>
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : isCurrent ? (
                  <div className="text-xs font-black text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full animate-pulse">
                    DI SINI
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 bg-stone-900 px-3 py-1.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Perlu {world.unlock_requirement.threshold}% {world.unlock_requirement.topic}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdventureMap;
