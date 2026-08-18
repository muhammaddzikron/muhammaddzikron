import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../../data/initialData';
import { GalleryItem } from '../../types/song';
import {
  Image as ImageIcon,
  Sparkles,
  X,
  Calendar,
  Layers,
  ZoomIn
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

  const categories = ['Semua', 'Studio', 'Konser', 'Behind The Scene', 'Kegiatan'];

  const filteredItems = selectedCategory === 'Semua'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-bold uppercase tracking-wider mb-2 border border-[#00ffc8]/20">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Dokumentasi Visual</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            Galeri Studio & Pentas Musik
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sorotan visual proses rekaman, konser orchestra, serta workshop penciptaan lagu.
          </p>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveLightbox(item)}
            className="group rounded-3xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-[#00ffc8]/50 transition-all duration-300 cursor-pointer shadow-xl hover:scale-[1.02]"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="p-3 rounded-full bg-[#00ffc8] text-slate-950 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-[#00ffc8] border border-slate-700">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-[#0099ff]" />
                <span>{item.date}</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#00ffc8] transition">
                {item.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl"
          >
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activeLightbox.imageUrl}
              alt={activeLightbox.title}
              className="w-full max-h-[60vh] object-cover"
            />

            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] text-xs font-bold">
                  {activeLightbox.category}
                </span>
                <span className="text-xs text-slate-400">• {activeLightbox.date}</span>
              </div>
              <h2 className="text-lg font-bold text-white font-serif">
                {activeLightbox.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeLightbox.description}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
