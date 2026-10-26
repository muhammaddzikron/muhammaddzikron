import React, { useState, useMemo } from 'react';
import { Song } from '../../types/song';
import {
  Play,
  Pause,
  Music,
  Heart,
  FileText,
  Share2,
  RefreshCw,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';
import { formatSongDuration } from '../../utils/duration';

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
        if (sortBy === 'year') return (Number(b.year) - Number(a.year)) || (b.order - a.order) || (b.no - a.no);
        if (sortBy === 'duration') return b.duration.localeCompare(a.duration);
        return (b.order - a.order) || (b.no - a.no);
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

  const getGenreColorBadge = (genre: string) => {
    switch (genre) {
      case 'Pop Religi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Pop Indie':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Pop Melayu':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Ballad':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Akustik':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner / Filter Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] space-y-4">
        
        {/* Row 1: Header info & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 flex items-center gap-2.5">
              <span>Katalog Lagu Resmi</span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-sans font-bold shadow-xs">
                {filteredSongs.length} Lagu Ditemukan
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Koleksi lagu orisinal hasil cipta karya Muhammad Dzikron dalam kualitas audio studio.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshPlaylist}
              disabled={isLoadingSheet}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer shadow-xs active:scale-95"
              title="Perbarui dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoadingSheet ? 'animate-spin' : ''}`} />
              <span>{isLoadingSheet ? 'Sinkron...' : 'Refresh'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                  isSelected
                    ? genre === 'Favorit'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {genre === 'Favorit' && <Heart className={`w-3.5 h-3.5 fill-current ${isSelected ? 'text-white' : 'text-rose-500'}`} />}
                <span>{genre}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white font-extrabold' : 'bg-slate-200/80 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Sort selector */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-600">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white shadow-xs cursor-pointer"
            >
              <option value="order">Rilis / Tambahan Terbaru (Default)</option>
              <option value="title">Judul Lagu (A - Z)</option>
              <option value="year">Tahun Rilis Terbaru</option>
              <option value="duration">Durasi Lagu</option>
            </select>
          </div>

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
            >
              Hapus Filter Pencarian
            </button>
          )}
        </div>

      </div>

      {/* Main Track List (Table View) */}
      {viewMode === 'table' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_4px_25px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Judul Lagu & Komposer</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Genre</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Tahun</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Durasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-800">Tidak ada lagu yang sesuai.</p>
                      <p className="text-xs mt-1 text-slate-500">Coba kata kunci lain atau pilih genre "Semua".</p>
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
                        className={`group hover:bg-slate-50/90 transition cursor-pointer ${
                          isCurrent ? 'bg-indigo-50/60' : ''
                        }`}
                      >
                        {/* Track Number / Play Trigger */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          <div className="flex items-center justify-center">
                            <span className={`group-hover:hidden ${isCurrent && isPlaying ? 'hidden' : 'block'} text-slate-500`}>
                              {song.order || index + 1}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlaySong(song);
                              }}
                              className={`p-1.5 rounded-full transition ${
                                isCurrent && isPlaying
                                  ? 'block text-indigo-600 bg-indigo-100'
                                  : 'hidden group-hover:block text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
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
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-xs"
                            />
                            <div className="min-w-0">
                              <div className={`font-bold text-sm truncate flex items-center gap-2 ${
                                isCurrent ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'
                              }`}>
                                <span>{song.title}</span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {song.singer}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Genre */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${getGenreColorBadge(song.genre)}`}>
                            {song.genre}
                          </span>
                        </td>

                        {/* Year */}
                        <td className="py-3.5 px-4 hidden lg:table-cell text-slate-500 font-mono text-[11px]">
                          {song.year}
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-slate-500 text-[11px]">
                          {formatSongDuration(song.duration)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onToggleFavorite(song.id)}
                              className={`p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer ${
                                isFav ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'
                              }`}
                              title={isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>

                            <button
                              onClick={() => onSelectSongDetails(song)}
                              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                              title="Lihat Lirik & Info Lengkap"
                            >
                              <FileText className="w-4 h-4 text-indigo-600" />
                            </button>

                            <button
                              onClick={(e) => handleShare(song, e)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Bagikan Lagu"
                            >
                              {copiedShareId === song.id ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            const isFav = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`p-4 rounded-3xl bg-white border transition-all duration-200 cursor-pointer group hover:-translate-y-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-lg ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Cover Image with Play Overlay */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-100 shadow-xs">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-full bg-white text-indigo-700 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-indigo-700" />
                      ) : (
                        <Play className="w-5 h-5 fill-indigo-700 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Favorite Button on Card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
                      isFav ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Track Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getGenreColorBadge(song.genre)}`}>
                      {song.genre}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatSongDuration(song.duration)}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                    {song.title}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    {song.singer}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSongDetails(song)}
                      className="text-[11px] text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lirik Lagu</span>
                    </button>

                    <button
                      onClick={(e) => handleShare(song, e)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
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
