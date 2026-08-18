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
  Share2
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
  const featuredSong = songs[0] || null;
  const popularSongs = songs.slice(0, 5);

  const genres = Array.from(new Set(songs.map((s) => s.genre)));

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Hero Spotlight Release Banner */}
      {featuredSong && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-r from-[#071325] via-[#091e3a]/90 to-[#041a1c] p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00ffc8]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#0099ff]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Masterpiece Release</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight">
                {featuredSong.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="font-semibold text-white">{featuredSong.singer}</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[#00ffc8] font-medium">
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
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,200,0.35)] cursor-pointer"
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
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#00ffc8]" />
                  <span>Lihat Lirik & Info</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(featuredSong.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    favorites.includes(featuredSong.id)
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-700/80'
                  }`}
                  title="Tambah ke Favorit"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredSong.id) ? 'fill-rose-500' : ''}`} />
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#00ffc8]/50 flex items-center justify-center bg-slate-900">
                    <Disc3 className="w-8 h-8 text-[#00ffc8]" />
                  </div>
                </div>

                {/* Album Cover Art */}
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-10">
                  <img
                    src={featuredSong.cover}
                    alt={featuredSong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="w-10 h-10 rounded-full bg-[#00ffc8] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
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

      {/* 2. Quick Genre & Mood Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Compass className="w-4 h-4 text-[#00ffc8]" />
            <span>Jelajahi Berdasarkan Genre</span>
          </div>
          <button
            onClick={() => onSelectTab('library')}
            className="text-xs text-[#00ffc8] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Semua Lagu</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {genres.map((genre) => (
            <div
              key={genre}
              onClick={() => onSelectTab('library')}
              className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-[#00ffc8]/40 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#00ffc8]/10 text-[#00ffc8] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Music className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#00ffc8] transition truncate">
                {genre}
              </div>
              <div className="text-[10px] text-slate-400">
                {songs.filter((s) => s.genre === genre).length} Karya
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Grid: Popular Songs & Composer Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Popular Tracks Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Lagu Populer & Pilihan</span>
            </div>
            <button
              onClick={() => onSelectTab('library')}
              className="text-xs text-[#00ffc8] hover:underline font-semibold"
            >
              Buka Katalog Lengkap ({songs.length})
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 overflow-hidden">
            {popularSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-800/50 transition group ${
                    isCurrent ? 'bg-[#00ffc8]/10 border-l-2 border-[#00ffc8]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onPlaySong(song)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer ${
                        isCurrent && isPlaying
                          ? 'bg-[#00ffc8] text-slate-950 shadow-[0_0_15px_rgba(0,255,200,0.4)]'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-[#00ffc8] group-hover:text-slate-950'
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
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                    />

                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#00ffc8]' : 'text-white'}`}>
                        {song.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
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
                      className={`p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer ${
                        favorites.includes(song.id) ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(song.id) ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSelectSongDetails(song)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Award className="w-4 h-4 text-[#0099ff]" />
            <span>Tentang Komposer</span>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#00ffc8]/40 shrink-0 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
                  alt="Muhammad Dzikron"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Muhammad Dzikron
                </h3>
                <p className="text-xs text-[#00ffc8] font-semibold">
                  Songwriter & Music Composer
                </p>
                <p className="text-[11px] text-slate-400">
                  Jakarta / Bandung, Indonesia
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed border-l-2 border-[#00ffc8] pl-3 py-0.5 space-y-2">
              <p className="italic text-slate-200">
                &ldquo;Usia itu terbatas, tetapi karya tak mengenal batas.
                Setiap perjalanan menyimpan cerita, setiap cerita memiliki rasa, dan setiap rasa dapat dirangkai menjadi nada.
                Menulis bukan sekadar menciptakan lagu, melainkan mengabadikan jejak waktu dalam harmoni. Karena ketika usia berhenti melangkah, karya akan tetap berbicara, menemani, menginspirasi, dan hidup dalam ingatan.&rdquo;
              </p>
              <div className="pt-1 font-semibold text-[#00ffc8] not-italic leading-snug">
                <p>Rangkai cerita menjadi nada,</p>
                <p>Abadikan rasa menjadi karya.</p>
              </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-lg font-bold text-[#00ffc8]">85+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lagu Diciptakan</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-lg font-bold text-[#0099ff]">1.5M+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Streams</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onSelectTab('about')}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition text-center"
              >
                Lihat Profil Lengkap
              </button>
              <button
                onClick={() => onSelectTab('contact')}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 text-xs font-bold transition text-center hover:opacity-90"
              >
                Pesan Lagu Baru
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 4. App Features Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab('lyrics')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#00ffc8]/40 transition cursor-pointer group"
        >
          <FileText className="w-6 h-6 text-[#00ffc8] mb-2 group-hover:scale-110 transition" />
          <h4 className="text-sm font-bold text-white mb-1">Studio Lirik & Karaoke</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Baca dan jiwai setiap lirik lagu ciptaan dengan tampilan karaoke responsif.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('gallery')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#0099ff]/40 transition cursor-pointer group"
        >
          <Sparkles className="w-6 h-6 text-[#0099ff] mb-2 group-hover:scale-110 transition" />
          <h4 className="text-sm font-bold text-white mb-1">Galeri Studio Musik</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dokumentasi proses penggubahan musik, rekaman studio, hingga konser panggung.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('contact')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group"
        >
          <Send className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
          <h4 className="text-sm font-bold text-white mb-1">Jasa Komposer & Lisensi</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ajukan proyek pembuatan lagu jingle, film scoring, single religi, atau pop orisinal.
          </p>
        </div>
      </div>

    </div>
  );
};
