import React, { useState, useEffect } from 'react';
import { Song } from '../../types/song';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/youtube';
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
  Search
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

  // Automatically update active lyric song when current playing song changes
  useEffect(() => {
    if (currentSong) {
      setSelectedSongId(currentSong.id);
    }
  }, [currentSong?.id]);

  const activeSong = (selectedSongId ? songs.find((s) => s.id === selectedSongId) : null) || currentSong || songs[0] || null;

  if (!activeSong) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Music className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="font-semibold text-slate-700">Belum ada lagu yang tersedia.</p>
      </div>
    );
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(activeSong.youtubeUrl);
  const youtubeWatchUrl = getYouTubeWatchUrl(activeSong.youtubeUrl);

  const handleCopyLyrics = () => {
    if (!activeSong.lyrics) return;
    navigator.clipboard.writeText(`${activeSong.title} - ${activeSong.singer}\n\n${activeSong.lyrics}`);
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
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-sm group cursor-pointer"
            onClick={() => onPlaySong(activeSong)}
            title="Klik untuk memutar lagu ini"
          >
            <img
              src={activeSong.cover}
              alt={activeSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
              {isPlaying && currentSong?.id === activeSong.id ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-current ml-0.5" />
              )}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Studio Lirik & Video Interaktif</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
              {activeSong.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Karya Cipta: <strong className="text-slate-800">{activeSong.singer}</strong> ({activeSong.year}) • <span className="font-medium text-indigo-600">{activeSong.genre}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher if YouTube is available */}
          {youtubeEmbedUrl && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'lyrics' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lirik</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'video' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Video YouTube</span>
              </button>
            </div>
          )}

          {/* Quick Play Trigger */}
          <button
            onClick={() => onPlaySong(activeSong)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm shadow-indigo-200 active:scale-95"
          >
            {isPlaying && currentSong?.id === activeSong.id ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda Audio</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar Lagu</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyLyrics}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer shadow-xs active:scale-95"
            title="Salin lirik ke clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Tersalin!' : 'Salin Lirik'}</span>
          </button>

          {/* Download Text Button */}
          <button
            onClick={handleDownloadLyrics}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer shadow-xs active:scale-95"
            title="Unduh Lirik (.txt)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${fontSize === 'sm' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Font Kecil"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${fontSize === 'base' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Font Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${fontSize === 'lg' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Font Besar"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${fontSize === 'xl' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Font Ekstra Besar"
            >
              A++
            </button>
          </div>
        </div>

      </div>

      {/* Grid Layout: Song Selector + Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Playlist Switcher (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-amber-600" />
              <span>Daftar Karya ({songs.length})</span>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari lagu / genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_4px_25px_rgba(15,23,42,0.04)] divide-y divide-slate-100 overflow-hidden max-h-[550px] overflow-y-auto">
            {filteredSongs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">Tidak ada lagu yang cocok.</div>
            ) : (
              filteredSongs.map((song) => {
                const isSelected = activeSong.id === song.id;
                const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
                const hasVideo = Boolean(getYouTubeEmbedUrl(song.youtubeUrl));
                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSongId(song.id)}
                    className={`flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 group/play border border-slate-200 shadow-xs">
                        <img
                          src={song.cover}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlaySong(song);
                          }}
                          className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition"
                          title="Putar audio"
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isSelected ? 'text-amber-900' : 'text-slate-900'}`}>
                          <span>{song.title}</span>
                          {hasVideo && (
                            <Youtube className="w-3 h-3 text-rose-500 shrink-0 inline" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {song.singer} • {song.genre}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {song.duration}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Lyrics or YouTube Stage (8 cols) */}
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-[0_4px_25px_rgba(15,23,42,0.04)] overflow-hidden min-h-[550px]">
            
            {/* Ambient Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 opacity-60 pointer-events-none select-none">
              <Disc3 className="w-96 h-96 animate-spin-slow" />
            </div>

            {/* Visualizer Wave when playing */}
            {isPlaying && currentSong?.id === activeSong.id && (
              <div className="mb-6 pb-4 border-b border-slate-100">
                <AudioVisualizer isPlaying={isPlaying} barCount={32} />
              </div>
            )}

            {/* Stage Content: Video View or Lyrics View */}
            {activeTab === 'video' && youtubeEmbedUrl ? (
              <div className="relative z-10 space-y-4 animate-in fade-in duration-300">
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
                      <span>Tonton di YouTube</span>
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
              <div className="relative z-10">
                <FormattedLyrics lyrics={activeSong.lyrics} fontSizeClass={fontClasses} />
              </div>
            )}

            {/* Lyrics Footer Info */}
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <p>© Hak Cipta Dilindungi Undang-Undang. Muhammad Dzikron.</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                  {activeSong.genre} • {activeSong.year}
                </span>
                {youtubeEmbedUrl && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-rose-600" /> Video Ready
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
