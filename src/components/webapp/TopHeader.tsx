import React, { useRef, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Lock,
  LogOut,
  Play,
  Pause,
  HelpCircle,
  Menu
} from 'lucide-react';
import { Song } from '../../types/song';
import { WebAppTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: WebAppTab;
  onSelectTab: (tab: WebAppTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenShortcuts: () => void;
  onToggleMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  currentSong,
  isPlaying,
  onPlayPause,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenShortcuts,
  onToggleMobileMenu
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#070b14]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-lg mx-2 sm:mx-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeTab !== 'library' && e.target.value.trim().length > 0) {
                onSelectTab('library');
              }
            }}
            placeholder="Cari lagu, lirik, genre, artis... (Tekan '/')"
            className="w-full pl-9 pr-10 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00ffc8] focus:ring-1 focus:ring-[#00ffc8] transition"
          />
          <kbd className="hidden lg:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Now Playing Mini Capsule */}
        {currentSong && (
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-200">
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 text-[#00ffc8]">
              <span className={`w-0.5 bg-[#00ffc8] rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-[#00ffc8] rounded-full transition-all ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2.5'}`} />
              <span className={`w-0.5 bg-[#00ffc8] rounded-full transition-all ${isPlaying ? 'h-2 animate-pulse' : 'h-1'}`} />
            </div>

            <span className="font-semibold truncate max-w-[130px] text-white">
              {currentSong.title}
            </span>

            <button
              onClick={onPlayPause}
              className="p-1 rounded-full bg-[#00ffc8]/20 hover:bg-[#00ffc8] text-[#00ffc8] hover:text-slate-950 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
          title="Tombol Pintas Keyboard"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Admin Quick Action */}
        {isAdminLoggedIn ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#00ffc8] text-slate-950 border-[#00ffc8] shadow-[0_0_12px_rgba(0,255,200,0.35)]'
                  : 'bg-slate-900 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dasbor Admin</span>
            </button>

            <button
              onClick={onAdminLogout}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition cursor-pointer"
              title="Keluar dari mode Admin (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-slate-900 text-slate-200 border border-slate-800 hover:border-[#00ffc8]/50 hover:text-white transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span className="hidden sm:inline">Login Admin</span>
          </button>
        )}

      </div>

    </header>
  );
};
