import React from 'react';
import { ACHIEVEMENTS } from '../data/initialData';
import { Trophy, Disc, Radio, Users, Sparkles, MapPin, Calendar } from 'lucide-react';

export const AchievementsSection: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Penghargaan': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Album': return <Disc className="w-5 h-5 text-[#00ffc8]" />;
      case 'Festival': return <Radio className="w-5 h-5 text-[#0099ff]" />;
      default: return <Users className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <section id="prestasi" className="py-24 relative z-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00ffc8]/30 mb-3">
            <Trophy className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span className="text-xs font-semibold text-[#00ffc8] uppercase tracking-wider">
              Rekam Jejak & Apresiasi
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
            Prestasi & <span className="text-gradient">Pencapaian Karya</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Perjalanan karir musik Muhammad Dzikron dalam membagikan simfoni dan rasa.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0099ff] to-[#00ffc8] mx-auto mt-4 rounded-full" />
        </div>

        {/* Timeline Line & Cards */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0099ff] via-[#00ffc8] to-purple-600 -translate-x-1/2 opacity-40" />

          <div className="space-y-12">
            {ACHIEVEMENTS.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col sm:flex-row items-center gap-6 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Badge Dot */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#050505] border-2 border-[#00ffc8] flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,255,200,0.5)]">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Card Content Box */}
                  <div className={`w-full sm:w-[calc(50%-2rem)] ml-10 sm:ml-0 ${
                    isEven ? 'sm:text-right' : 'sm:text-left'
                  }`}>
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-[#00ffc8]/40 transition-all duration-300 shadow-xl group">
                      
                      <div className={`flex items-center gap-2 mb-2 ${
                        isEven ? 'sm:justify-end' : 'sm:justify-start'
                      }`}>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.year}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold uppercase">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-[#00ffc8] transition-colors mb-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      {item.location && (
                        <span className={`text-[11px] text-slate-400 flex items-center gap-1 ${
                          isEven ? 'sm:justify-end' : 'sm:justify-start'
                        }`}>
                          <MapPin className="w-3 h-3 text-[#0099ff]" /> {item.location}
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
