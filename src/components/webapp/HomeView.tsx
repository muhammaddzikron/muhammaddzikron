import React, { useState, useMemo } from 'react';
import { Song } from '../../types/song';
import {
  Play,
  Pause,
  Sparkles,
  Music,
  Disc3,
  Heart,
  FileText,
  ArrowRight,
  Flame,
  Award,
  Send,
  Compass,
  Download,
  Search,
  ListMusic
} from 'lucide-react';
import { WebAppTab } from './Sidebar';
import { formatSongDuration } from '../../utils/duration';
import { SongCard } from './SongCard';

interface HomeViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectTab: (tab: WebAppTab) => void;
  onSelectSongDetails: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  favorites: string[];
}

const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Pop Indie': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Pop Religi': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Pop Melayu': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  'Pop Akustik': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Sinematik': { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  'Instrumental': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
};

export const HomeView: React.FC<HomeViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectTab,
  onSelectSongDetails,
  onToggleFavorite,
  favorites
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Featured song dynamically follows currently playing/active song, falling back to songs[0]
  const featuredSong = currentSong || songs[0] || null;

  // Extract unique genres for filter buttons
  const genres: string[] = useMemo(() => {
    const list = Array.from(new Set(songs.map((s) => s.genre)));
    return list;
  }, [songs]);

  const allGenresList = useMemo(() => {
    return ['Semua', ...genres];
  }, [genres]);

  // Filter songs for the playlist on Beranda
  const displayedSongs = useMemo(() => {
    return songs.filter((s) => {
      const matchesGenre = selectedGenre === 'Semua' || s.genre === selectedGenre;
      const q = searchFilter.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        s.title.toLowerCase().includes(q) ||
        s.singer.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.lyrics?.toLowerCase().includes(q);
      return matchesGenre && matchesSearch;
    });
  }, [songs, selectedGenre, searchFilter]);

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-10 animate-in fade-in duration-300">
      
      {/* 1. Hero Spotlight Release Banner (Centerpiece Luxury White Card) */}
      {featuredSong && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 lg:p-7 shadow-[0_6px_25px_rgba(15,23,42,0.04)]">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-100/35 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-100/35 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>
                  {isPlaying && currentSong?.id === featuredSong.id
                    ? 'Sedang Diputar • Masterpiece Pilihan'
                    : 'Karya Pilihan • Rilisan Unggulan'}
                </span>
                {isPlaying && currentSong?.id === featuredSong.id && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                {featuredSong.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-slate-600">
                <span className="font-bold text-slate-800">{featuredSong.singer}</span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                  {featuredSong.genre}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-600">Tahun {featuredSong.year}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-slate-500 font-semibold">{formatSongDuration(featuredSong.duration)}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl line-clamp-2">
                {featuredSong.lyrics ? featuredSong.lyrics.split('\n').slice(0, 3).join(' ') + '...' : 'Karya cipta melodi orisinal ciptaan Muhammad Dzikron.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => onPlaySong(featuredSong)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-200 hover:scale-105 cursor-pointer active:scale-95"
                >
                  {isPlaying && currentSong?.id === featuredSong.id ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      <span>Jeda Putar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      <span>Putar Sekarang</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectSongDetails(featuredSong)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Lihat Lirik & Info</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(featuredSong.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer shadow-xs active:scale-95 ${
                    favorites.includes(featuredSong.id)
                      ? 'bg-rose-50 text-rose-600 border-rose-300'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50'
                  }`}
                  title={favorites.includes(featuredSong.id) ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredSong.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right: Vinyl / Cover Art Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => onPlaySong(featuredSong)}>
                {/* Vinyl Record Behind Cover */}
                <div className={`absolute -right-5 top-1/2 -translate-y-1/2 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900 border-4 border-slate-200 shadow-xl flex items-center justify-center transition-transform duration-700 ${
                  isPlaying && currentSong?.id === featuredSong.id
                    ? 'translate-x-6 sm:translate-x-10 animate-spin-slow'
                    : 'group-hover:translate-x-5'
                }`}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-300 flex items-center justify-center bg-amber-500 shadow-inner">
                    <Disc3 className="w-6 h-6 text-slate-950" />
                  </div>
                </div>

                {/* Album Cover Art */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl z-10 bg-slate-100">
                  <img
                    src={featuredSong.cover}
                    alt={featuredSong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 flex items-end p-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      {isPlaying && currentSong?.id === featuredSong.id ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Bar Pencarian & Filter Kategori (Presisi di Bawah Card Atas) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Section title, badge & quick genre pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-1">
              <ListMusic className="w-4 h-4 text-indigo-600" />
              <span className="font-serif font-extrabold text-sm sm:text-base text-slate-900">
                Daftar Lagu
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {displayedSongs.length}
              </span>
            </div>

            {/* Genre Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {allGenresList.map((g) => {
                const isSelected = selectedGenre === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/90'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Search */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari lagu di playlist..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Daftar Card Lagu-Lagu (Karakter Card seperti di Download Area) */}
      <div>
        {displayedSongs.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
            <Music className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada lagu yang sesuai filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba gunakan kata kunci pencarian lain atau pilih filter "Semua" lagu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4.5">
            {displayedSongs.map((song, idx) => (
              <SongCard
                key={song.id}
                song={song}
                index={idx}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={onPlaySong}
                onSelectSongDetails={onSelectSongDetails}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(song.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Composer Spotlight & Bio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center pt-1">
        
        {/* Spotlight Card (8 cols) */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Tentang Komposer & Pencipta Karya</span>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-indigo-100 shrink-0 shadow-md bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
                  alt="Muhammad Dzikron"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  Muhammad Dzikron
                </h3>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  Songwriter, Composer & Music Arranger
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendedikasikan karya musik untuk mengabadikan kisah kehidupan, spiritualitas rasa syukur, dan harmoni cinta.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed border-l-3 border-indigo-600 pl-3.5 py-1.5 space-y-1.5 bg-slate-50 rounded-r-xl">
              <p className="italic text-slate-700">
                &ldquo;Usia itu terbatas, tetapi karya tak mengenal batas.
                Setiap perjalanan menyimpan cerita, setiap cerita memiliki rasa, dan setiap rasa dapat dirangkai menjadi nada.&rdquo;
              </p>
              <div className="pt-0.5 font-bold text-indigo-700 not-italic leading-snug text-[11px]">
                <span>Rangkai cerita menjadi nada, abadikan rasa menjadi karya.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <button
                onClick={() => onSelectTab('about')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-xs"
              >
                Lihat Profil Lengkap
              </button>
              <button
                onClick={() => onSelectTab('contact')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold transition hover:brightness-110 shadow-md shadow-indigo-200 cursor-pointer"
              >
                Pesan Lagu & Kolaborasi Baru
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="p-5 rounded-2xl sm:rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              Statistik Rekapitulasi Karya
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Total Koleksi Lagu</span>
                <span className="text-base font-bold font-serif text-indigo-700">{songs.length} Rilis</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Total Genre Variasi</span>
                <span className="text-base font-bold font-serif text-emerald-700">{genres.length} Kategori</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Format Kualitas</span>
                <span className="text-xs font-bold text-amber-700">Studio Master HQ 24-bit</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. App Features Banner (Warna-Warni) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div
          onClick={() => onSelectTab('lyrics')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-[0_4px_25px_rgba(15,23,42,0.04)] hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5 group-hover:text-amber-700 transition">Studio Lirik & Karaoke</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Baca dan jiwai setiap bait lirik lagu ciptaan dengan tampilan lirik responsif dan video YouTube.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('download')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-[0_4px_25px_rgba(15,23,42,0.04)] hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition shadow-xs">
            <Download className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5 group-hover:text-sky-700 transition">Download Area & Master HQ</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Unduh audio master WAV, partitur notasi chord, buku lirik, dan stems dari Google Drive resmi.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('contact')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-300 shadow-[0_4px_25px_rgba(15,23,42,0.04)] hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mb-2.5 group-hover:scale-110 transition shadow-xs">
            <Send className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5 group-hover:text-rose-700 transition">Jasa Komposer & Lisensi</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ajukan proyek pembuatan lagu jingle, film scoring, single religi, atau pop orisinal via WhatsApp.
          </p>
        </div>
      </div>

    </div>
  );
};
