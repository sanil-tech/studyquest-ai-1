import React, { useState } from 'react';
import { loginParent } from '../../services/authService';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await loginParent(email, password);
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-stone-100 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 tracking-tight">
            StudyQuest
          </h1>
          <p className="text-stone-400 mt-2 font-medium">Platform Pembelajaran Pintar Malaysia</p>
        </div>

        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Log Masuk Ibu Bapa</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">E-mel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Kata Laluan</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Menyemak..." : "Log Masuk"} <LogIn className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center border-t border-stone-800 pt-6">
            <p className="text-stone-400 text-sm">
              Belum ada akaun?{' '}
              <button onClick={onNavigateRegister} className="text-indigo-400 hover:text-indigo-300 font-bold">
                Daftar Sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
