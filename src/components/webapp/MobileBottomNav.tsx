import React from 'react';
import {
  Home,
  Music2,
  FileText,
  User,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { WebAppTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: WebAppTab;
  onSelectTab: (tab: WebAppTab) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  isAdminLoggedIn,
  onOpenAdminLogin
}) => {
  const navItems: { id: WebAppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: 'Lagu', icon: <Music2 className="w-5 h-5" /> },
    { id: 'lyrics', label: 'Lirik', icon: <FileText className="w-5 h-5" /> },
    { id: 'about', label: 'Profil', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060a12]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
              isActive ? 'text-[#00ffc8]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isActive ? 'bg-[#00ffc8]/15 scale-105' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Admin Tab on Mobile */}
      <button
        onClick={() => {
          if (isAdminLoggedIn) {
            onSelectTab('admin');
          } else {
            onOpenAdminLogin();
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
          activeTab === 'admin' ? 'text-[#00ffc8]' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`p-1 rounded-lg transition ${activeTab === 'admin' ? 'bg-[#00ffc8]/15 scale-105' : ''}`}>
          {isAdminLoggedIn ? (
            <ShieldCheck className="w-5 h-5 text-[#00ffc8]" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
          Admin
        </span>
      </button>
    </div>
  );
};
