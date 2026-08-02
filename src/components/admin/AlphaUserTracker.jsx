import React from 'react';
import { Users, Activity, HelpCircle, BrainCircuit } from 'lucide-react';

const AlphaUserTracker = ({ users }) => {
  if (!users) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'STRUGGLING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'AT_RISK': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-stone-400 bg-stone-900 border-stone-800';
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" /> Alpha Cohort Telemetry
        </h3>
        <p className="text-sm text-stone-400 mt-1">Live tracking of the 5 closed-alpha families.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {users.map(user => (
          <div key={user.id} className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-white text-sm">{user.child}</h4>
                <p className="text-xs text-stone-500">{user.family}</p>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(user.status)}`}>
                {user.status.replace('_', ' ')}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-stone-900 rounded-lg p-2 text-center">
                <Activity className="w-3 h-3 text-sky-500 mx-auto mb-1" />
                <div className="text-lg font-black text-white leading-none">{user.logins}</div>
                <div className="text-[9px] text-stone-500 uppercase mt-1">Logins</div>
              </div>
              <div className="bg-stone-900 rounded-lg p-2 text-center">
                <BrainCircuit className="w-3 h-3 text-emerald-500 mx-auto mb-1" />
                <div className="text-lg font-black text-white leading-none">{user.lessonsCompleted}</div>
                <div className="text-[9px] text-stone-500 uppercase mt-1">Lessons</div>
              </div>
              <div className="bg-stone-900 rounded-lg p-2 text-center">
                <HelpCircle className="w-3 h-3 text-amber-500 mx-auto mb-1" />
                <div className="text-lg font-black text-white leading-none">{user.tutorInvocations}</div>
                <div className="text-[9px] text-stone-500 uppercase mt-1">AI Hints</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlphaUserTracker;
