import React, { useState, useMemo } from 'react';
import { Song } from '../types/song';
import { Play, Pause, Search, Music, Heart, FileText, Share2, Sparkles, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface PlaylistSectionProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectSongDetails: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  favorites: string[];
  onRefreshPlaylist: () => void;
  isLoadingSheet?: boolean;
}

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectSongDetails,
  onToggleFavorite,
  favorites,
  onRefreshPlaylist,
  isLoadingSheet
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'year'>('order');

  // Extract unique genres
  const genres = useMemo(() => {
    const list = Array.from(new Set(songs.map((s) => s.genre)));
    return ['Semua', 'Favorit', ...list];
  }, [songs]);

  // Filtered & Sorted songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        const matchesSearch =
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.singer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.genre.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedGenre === 'Semua') return true;
        if (selectedGenre === 'Favorit') return favorites.includes(song.id);
        return song.genre === selectedGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'year') return Number(b.year) - Number(a.year);
        return a.order - b.order;
      });
  }, [songs, searchTerm, selectedGenre, sortBy, favorites]);

  return (
    <section id="playlist" className="py-24 relative z-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00ffc8]/30 mb-3">
              <Music className="w-3.5 h-3.5 text-[#00ffc8]" />
              <span className="text-xs font-semibold text-[#00ffc8] uppercase tracking-wider">
                Google Drive Song Catalogue
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
              Playlist <span className="text-gradient">Lagu Official</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Daftar karya cipta lagu Muhammad Dzikron yang terhubung otomatis dari Google Spreadsheet.
            </p>
          </div>

          <button
            onClick={onRefreshPlaylist}
            disabled={isLoadingSheet}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl glass-card border border-slate-700/80 hover:border-[#00ffc8]/50 text-xs text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#00ffc8] ${isLoadingSheet ? 'animate-spin' : ''}`} />
            <span>{isLoadingSheet ? 'Sinkronisasi...' : 'Muat Ulang Playlist'}</span>
          </button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari lagu, penyanyi, atau kata kunci..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:outline-none focus:border-[#00ffc8] transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-6 flex items-center justify-end gap-3">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 hidden sm:inline-flex">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00ffc8]" /> Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#00ffc8]"
              >
                <option value="order">Urutan Asli (Spreadsheet)</option>
                <option value="title">Judul (A - Z)</option>
                <option value="year">Tahun Rilis (Terbaru)</option>
              </select>
            </div>

          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#00ffc8]" /> Genre:
            </span>
            {genres.map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,255,200,0.3)]'
                      : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300'
                  }`}
                >
                  {genre === 'Favorit' ? `❤️ Favorit (${favorites.length})` : genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Songs List Grid */}
        {filteredSongs.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
            <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Lagu Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400">
              Coba kata kunci pencarian lain atau pilih filter genre yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const isFav = favorites.includes(song.id);

              return (
                <div
                  key={song.id}
                  className={`glass-card p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                    isCurrent
                      ? 'border-[#00ffc8] bg-slate-900/80 shadow-[0_0_25px_rgba(0,255,200,0.15)]'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left Section: Cover + Song Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Index Number */}
                    <span className="text-xs font-bold text-slate-500 w-5 text-center shrink-0">
                      {String(song.no || idx + 1).padStart(2, '0')}
                    </span>

                    {/* Cover Image with Vinyl Hover */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-md">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          isSongPlaying ? 'brightness-75' : ''
                        }`}
                      />

                      {/* Play Overlay Button */}
                      <button
                        onClick={() => onPlaySong(song)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity cursor-pointer ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isSongPlaying ? (
                          <Pause className="w-6 h-6 text-[#00ffc8] fill-[#00ffc8]" />
                        ) : (
                          <Play className="w-6 h-6 text-[#00ffc8] fill-[#00ffc8] ml-0.5" />
                        )}
                      </button>

                      {/* Playing Animated Indicator */}
                      {isSongPlaying && (
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-[#00ffc8] text-slate-950 font-bold text-[9px] flex items-center gap-0.5">
                          <span className="w-1 h-2 bg-slate-950 animate-bounce" />
                          <span className="w-1 h-3 bg-slate-950 animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1 h-1.5 bg-slate-950 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>

                    {/* Title & Artist Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0099ff]/20 text-[#0099ff] border border-[#0099ff]/30 shrink-0">
                          {song.genre}
                        </span>
                        <span className="text-[10px] text-slate-400">{song.year}</span>
                      </div>

                      <h4 className={`text-base font-bold truncate transition-colors ${
                        isCurrent ? 'text-[#00ffc8]' : 'text-white group-hover:text-[#00ffc8]'
                      }`}>
                        {song.title}
                      </h4>

                      <p className="text-xs text-slate-400 truncate">{song.singer}</p>
                    </div>
                  </div>

                  {/* Right Section: Actions & Duration */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline-block mr-1">
                      {song.duration}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(song.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Tambah ke Favorit"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* View Details / Lyrics Button */}
                    <button
                      onClick={() => onSelectSongDetails(song)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#00ffc8]/20 border border-slate-700 hover:border-[#00ffc8]/50 text-slate-300 hover:text-[#00ffc8] transition-colors cursor-pointer"
                      title="Lihat Lirik & Detail"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
