import React, { useState } from 'react';
import { User, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import onboardingRules from '../../data/onboardingRules.json';

const CreateChildProfile = ({ onCreateProfile }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(onboardingRules.levels.find(l => l.active)?.id || '');
  const [curriculum, setCurriculum] = useState(onboardingRules.curriculums.find(c => c.active)?.id || '');
  const [subject, setSubject] = useState(onboardingRules.subjects.find(s => s.active)?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onCreateProfile({ name, level, curriculum, subject });
    setIsLoading(false);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white">Tambah Profil Anak</h2>
        <p className="text-stone-400 text-sm mt-2">Daftar anak anda untuk memulakan pengembaraan pembelajaran.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nama Panggilan</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <input 
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Cth: Ali"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Darjah / Tahun</label>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
            >
              {onboardingRules.levels.map(l => (
                <option key={l.id} value={l.id} disabled={!l.active}>
                  {l.name} {!l.active && '(Akan Datang)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Subjek Fokus</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
            >
              {onboardingRules.subjects.map(s => (
                <option key={s.id} value={s.id} disabled={!s.active}>
                  {s.name} {!s.active && '(Akan Datang)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? "Menyimpan..." : "Cipta Profil"} <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default CreateChildProfile;
