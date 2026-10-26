import React, { useState, useEffect } from 'react';
import { Song } from '../../types/song';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/youtube';
import { formatSongDuration } from '../../utils/duration';
import { FormattedLyrics } from '../FormattedLyrics';
import {
  FileText,
  Music,
  Copy,
  Check,
  Sparkles,
  Play,
  Pause,
  Disc3,
  ListMusic,
  Youtube,
  ExternalLink,
  Download,
  Search,
  Heart,
  Radio
} from 'lucide-react';
import { AudioVisualizer } from '../AudioVisualizer';

interface LyricsViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlayPause: () => void;
  onToggleFavorite: (songId: string) => void;
  favorites: string[];
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlayPause,
  onToggleFavorite,
  favorites
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'video'>('lyrics');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Automatically sync active lyric song when current playing song changes
  useEffect(() => {
    if (currentSong) {
      setSelectedSongId(currentSong.id);
    }
  }, [currentSong?.id]);

  const activeSong =
    (selectedSongId ? songs.find((s) => s.id === selectedSongId) : null) ||
    currentSong ||
    songs[0] ||
    null;

  if (!activeSong) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
        <Music className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-slate-700">Belum ada lagu yang tersedia.</p>
      </div>
    );
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(activeSong.youtubeUrl);
  const youtubeWatchUrl = getYouTubeWatchUrl(activeSong.youtubeUrl);
  const isCurrentActivePlaying = isPlaying && currentSong?.id === activeSong.id;
  const isFav = favorites.includes(activeSong.id);

  const handleCopyLyrics = () => {
    if (!activeSong.lyrics) return;
    navigator.clipboard.writeText(
      `${activeSong.title} - ${activeSong.singer}\n\n${activeSong.lyrics}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadLyrics = () => {
    if (!activeSong.lyrics) return;
    const content = `Judul: ${activeSong.title}\nPencipta: ${activeSong.singer}\nGenre: ${activeSong.genre} (${activeSong.year})\n\n=========================================\nLIRIK LAGU:\n=========================================\n\n${activeSong.lyrics}\n\n© Muhammad Dzikron. Hak Cipta Dilindungi Undang-Undang.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lirik_${activeSong.title.replace(/\s+/g, '_')}_Muhammad_Dzikron.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fontClasses = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-loose',
    xl: 'text-lg sm:text-xl leading-loose font-medium'
  }[fontSize];

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.singer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      
      {/* 2-Column Responsive Layout: Left Playlist Selector + Right Lyrics Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        
        {/* Left Column: Playlist Switcher (4 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-2.5">
          {/* Header Bar */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Lagu
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {filteredSongs.length} Lagu
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul / lirik / genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 shadow-xs transition"
            />
          </div>

          {/* Songs List Container (Solid white, prominent titles) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden max-h-[620px] overflow-y-auto">
            {filteredSongs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada lagu yang cocok dengan pencarian.
              </div>
            ) : (
              filteredSongs.map((song, idx) => {
                const isSelected = activeSong.id === song.id;
                const isThisPlaying = currentSong?.id === song.id && isPlaying;
                const hasVideo = Boolean(getYouTubeEmbedUrl(song.youtubeUrl));

                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSongId(song.id)}
                    className={`flex items-center gap-3 p-3 transition cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-50/80 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Cover Art with Play Button */}
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentSong?.id === song.id) {
                            onTogglePlayPause();
                          } else {
                            onPlaySong(song);
                          }
                        }}
                        className={`absolute inset-0 flex items-center justify-center transition ${
                          isThisPlaying
                            ? 'bg-amber-900/40 opacity-100'
                            : 'bg-slate-900/40 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isThisPlaying ? 'Jeda Audio' : 'Putar Audio'}
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-current" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Song Title and Details (Explicit flex-1 min-w-0, always clearly readable) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate block ${
                            isSelected ? 'text-amber-900 font-extrabold' : 'text-slate-900 group-hover:text-amber-700'
                          }`}
                        >
                          {song.title}
                        </span>
                        {hasVideo && (
                          <Youtube className="w-3 h-3 text-rose-500 shrink-0" title="Ada Video YouTube" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <span>{song.singer}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-indigo-600">{song.genre}</span>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {formatSongDuration(song.duration)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Prominent Song Title + Metadata Header + Lyrics Stage (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 lg:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.04)] overflow-hidden min-h-[580px]">
            
            {/* Ambient Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100/70 opacity-40 pointer-events-none select-none">
              <Disc3 className="w-96 h-96 animate-spin-slow" />
            </div>

            {/* PROMINENT TITLE & SONG DESCRIPTION HEADER (CLEARLY VISIBLE & HIGH CONTRAST) */}
            <div className="relative z-10 pb-5 mb-5 border-b border-slate-100 space-y-4">
              
              {/* Row 1: Badges & Format */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Studio Lirik Resmi</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                    {activeSong.genre}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
                    Rilis {activeSong.year}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs">
                    {formatSongDuration(activeSong.duration)}
                  </span>
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={() => onToggleFavorite(activeSong.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer shadow-xs active:scale-95 ${
                    isFav
                      ? 'bg-rose-50 text-rose-600 border-rose-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title={isFav ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Row 2: Album Cover + Song Title + Composer Description */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Album Cover Thumbnail */}
                <div
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-md group cursor-pointer bg-slate-100"
                  onClick={() => onPlaySong(activeSong)}
                  title="Klik untuk memutar lagu ini"
                >
                  <img
                    src={activeSong.cover}
                    alt={activeSong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                    {isCurrentActivePlaying ? (
                      <Pause className="w-6 h-6 text-white fill-current" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Title & Creator Info (Ultra-sharp, high-contrast text) */}
                <div className="space-y-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                    {activeSong.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold flex flex-wrap items-center gap-1.5">
                    <span>Ciptaan & Aransemen:</span>
                    <strong className="text-indigo-700 font-bold">{activeSong.singer || 'Muhammad Dzikron'}</strong>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-normal">Kualitas Audio Master Studio HQ</span>
                  </p>
                </div>
              </div>

              {/* Row 3: Comprehensive Toolbar (Play, Tabs, Copy, Download, Font Size) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                {/* Left controls: Play & Tab Switcher */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentSong?.id === activeSong.id) {
                        onTogglePlayPause();
                      } else {
                        onPlaySong(activeSong);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm shadow-amber-200 active:scale-95"
                  >
                    {isCurrentActivePlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Jeda Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar Audio</span>
                      </>
                    )}
                  </button>

                  {/* Switch between Lyrics and Video (if video available) */}
                  {youtubeEmbedUrl && (
                    <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                      <button
                        onClick={() => setActiveTab('lyrics')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          activeTab === 'lyrics'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lirik</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('video')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          activeTab === 'video'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Video Klip</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right controls: Copy, Download, Font Resize */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyLyrics}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer shadow-xs active:scale-95"
                    title="Salin lirik ke clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{copied ? 'Tersalin!' : 'Salin Lirik'}</span>
                  </button>

                  <button
                    onClick={handleDownloadLyrics}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer shadow-xs active:scale-95"
                    title="Unduh Lirik (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  {/* Font Size Adjusters */}
                  <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                          fontSize === size
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title={`Ukuran Font: ${size.toUpperCase()}`}
                      >
                        {size === 'sm' ? 'A-' : size === 'base' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Visualizer Wave when playing */}
            {isCurrentActivePlaying && (
              <div className="mb-4 pb-3 border-b border-slate-100 relative z-10">
                <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                    Audio Sedang Berputar
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">24-bit / 48kHz Master</span>
                </div>
                <AudioVisualizer isPlaying={isPlaying} barCount={36} />
              </div>
            )}

            {/* Stage Content: Video View or Lyrics View */}
            {activeTab === 'video' && youtubeEmbedUrl ? (
              <div className="relative z-10 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span>Official Video YouTube: {activeSong.title}</span>
                  </div>
                  {youtubeWatchUrl && (
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold transition"
                    >
                      <span>Buka di YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-xl">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`Video musik ${activeSong.title} - ${activeSong.singer}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="relative z-10 pt-1">
                <FormattedLyrics lyrics={activeSong.lyrics} fontSizeClass={fontClasses} />
              </div>
            )}

            {/* Lyrics Footer Info */}
            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500">
              <p>© Hak Cipta Dilindungi Undang-Undang. Muhammad Dzikron.</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                  {activeSong.genre} • Tahun {activeSong.year}
                </span>
                {youtubeEmbedUrl && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-rose-600" /> Video Tersedia
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
