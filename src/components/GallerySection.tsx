import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../data/initialData';
import { GalleryItem } from '../types/song';
import { Camera, X, Calendar, Sparkles, ZoomIn } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const categories = ['Semua', 'Studio', 'Konser', 'Behind The Scene', 'Kegiatan'];

  const filteredGallery = selectedCategory === 'Semua'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <section id="galeri" className="py-24 relative z-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00ffc8]/30 mb-3">
            <Camera className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span className="text-xs font-semibold text-[#00ffc8] uppercase tracking-wider">
              Dokumentasi Visual
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
            Galeri <span className="text-gradient">Kegiatan & Studio</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Momen di balik panggung, proses kreatif studio, dan penampilan musik langsung.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#0099ff] to-[#00ffc8] mx-auto mt-4 rounded-full" />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 shadow-[0_0_20px_rgba(0,255,200,0.4)]'
                  : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item)}
              className="group relative rounded-3xl overflow-hidden glass-card border border-slate-800 cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#00ffc8]/50"
            >
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Category Pill */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#050505]/80 text-[#00ffc8] border border-[#00ffc8]/30 backdrop-blur-md">
                  {item.category}
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4 text-[#00ffc8]" />
                </div>

                {/* Content info at bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-[#00ffc8]" /> {item.date}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-[#00ffc8] transition-colors leading-snug">
                    {item.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain rounded-2xl mb-4"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ffc8]/20 text-[#00ffc8] font-semibold">
                {lightboxImage.category}
              </span>
              <span>{lightboxImage.date}</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{lightboxImage.title}</h3>
            <p className="text-sm text-slate-300">{lightboxImage.description}</p>
          </div>
        </div>
      )}
    </section>
  );
};
