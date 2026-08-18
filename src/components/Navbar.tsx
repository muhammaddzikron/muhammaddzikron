import React, { useState, useEffect } from 'react';
import { Music, Menu, X, Database, Disc, Shield, Lock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenSheetConfig: () => void;
  isLiveSheet: boolean;
  activeSongTitle?: string;
  isPlaying?: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSheetConfig,
  isLiveSheet,
  activeSongTitle,
  isPlaying,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAdminDashboard
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['home', 'tentang', 'playlist', 'prestasi', 'kontak'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Tentang', href: '#tentang', id: 'tentang' },
    { name: 'Playlist', href: '#playlist', id: 'playlist' },
    { name: 'Prestasi', href: '#prestasi', id: 'prestasi' },
    { name: 'Kontak', href: '#kontak', id: 'kontak' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#0099ff] to-[#00ffc8] p-[1.5px] shadow-[0_0_15px_rgba(0,255,200,0.4)] group-hover:shadow-[0_0_25px_rgba(0,255,200,0.8)] transition-all duration-300">
            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
              <Disc className={`w-5 h-5 text-[#00ffc8] ${isPlaying ? 'animate-spin-slow' : ''}`} />
            </div>
          </div>
          <div>
            <span className="text-lg font-serif tracking-wider font-bold text-white group-hover:text-[#00ffc8] transition-colors block leading-none">
              M. DZIKRON
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-sans block mt-0.5">
              Songwriter & Composer
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-semibold shadow-[0_0_15px_rgba(0,255,200,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Admin Login / Dashboard Button */}
          <button
            onClick={isAdminLoggedIn ? onOpenAdminDashboard : onOpenAdminLogin}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 border-transparent shadow-[0_0_15px_rgba(0,255,200,0.4)] hover:scale-105'
                : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:border-[#00ffc8] hover:text-white'
            }`}
            title={isAdminLoggedIn ? 'Buka Admin Dashboard' : 'Login Admin Portal'}
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-[#00ffc8]" />
                <span>Login Admin</span>
              </>
            )}
          </button>

          {/* Spreadsheet Sync Status Button */}
          <button
            onClick={onOpenSheetConfig}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border transition-all ${
              isLiveSheet
                ? 'bg-[#00ffc8]/10 text-[#00ffc8] border-[#00ffc8]/30 hover:bg-[#00ffc8]/20'
                : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Kelola Integrasi Google Spreadsheet & Drive"
          >
            <Database className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span>{isLiveSheet ? 'Spreadsheet Sync Active' : 'Config G-Drive'}</span>
            <span className={`w-2 h-2 rounded-full ${isLiveSheet ? 'bg-[#00ffc8] animate-ping' : 'bg-amber-400'}`} />
          </button>

          {/* Quick Listening Indicator if playing */}
          {activeSongTitle && (
            <a
              href="#playlist"
              className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 border border-slate-700 hover:border-[#00ffc8] text-slate-200 flex items-center gap-2 truncate max-w-[180px]"
            >
              <Music className={`w-3.5 h-3.5 text-[#00ffc8] ${isPlaying ? 'animate-bounce' : ''}`} />
              <span className="truncate">{activeSongTitle}</span>
            </a>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={isAdminLoggedIn ? onOpenAdminDashboard : onOpenAdminLogin}
            className={`p-2 rounded-lg border text-xs font-bold ${
              isAdminLoggedIn
                ? 'bg-[#00ffc8] text-slate-950 border-[#00ffc8]'
                : 'bg-slate-800/80 border-slate-700 text-[#00ffc8]'
            }`}
            title="Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSheetConfig}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-[#00ffc8]"
            title="G-Drive Sync"
          >
            <Database className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#00ffc8]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d]/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-6 transition-all duration-300 shadow-2xl">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === link.id
                    ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAdminLoggedIn) {
                    onOpenAdminDashboard();
                  } else {
                    onOpenAdminLogin();
                  }
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {isAdminLoggedIn ? 'Buka Dashboard Admin' : 'Login Portal Admin'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSheetConfig();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/30 flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                Pengaturan Google Spreadsheet API
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
