import React from 'react';
import { ArrowUp, Disc, Music, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin, isAdminLoggedIn }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-slate-900 bg-[#030303] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-900">
          
          {/* Left: Brand */}
          <div className="md:col-span-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0099ff] to-[#00ffc8] p-[1.5px]">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                <Disc className="w-6 h-6 text-[#00ffc8]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Muhammad Dzikron</h3>
              <p className="text-xs text-slate-400">Songwriter & Music Composer Official Website</p>
            </div>
          </div>

          {/* Right: Quick Links & Back to Top */}
          <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-6">
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="#home" className="hover:text-white transition">Home</a>
              <a href="#tentang" className="hover:text-white transition">Tentang</a>
              <a href="#playlist" className="hover:text-white transition">Playlist</a>
              <a href="#kontak" className="hover:text-white transition">Kontak</a>
              {onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  className="hover:text-[#00ffc8] transition flex items-center gap-1 cursor-pointer text-[#00ffc8]/80 font-bold"
                >
                  <Lock className="w-3 h-3" />
                  <span>{isAdminLoggedIn ? 'Admin Panel' : 'Login Admin'}</span>
                </button>
              )}
            </div>

            <button
              onClick={scrollToTop}
              className="p-3 rounded-full glass-card hover:border-[#00ffc8]/50 text-slate-300 hover:text-[#00ffc8] transition-all cursor-pointer shadow-lg"
              title="Kembali ke Atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Muhammad Dzikron. All Rights Reserved. Songwriter & Composer.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan rasa & melodi <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
