import React, { useState, useEffect, useRef } from 'react';
import { STATS } from '../data/initialData';
import { Music, Disc, Users, LayoutGrid } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(STATS.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate counters
          STATS.forEach((stat, idx) => {
            const target = stat.value;
            const duration = 2000;
            const steps = 40;
            const stepValue = target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += stepValue;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              setCounts((prev) => {
                const next = [...prev];
                next[idx] = Math.floor(current);
                return next;
              });
            }, duration / steps);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-6 h-6 text-[#00ffc8]" />;
      case 'Disc': return <Disc className="w-6 h-6 text-[#0099ff]" />;
      case 'Users': return <Users className="w-6 h-6 text-purple-400" />;
      default: return <LayoutGrid className="w-6 h-6 text-rose-400" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    return num.toLocaleString();
  };

  return (
    <section ref={sectionRef} className="py-20 relative z-10 border-t border-slate-900/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => (
            <div
              key={stat.id}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center hover:border-[#00ffc8]/50 transition-all duration-300 group shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                {getStatIcon(stat.iconName)}
              </div>

              <div className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight mb-1">
                {formatNumber(counts[idx])}
                <span className="text-[#00ffc8]">{stat.suffix}</span>
              </div>

              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
