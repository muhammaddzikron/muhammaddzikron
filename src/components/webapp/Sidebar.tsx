import React from 'react';
import {
  Home,
  Music2,
  FileText,
  User,
  Image as ImageIcon,
  Send,
  ShieldCheck,
  Lock,
  LogOut,
  Heart,
  Disc3,
  Sparkles
} from 'lucide-react';
import { Song } from '../../types/song';

export type WebAppTab = 'home' | 'library' | 'lyrics' | 'about' | 'gallery' | 'contact' | 'admin';

interface SidebarProps {
  activeTab: WebAppTab;
  onSelectTab: (tab: WebAppTab) => void;
  songsCount: number;
  favoritesCount: number;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout?: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  songsCount,
  favoritesCount,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  currentSong,
  isPlaying
}) => {
  const mainNavItems: { id: WebAppTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { id: 'library', label: 'Semua Lagu', icon: <Music2 className="w-4 h-4" />, badge: songsCount },
    { id: 'lyrics', label: 'Studio Lirik', icon: <FileText className="w-4 h-4" /> },
    { id: 'about', label: 'Profil Komposer', icon: <User className="w-4 h-4" /> },
    { id: 'gallery', label: 'Galeri Studio', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'contact', label: 'Kontak & Pesanan', icon: <Send className="w-4 h-4" /> }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#090d16]/90 border-r border-slate-800/80 backdrop-blur-xl h-screen select-none shrink-0 z-30">
      
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/70">
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0099ff] via-[#00d4ff] to-[#00ffc8] p-[1.5px] shadow-[0_0_20px_rgba(0,255,200,0.25)] group-hover:shadow-[0_0_25px_rgba(0,255,200,0.45)] transition-all">
            <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center">
              <Disc3 className={`w-6 h-6 text-[#00ffc8] ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          </div>

          <div className="overflow-hidden min-w-0">
            <h1 className="text-sm lg:text-base font-serif font-extrabold text-white tracking-tight leading-tight group-hover:text-[#00ffc8] transition-colors truncate">
              Muhammad Dzikron
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse shrink-0"></span>
              <span className="text-[11px] font-medium tracking-normal text-slate-400 truncate">
                Jarak Yang Tak Berujung
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Menu Utama */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Eksplorasi
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0099ff]/20 to-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30 shadow-[0_0_15px_rgba(0,255,200,0.15)] font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#00ffc8]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#00ffc8] text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Koleksi Cepat */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>Koleksi Saya</span>
            <Sparkles className="w-3 h-3 text-[#00ffc8]" />
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('library')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                <span>Lagu Favorit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {favoritesCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('lyrics')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-[#0099ff]" />
                <span>Sedang Diputar</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                {currentSong ? currentSong.title : 'None'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Sidebar Footer (Admin Section) */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <button
          onClick={() => {
            if (isAdminLoggedIn) {
              onSelectTab('admin');
            } else {
              onOpenAdminLogin();
            }
          }}
          className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            isAdminLoggedIn || activeTab === 'admin'
              ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_15px_rgba(0,255,200,0.3)] hover:opacity-90'
              : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-[#00ffc8]/50 hover:text-white'
          }`}
        >
          {isAdminLoggedIn ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Studio Admin CMS</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-[#00ffc8]" />
              <span>Login Admin CMS</span>
            </>
          )}
        </button>

        {isAdminLoggedIn && onAdminLogout && (
          <button
            onClick={onAdminLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar / Logout Admin</span>
          </button>
        )}
      </div>

    </aside>
  );
};
