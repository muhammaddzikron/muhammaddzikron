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
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-[0_2px_15px_rgba(15,23,42,0.03)]">
      
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 cursor-pointer transition-colors"
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
            className="w-full pl-9 pr-10 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition shadow-inner"
          />
          <kbd className="hidden lg:inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-400 border border-slate-200 shadow-sm">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Now Playing Mini Capsule */}
        {currentSong && (
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs text-slate-700 shadow-sm">
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 text-indigo-600">
              <span className={`w-0.5 bg-indigo-600 rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
              <span className={`w-0.5 bg-indigo-600 rounded-full transition-all ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2.5'}`} />
              <span className={`w-0.5 bg-indigo-600 rounded-full transition-all ${isPlaying ? 'h-2 animate-pulse' : 'h-1'}`} />
            </div>

            <span className="font-semibold truncate max-w-[130px] text-slate-900">
              {currentSong.title}
            </span>

            <button
              onClick={onPlayPause}
              className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shadow-sm"
          title="Tombol Pintas Keyboard"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Admin Quick Action */}
        {isAdminLoggedIn ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer shadow-sm ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md font-extrabold'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dasbor Admin</span>
            </button>

            <button
              onClick={onAdminLogout}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shadow-sm"
              title="Keluar dari mode Admin (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 transition cursor-pointer shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Login Admin</span>
          </button>
        )}

      </div>

    </header>
  );
};
