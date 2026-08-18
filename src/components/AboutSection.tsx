import React from 'react';
import { SKILLS } from '../data/initialData';
import { Feather, Music, Sliders, Radio, Mic2, Sparkles, Award, FileText } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-4 h-4" />;
      case 'Feather': return <Feather className="w-4 h-4" />;
      case 'Sliders': return <Sliders className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      case 'Mic2': return <Mic2 className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <section id="tentang" className="py-24 relative z-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00ffc8]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span className="text-xs font-semibold text-[#00ffc8] uppercase tracking-wider">
              Biografi & Keahlian
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
            Tentang <span className="text-gradient">Muhammad Dzikron</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0099ff] to-[#00ffc8] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Photo & Stats Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative Backdrop Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#0099ff]/30 to-[#00ffc8]/30 rounded-3xl blur-2xl opacity-70" />

              <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/80 p-3">
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80"
                  alt="Muhammad Dzikron Studio"
                  className="w-full h-[400px] object-cover rounded-2xl"
                />
                
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#00ffc8]" /> Certified Composer
                    </span>
                    <span>Pengalaman 10+ Tahun</span>
                  </div>
                  <p className="text-sm text-slate-300 italic">
                    &ldquo;Musik bukan sekadar rangkaian nada, melainkan cerminan jiwa yang mampu menyentuh relung hati pendengarnya.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Skills Progress Bars */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Bio Text */}
            <div className="space-y-4 text-slate-300 text-base leading-relaxed mb-8">
              <p>
                <strong>Muhammad Dzikron</strong> adalah seorang Pencipta Lagu (Songwriter), Musisi, dan Komposer Indonesia yang berdedikasi menciptakan karya-karya bernuansa emosional, spiritual, dan bermakna mendalam.
              </p>
              <p>
                Spesialisasi karyanya mencakup genre Pop Religi, Acoustic Ballad, Cinematic Orchestral, hingga Music Arrangement modern. Karya-karyanya telah diproduksi dan diputar secara luas di berbagai platform musik digital serta media nasional.
              </p>
              <p>
                Seluruh katalog lagu ciptaannya disimpan secara terstruktur di Google Drive dan terhubung langsung ke platform ini melalui integrasi otomatis berbasis cloud database.
              </p>
            </div>

            {/* Skills Progress Bars */}
            <div className="space-y-5">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#00ffc8]" />
                Keahlian & Kompetensi Utama
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {SKILLS.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-200 flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-800 text-[#00ffc8]">
                          {getIcon(skill.iconName)}
                        </span>
                        {skill.name}
                      </span>
                      <span className="text-[#00ffc8]">{skill.percentage}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-slate-700/50">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${skill.percentage}%`,
                          background: `linear-gradient(90deg, #0099ff 0%, ${skill.color} 100%)`,
                          boxShadow: `0 0 10px ${skill.color}80`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
