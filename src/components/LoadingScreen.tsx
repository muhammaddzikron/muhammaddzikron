import React, { useEffect, useState } from 'react';
import { Music, Disc, Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-700">
      <div className="relative flex flex-col items-center">
        {/* Glow behind logo */}
        <div className="absolute w-36 h-36 bg-gradient-to-r from-[#0099ff] to-[#00ffc8] rounded-full blur-2xl opacity-40 animate-pulse" />

        {/* Animated Vinyl Icon */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-slate-900 border-2 border-[#00ffc8]/50 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,200,0.3)] animate-spin-slow">
          <Disc className="w-12 h-12 text-[#00ffc8]" />
          <div className="absolute w-6 h-6 rounded-full bg-[#050505] border border-[#0099ff]" />
        </div>

        <h1 className="mt-6 text-2xl font-serif tracking-widest text-gradient font-bold">
          MUHAMMAD DZIKRON
        </h1>
        <p className="mt-2 text-xs tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00ffc8]" />
          Songwriter & Composer
          <Music className="w-3.5 h-3.5 text-[#0099ff]" />
        </p>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0099ff] to-[#00ffc8] animate-pulse w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
