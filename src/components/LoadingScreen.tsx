import React, { useEffect, useState } from 'react';
import { Music, Disc, Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc]/98 backdrop-blur-2xl flex flex-col items-center justify-center transition-opacity duration-700">
      <div className="relative flex flex-col items-center">
        {/* Soft luxury glow behind logo */}
        <div className="absolute w-44 h-44 bg-gradient-to-r from-amber-200/50 via-rose-200/40 to-indigo-200/50 rounded-full blur-3xl opacity-70 animate-pulse" />

        {/* Animated Vinyl Icon */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-xl animate-spin-slow">
          <Disc className="w-12 h-12 text-indigo-600" />
          <div className="absolute w-6 h-6 rounded-full bg-amber-500 border border-white" />
        </div>

        <h1 className="mt-6 text-2xl font-serif tracking-widest text-slate-900 font-bold">
          MUHAMMAD DZIKRON
        </h1>
        <p className="mt-2 text-xs tracking-widest text-slate-500 uppercase flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Songwriter & Composer
          <Music className="w-3.5 h-3.5 text-indigo-600" />
        </p>

        {/* Loading Bar */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 animate-pulse w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
