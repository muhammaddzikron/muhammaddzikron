import React from 'react';
import {
  Home,
  Music2,
  FileText,
  User,
  Send,
  ShieldCheck,
  Download
} from 'lucide-react';
import { WebAppTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: WebAppTab;
  onSelectTab: (tab: WebAppTab) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  isAdminLoggedIn
}) => {
  const navItems: { id: WebAppTab; label: string; icon: React.ReactNode; activeColor: string }[] = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" />, activeColor: 'text-emerald-700 bg-emerald-50' },
    { id: 'library', label: 'Lagu', icon: <Music2 className="w-5 h-5" />, activeColor: 'text-indigo-700 bg-indigo-50' },
    { id: 'lyrics', label: 'Lirik', icon: <FileText className="w-5 h-5" />, activeColor: 'text-amber-800 bg-amber-50' },
    { id: 'download', label: 'Unduh', icon: <Download className="w-5 h-5" />, activeColor: 'text-sky-700 bg-sky-50' },
    { id: 'about', label: 'Profil', icon: <User className="w-5 h-5" />, activeColor: 'text-purple-700 bg-purple-50' },
    { id: 'contact', label: 'Kontak', icon: <Send className="w-5 h-5" />, activeColor: 'text-rose-700 bg-rose-50' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              isActive ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isActive ? `${item.activeColor} scale-105 shadow-xs` : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Admin Tab on Mobile - only shown when logged in */}
      {isAdminLoggedIn && (
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'admin' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${activeTab === 'admin' ? 'bg-amber-50 text-amber-700 scale-105' : ''}`}>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
            Admin
          </span>
        </button>
      )}
    </div>
  );
};
