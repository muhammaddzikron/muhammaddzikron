import React from 'react';
import {
  Home,
  Music2,
  FileText,
  User,
  Send,
  ShieldCheck,
  LogOut,
  Heart,
  Disc3,
  Sparkles,
  Download
} from 'lucide-react';
import { Song } from '../../types/song';
import { VisitorStatsWidget } from './VisitorStatsWidget';

export type WebAppTab = 'home' | 'library' | 'lyrics' | 'download' | 'about' | 'contact' | 'admin';

interface SidebarProps {
  activeTab: WebAppTab;
  onSelectTab: (tab: WebAppTab) => void;
  songsCount: number;
  favoritesCount: number;
  downloadCount?: number;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin?: () => void;
  onAdminLogout?: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

interface NavItemConfig {
  id: WebAppTab;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  // Specific color accents for vibrant menu buttons
  activeBg: string;
  activeText: string;
  activeBorder: string;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
  hoverText: string;
  badgeBg: string;
  badgeText: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  songsCount,
  favoritesCount,
  downloadCount,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  currentSong,
  isPlaying
}) => {
  const mainNavItems: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Beranda',
      icon: <Home className="w-4 h-4" />,
      activeBg: 'bg-emerald-50/90',
      activeText: 'text-emerald-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.12)]',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      hoverBg: 'hover:bg-emerald-50/60',
      hoverText: 'hover:text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800'
    },
    {
      id: 'library',
      label: 'Semua Lagu',
      icon: <Music2 className="w-4 h-4" />,
      badge: songsCount,
      activeBg: 'bg-indigo-50/90',
      activeText: 'text-indigo-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-indigo-600 shadow-[0_2px_12px_rgba(99,102,241,0.12)]',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      hoverBg: 'hover:bg-indigo-50/60',
      hoverText: 'hover:text-indigo-900',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800'
    },
    {
      id: 'lyrics',
      label: 'Studio Lirik',
      icon: <FileText className="w-4 h-4" />,
      activeBg: 'bg-amber-50/90',
      activeText: 'text-amber-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-amber-500 shadow-[0_2px_12px_rgba(245,158,11,0.12)]',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      hoverBg: 'hover:bg-amber-50/60',
      hoverText: 'hover:text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800'
    },
    {
      id: 'download',
      label: 'Download Area',
      icon: <Download className="w-4 h-4" />,
      badge: downloadCount,
      activeBg: 'bg-sky-50/90',
      activeText: 'text-sky-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-sky-500 shadow-[0_2px_12px_rgba(14,165,233,0.12)]',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-700',
      hoverBg: 'hover:bg-sky-50/60',
      hoverText: 'hover:text-sky-900',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800'
    },
    {
      id: 'about',
      label: 'Profil Komposer',
      icon: <User className="w-4 h-4" />,
      activeBg: 'bg-purple-50/90',
      activeText: 'text-purple-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-purple-600 shadow-[0_2px_12px_rgba(168,85,247,0.12)]',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      hoverBg: 'hover:bg-purple-50/60',
      hoverText: 'hover:text-purple-900',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800'
    },
    {
      id: 'contact',
      label: 'Kontak & Pesanan',
      icon: <Send className="w-4 h-4" />,
      activeBg: 'bg-rose-50/90',
      activeText: 'text-rose-950 font-extrabold',
      activeBorder: 'border-l-4 border-l-rose-500 shadow-[0_2px_12px_rgba(244,63,94,0.12)]',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      hoverBg: 'hover:bg-rose-50/60',
      hoverText: 'hover:text-rose-900',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800'
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/95 border-r border-slate-200/90 backdrop-blur-2xl h-screen select-none shrink-0 z-30 shadow-[4px_0_24px_rgba(15,23,42,0.02)]">
      
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-100">
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1.5px] shadow-[0_4px_16px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Disc3 className={`w-6 h-6 text-indigo-600 ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          </div>

          <div className="overflow-hidden min-w-0">
            <h1 className="text-sm lg:text-base font-serif font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors truncate">
              Muhammad Dzikron
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                Karya Tanpa Batas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Menu Utama (Warna-Warni) */}
        <div>
          <div className="px-3 mb-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Eksplorasi
          </div>
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? `${item.activeBg} ${item.activeText} ${item.activeBorder}`
                      : `text-slate-600 ${item.hoverBg} ${item.hoverText}`
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                        isActive
                          ? `${item.iconBg} ${item.iconColor} scale-105 shadow-sm`
                          : `${item.iconBg} ${item.iconColor} opacity-85 group-hover:opacity-100`
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? `${item.badgeBg} ${item.badgeText}`
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Koleksi Cepat (Warna-Warni) */}
        <div>
          <div className="px-3 mb-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Koleksi Saya</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
          <div className="space-y-1.5">
            {/* Lagu Favorit (Pink) */}
            <button
              onClick={() => onSelectTab('library')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-pink-50/70 hover:text-pink-900 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4 fill-pink-500/20" />
                </span>
                <span className="truncate">Lagu Favorit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold font-mono">
                {favoritesCount}
              </span>
            </button>

            {/* Sedang Diputar (Teal) */}
            <button
              onClick={() => onSelectTab('lyrics')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-teal-50/70 hover:text-teal-900 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="truncate">Sedang Diputar</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[85px]">
                {currentSong ? currentSong.title : 'None'}
              </span>
            </button>
          </div>
        </div>

        {/* Statistik Pengunjung & Sumber Trafik */}
        <div className="pt-2 border-t border-slate-100">
          <VisitorStatsWidget />
        </div>

      </div>

      {/* Sidebar Footer (Admin Section - only visible when logged in) */}
      {isAdminLoggedIn && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/90 space-y-2">
          <button
            onClick={() => onSelectTab('admin')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-extrabold shadow-md'
                : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Studio Admin CMS</span>
          </button>

          {onAdminLogout && (
            <button
              onClick={onAdminLogout}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar / Logout Admin</span>
            </button>
          )}
        </div>
      )}

    </aside>
  );
};
