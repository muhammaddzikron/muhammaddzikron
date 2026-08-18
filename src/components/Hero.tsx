import React, { useState, useEffect } from 'react';
import { Play, Mail, Music, Sparkles, Disc, Instagram, Youtube, Radio } from 'lucide-react';

interface HeroProps {
  onPlayFirstSong: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlayFirstSong }) => {
  const roles = [
    'Pencipta Lagu',
    'Music Composer',
    'Creative Artist',
    'Digital Creator'
  ];

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText((prev) => prev.substring(0, prev.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setDisplayText((prev) => currentRole.substring(0, prev.length + 1));
      }, 90);
    }

    if (!isDeleting && displayText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentRoleIndex]);

  return (
    <section id="home" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Big Profile Photo with Luxury Neon Glow */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <div className="relative group">
              {/* Outer Neon Glow Rings */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0099ff] via-[#00ffc8] to-purple-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-glow" />
              
              {/* Spinning Vinyl Accent Badge */}
              <div className="absolute -top-6 -right-6 z-20 w-20 h-20 rounded-full bg-[#050505] border-2 border-[#00ffc8] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,200,0.5)] animate-spin-slow hidden sm:flex">
                <Disc className="w-10 h-10 text-[#00ffc8]" />
                <div className="absolute w-4 h-4 rounded-full bg-[#0099ff]" />
              </div>

              {/* Main Photo Card */}
              <div className="relative w-72 h-96 sm:w-80 sm:h-[450px] rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-slate-900 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80"
                  alt="Muhammad Dzikron"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-105 contrast-105"
                />

                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-[#00ffc8]/20 border border-[#00ffc8]/50 text-[#00ffc8] backdrop-blur-md inline-flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3" /> Official Portfolio
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">Muhammad Dzikron</h3>
                  <p className="text-xs text-slate-300">Songwriter & Composer</p>
                </div>
              </div>

              {/* Floating Stat Chip */}
              <div className="absolute -bottom-6 -left-6 z-20 glass-card px-4 py-3 rounded-2xl border border-slate-700/80 flex items-center gap-3 shadow-xl backdrop-blur-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0099ff] to-[#00ffc8] flex items-center justify-center text-slate-950 font-bold">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Karya Lagu</div>
                  <div className="text-sm font-bold text-white">85+ Ciptaan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Text & Hero Details */}
          <div className="lg:col-span-7 flex flex-col items-start order-1 lg:order-2">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#00ffc8]/30 mb-6 shadow-[0_0_15px_rgba(0,255,200,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
              <span className="text-xs font-semibold text-[#00ffc8] tracking-widest uppercase">
                Official Music Artist & Song Catalogue
              </span>
            </div>

            {/* Main Name Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-white mb-2 leading-[1.1]">
              Muhammad <br />
              <span className="text-gradient">Dzikron</span>
            </h1>

            {/* Sub-titles */}
            <div className="flex flex-wrap items-center gap-x-3 text-lg sm:text-xl font-medium text-slate-300 mb-4">
              <span className="text-[#0099ff]">Songwriter</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#00ffc8]">Composer</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-400">Music Producer</span>
            </div>

            {/* Dynamic Typing Text */}
            <div className="h-10 mb-6 flex items-center">
              <span className="text-2xl sm:text-3xl font-serif text-[#00ffc8] font-bold tracking-wide">
                &ldquo;{displayText}&rdquo;
              </span>
              <span className="w-1 h-7 bg-[#00ffc8] ml-1.5 animate-pulse inline-block" />
            </div>

            {/* Quote Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 glass-card p-5 rounded-2xl border-l-4 border-l-[#00ffc8] border-slate-800">
              &ldquo;Mengabadikan cerita melalui nada, melodi, dan lirik. Setiap lagu adalah perjalanan emosi yang lahir dari pengalaman, harapan, dan doa.&rdquo;
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onPlayFirstSong}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(0,255,200,0.4)] hover:shadow-[0_0_45px_rgba(0,255,200,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Dengarkan Lagu</span>
              </button>

              <a
                href="#kontak"
                className="w-full sm:w-auto px-8 py-4 rounded-full glass-card hover:bg-slate-800/80 text-white font-semibold text-sm border border-slate-700/80 hover:border-[#00ffc8]/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#00ffc8]" />
                <span>Hubungi Saya</span>
              </a>
            </div>

            {/* Quick Social Badges */}
            <div className="mt-10 flex items-center gap-4 text-xs text-slate-400">
              <span>Platform Resmi:</span>
              <div className="flex items-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full glass-card hover:text-[#00ffc8] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2 rounded-full glass-card hover:text-red-400 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://spotify.com" target="_blank" rel="noreferrer" className="p-2 rounded-full glass-card hover:text-emerald-400 transition-colors">
                  <Radio className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
