import React from 'react';
import { Users, User, Plus } from 'lucide-react';

const ChildSwitcher = ({ childrenList, activeChildId, onSwitchChild, onAddNewChild }) => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl mb-6">
      <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
        <Users className="w-4 h-4 text-emerald-400" /> Profil Anak
      </h3>
      
      <div className="flex flex-wrap gap-4">
        {childrenList.map(child => (
          <button
            key={child.id}
            onClick={() => onSwitchChild(child.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
              activeChildId === child.id 
                ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30' 
                : 'bg-stone-950 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activeChildId === child.id ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-400'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold ${activeChildId === child.id ? 'text-emerald-400' : 'text-stone-300'}`}>
                {child.name}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500">
                {child.subject} • {child.level}
              </div>
            </div>
          </button>
        ))}

        <button 
          onClick={onAddNewChild}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-dashed border-stone-700 bg-stone-900/50 hover:bg-stone-800 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-stone-700 transition-colors">
            <Plus className="w-4 h-4 text-stone-400" />
          </div>
          <span className="text-sm font-bold text-stone-400 group-hover:text-stone-300">Tambah Anak</span>
        </button>
      </div>
    </div>
  );
};

export default ChildSwitcher;
