import React, { useState, useMemo } from 'react';
import { Song } from '../../types/song';
import {
  Play,
  Pause,
  Search,
  Music,
  Heart,
  FileText,
  Share2,
  SlidersHorizontal,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  Database,
  ArrowUpDown,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface LibraryViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectSongDetails: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  favorites: string[];
  onRefreshPlaylist: () => void;
  isLoadingSheet?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectSongDetails,
  onToggleFavorite,
  favorites,
  onRefreshPlaylist,
  isLoadingSheet,
  searchQuery,
  onSearchChange
}) => {
  const [selectedGenre, setSelectedGenre] = useState('Semua');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'year' | 'duration'>('order');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Extract unique genres
  const genres = useMemo(() => {
    const list = Array.from(new Set(songs.map((s) => s.genre)));
    return ['Semua', 'Favorit', ...list];
  }, [songs]);

  // Filtered & Sorted songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          query === '' ||
          song.title.toLowerCase().includes(query) ||
          song.singer.toLowerCase().includes(query) ||
          song.genre.toLowerCase().includes(query) ||
          song.lyrics?.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (selectedGenre === 'Semua') return true;
        if (selectedGenre === 'Favorit') return favorites.includes(song.id);
        return song.genre === selectedGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'year') return Number(b.year) - Number(a.year);
        if (sortBy === 'duration') return b.duration.localeCompare(a.duration);
        return a.order - b.order;
      });
  }, [songs, searchQuery, selectedGenre, sortBy, favorites]);

  const handleShare = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Dengarkan karya lagu "${song.title}" ciptaan Muhammad Dzikron di Web App Resmi.`;
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      setCopiedShareId(song.id);
      setTimeout(() => setCopiedShareId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner / Filter Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 shadow-xl space-y-4">
        
        {/* Row 1: Header info & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-white flex items-center gap-2.5">
              <span>Katalog Lagu Resmi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/30 font-sans font-bold">
                {filteredSongs.length} Lagu Ditemukan
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Koleksi lagu orisinal hasil cipta karya Muhammad Dzikron.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshPlaylist}
              disabled={isLoadingSheet}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Perbarui dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00ffc8] ${isLoadingSheet ? 'animate-spin' : ''}`} />
              <span>{isLoadingSheet ? 'Sinkron...' : 'Refresh'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Grid Card"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Genre Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {genres.map((genre) => {
            const isSelected = selectedGenre === genre;
            const count = genre === 'Semua'
              ? songs.length
              : genre === 'Favorit'
              ? favorites.length
              : songs.filter((s) => s.genre === genre).length;

            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#00ffc8] text-slate-950 border-[#00ffc8] shadow-[0_0_12px_rgba(0,255,200,0.3)]'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {genre === 'Favorit' && <Heart className="w-3 h-3 fill-current text-rose-500" />}
                <span>{genre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Sort selector */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00ffc8]" />
            <span>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-[#00ffc8]"
            >
              <option value="order">Urutan Rekomendasi (#1, #2...)</option>
              <option value="title">Judul Lagu (A - Z)</option>
              <option value="year">Tahun Rilis Terbaru</option>
              <option value="duration">Durasi Lagu</option>
            </select>
          </div>

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#00ffc8] hover:underline"
            >
              Hapus Filter Pencarian
            </button>
          )}
        </div>

      </div>

      {/* Main Track List (Table View) */}
      {viewMode === 'table' && (
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Judul Lagu & Komposer</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Genre</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Tahun</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Durasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-white">Tidak ada lagu yang sesuai.</p>
                      <p className="text-xs mt-1">Coba kata kunci lain atau pilih genre "Semua".</p>
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isFav = favorites.includes(song.id);

                    return (
                      <tr
                        key={song.id}
                        onClick={() => onPlaySong(song)}
                        className={`group hover:bg-slate-800/60 transition cursor-pointer ${
                          isCurrent ? 'bg-[#00ffc8]/10' : ''
                        }`}
                      >
                        {/* Track Number / Play Trigger */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          <div className="flex items-center justify-center">
                            <span className={`group-hover:hidden ${isCurrent && isPlaying ? 'hidden' : 'block'}`}>
                              {song.order || index + 1}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlaySong(song);
                              }}
                              className={`p-1.5 rounded-full transition ${
                                isCurrent && isPlaying
                                  ? 'block text-[#00ffc8]'
                                  : 'hidden group-hover:block text-white hover:text-[#00ffc8]'
                              }`}
                            >
                              {isCurrent && isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Title & Artist */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={song.cover}
                              alt={song.title}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700 shadow-md"
                            />
                            <div className="min-w-0">
                              <div className={`font-bold text-sm truncate flex items-center gap-2 ${
                                isCurrent ? 'text-[#00ffc8]' : 'text-white'
                              }`}>
                                <span>{song.title}</span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {song.singer}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Genre */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium">
                            {song.genre}
                          </span>
                        </td>

                        {/* Year */}
                        <td className="py-3.5 px-4 hidden lg:table-cell text-slate-400 font-mono text-[11px]">
                          {song.year}
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-slate-400 text-[11px]">
                          {song.duration}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onToggleFavorite(song.id)}
                              className={`p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer ${
                                isFav ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                            </button>

                            <button
                              onClick={() => onSelectSongDetails(song)}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                              title="Lihat Lirik & Info Lengkap"
                            >
                              <FileText className="w-4 h-4 text-[#00ffc8]" />
                            </button>

                            <button
                              onClick={(e) => handleShare(song, e)}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                              title="Bagikan Lagu"
                            >
                              {copiedShareId === song.id ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Share2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid Card View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isFav = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`p-4 rounded-3xl bg-slate-900/80 border transition-all cursor-pointer group hover:scale-[1.02] shadow-xl ${
                  isCurrent
                    ? 'border-[#00ffc8] bg-slate-900 shadow-[0_0_20px_rgba(0,255,200,0.15)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Cover Image with Play Overlay */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-950">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#00ffc8] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Favorite Pill on Card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
                      isFav ? 'bg-rose-500/80 text-white' : 'bg-black/50 text-white/70 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Track Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#00ffc8] uppercase tracking-wider">
                      {song.genre}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {song.duration}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-[#00ffc8]' : 'text-white'}`}>
                    {song.title}
                  </h3>

                  <p className="text-xs text-slate-400 truncate">
                    {song.singer}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSongDetails(song)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3 h-3 text-[#00ffc8]" />
                      <span>Lirik Lagu</span>
                    </button>

                    <button
                      onClick={(e) => handleShare(song, e)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
