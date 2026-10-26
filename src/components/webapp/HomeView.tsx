import React from 'react';
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
  TrendingUp,
  Award,
  Radio,
  Flame,
  Clock,
  Send,
  Users,
  Compass,
  Sliders,
  Share2,
  Download
} from 'lucide-react';
import { WebAppTab } from './Sidebar';
import { STATS } from '../../data/initialData';
import { formatSongDuration } from '../../utils/duration';

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
  // Featured song dynamically follows currently playing/active song, falling back to songs[0]
  const featuredSong = currentSong || songs[0] || null;
  const popularSongs = songs.slice(0, 5);

  const genres: string[] = Array.from(new Set(songs.map((s) => s.genre)));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Hero Spotlight Release Banner (Centerpiece Luxury Card) */}
      {featuredSong && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0a1527] to-[#041122] p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isPlaying && currentSong?.id === featuredSong.id
                    ? 'Now Playing • Featured Masterpiece'
                    : 'Featured Masterpiece Release'}
                </span>
                {isPlaying && currentSong?.id === featuredSong.id && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight">
                {featuredSong.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="font-semibold text-white">{featuredSong.singer}</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300 font-semibold">
                  {featuredSong.genre}
                </span>
                <span>•</span>
                <span>Tahun {featuredSong.year}</span>
                <span>•</span>
                <span className="font-mono">{formatSongDuration(featuredSong.duration)}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl line-clamp-3">
                {featuredSong.lyrics ? featuredSong.lyrics.split('\n').slice(0, 4).join(' ') + '...' : 'Karya cipta melodi orisinal ciptaan Muhammad Dzikron.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onPlaySong(featuredSong)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer"
                >
                  {isPlaying && currentSong?.id === featuredSong.id ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Jeda Putar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Putar Sekarang</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectSongDetails(featuredSong)}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>Lihat Lirik & Info</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(featuredSong.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    favorites.includes(featuredSong.id)
                      ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                      : 'bg-white/10 text-slate-300 hover:text-white border-white/20'
                  }`}
                  title="Tambah ke Favorit"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredSong.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right: Vinyl / Cover Art Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => onPlaySong(featuredSong)}>
                {/* Vinyl Record Behind Cover */}
                <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-black border-4 border-slate-800 shadow-2xl flex items-center justify-center transition-transform duration-700 ${
                  isPlaying && currentSong?.id === featuredSong.id
                    ? 'translate-x-6 sm:translate-x-12 animate-spin-slow'
                    : 'group-hover:translate-x-6'
                }`}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/50 flex items-center justify-center bg-slate-900">
                    <Disc3 className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                {/* Album Cover Art */}
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-10">
                  <img
                    src={featuredSong.cover}
                    alt={featuredSong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      {isPlaying && currentSong?.id === featuredSong.id ? (
                        <Pause className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Quick Genre Cards (Warna-Warni) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Jelajahi Berdasarkan Genre</span>
          </div>
          <button
            onClick={() => onSelectTab('library')}
            className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Semua Lagu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {genres.map((genre) => {
            const styling = GENRE_COLORS[genre] || { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };
            return (
              <div
                key={genre}
                onClick={() => onSelectTab('library')}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl ${styling.bg} ${styling.text} flex items-center justify-center mb-2.5 group-hover:scale-110 transition shadow-sm`}>
                  <Music className="w-4 h-4" />
                </div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition truncate">
                  {genre}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {songs.filter((s) => s.genre === genre).length} Karya
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Grid: Popular Songs & Composer Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Popular Tracks Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Lagu Populer & Pilihan</span>
            </div>
            <button
              onClick={() => onSelectTab('library')}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-bold"
            >
              Buka Katalog Lengkap ({songs.length})
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
            {popularSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50 transition group ${
                    isCurrent ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onPlaySong(song)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer ${
                        isCurrent && isPlaying
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />

                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-indigo-950 font-extrabold' : 'text-slate-900'}`}>
                        {song.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {song.singer} • {song.genre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {song.duration}
                    </span>

                    <button
                      onClick={() => onToggleFavorite(song.id)}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
                        favorites.includes(song.id) ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(song.id) ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectSongDetails(song)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Detail Lirik"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composer Spotlight Card (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Tentang Komposer</span>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-indigo-100 shrink-0 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
                  alt="Muhammad Dzikron"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Muhammad Dzikron
                </h3>
                <p className="text-xs text-indigo-600 font-semibold">
                  Songwriter & Music Composer
                </p>
                <p className="text-[11px] text-slate-500">
                  Jakarta / Bandung, Indonesia
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed border-l-2 border-indigo-500 pl-3.5 py-1 space-y-2 bg-slate-50 rounded-r-xl">
              <p className="italic text-slate-700">
                &ldquo;Usia itu terbatas, tetapi karya tak mengenal batas.
                Setiap perjalanan menyimpan cerita, setiap cerita memiliki rasa, dan setiap rasa dapat dirangkai menjadi nada.
                Menulis bukan sekadar menciptakan lagu, melainkan mengabadikan jejak waktu dalam harmoni. Karena ketika usia berhenti melangkah, karya akan tetap berbicara, menemani, menginspirasi, dan hidup dalam ingatan.&rdquo;
              </p>
              <div className="pt-1 font-bold text-indigo-700 not-italic leading-snug">
                <p>Rangkai cerita menjadi nada,</p>
                <p>Abadikan rasa menjadi karya.</p>
              </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xl font-extrabold text-indigo-600 font-mono">85+</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Lagu Diciptakan</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xl font-extrabold text-emerald-600 font-mono">1.5M+</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Streams</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => onSelectTab('about')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition text-center cursor-pointer"
              >
                Lihat Profil Lengkap
              </button>
              <button
                onClick={() => onSelectTab('contact')}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold transition text-center hover:brightness-110 shadow-md cursor-pointer"
              >
                Pesan Lagu Baru
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4. App Features Banner (Warna-Warni) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab('lyrics')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-amber-700 transition">Studio Lirik & Karaoke</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Baca dan jiwai setiap lirik lagu ciptaan dengan tampilan karaoke responsif.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('download')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
            <Download className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition">Download Area & Master HQ</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Unduh audio master WAV, partitur notasi chord, buku lirik, dan stems dari Google Drive.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('contact')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-300 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-sm">
            <Send className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-rose-700 transition">Jasa Komposer & Lisensi</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ajukan proyek pembuatan lagu jingle, film scoring, single religi, atau pop orisinal.
          </p>
        </div>
      </div>

    </div>
  );
};
