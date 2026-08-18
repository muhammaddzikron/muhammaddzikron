import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { STATS } from '../../data/initialData';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Main Bio Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#0c1f2d] border border-slate-800/80 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Profile Photo */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border-2 border-[#00ffc8]/40 shadow-[0_0_30px_rgba(0,255,200,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
                alt="Muhammad Dzikron"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                <div>
                  <div className="text-white font-bold text-sm">Muhammad Dzikron</div>
                  <div className="text-[11px] text-[#00ffc8]">Songwriter & Composer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold uppercase tracking-wider border border-[#00ffc8]/20">
              <User className="w-3.5 h-3.5" />
              <span>Biografi Komposer</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              Menenun Jiwa ke dalam <span className="text-gradient">Harmoni & Nada</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Muhammad Dzikron adalah seorang pencipta lagu, komposer, dan penata musik asal Indonesia yang mendedikasikan karyanya untuk menyampaikan pesan kedamaian, cinta spiritual, dan keteguhan hati.
            </p>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
              Dengan pengalaman lebih dari 8 tahun dalam industri musik independen, beliau telah menggubah puluhan lagu lintas genre — dari Pop Religi yang menyentuh qolbu, Balada Akustik yang syahdu, hingga Komposisi Sinematik Orkestra untuk film pendek dan teater.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-[#00ffc8]" />
                <span>Indonesia</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-[#0099ff]" />
                <span>Aktif Sejak 2016</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                <span>Terbuka untuk Kolaborasi</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Key Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 shadow-lg"
          >
            <div className="text-2xl sm:text-3xl font-extrabold font-serif" style={{ color: stat.color }}>
              {stat.value.toLocaleString()}{stat.suffix}
            </div>
            <div className="text-xs font-semibold text-white">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
