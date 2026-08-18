import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Validate requested admin credentials
      if (username.trim() === 'admin' && password === 'adminn') {
        localStorage.setItem('dzikron_admin_authenticated', 'true');
        setIsLoading(false);
        onLoginSuccess();
        onClose();
        setUsername('');
        setPassword('');
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau Password salah! (Gunakan admin / adminn)');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0099ff]/20 to-[#00ffc8]/20 border border-[#00ffc8]/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,255,200,0.2)]">
            <Lock className="w-7 h-7 text-[#00ffc8]" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            Portal Admin Dzikron
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk mengelola playlist lagu, lirik, dan konten website.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00ffc8]" />
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8] focus:ring-1 focus:ring-[#00ffc8] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#00ffc8]" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffc8] focus:ring-1 focus:ring-[#00ffc8] transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,200,0.3)]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk Administrator</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00ffc8]" />
            Akses Akselerasi Admin: <code className="text-[#00ffc8] font-mono bg-slate-900 px-1.5 py-0.5 rounded">admin</code> / <code className="text-[#00ffc8] font-mono bg-slate-900 px-1.5 py-0.5 rounded">adminn</code>
          </p>
        </div>
      </div>
    </div>
  );
};
