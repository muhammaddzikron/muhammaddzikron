import React, { useRef, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Lock,
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
        <button
          onClick={() => {
            if (isAdminLoggedIn) {
              onSelectTab('admin');
            } else {
              onOpenAdminLogin();
            }
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
            isAdminLoggedIn
              ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_12px_rgba(0,255,200,0.35)]'
              : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-[#00ffc8]/50'
          }`}
        >
          {isAdminLoggedIn ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Panel</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-[#00ffc8]" />
              <span className="hidden sm:inline">Login Admin</span>
            </>
          )}
        </button>

      </div>

    </header>
  );
};
