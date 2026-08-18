import React, { useState } from 'react';
import { Song } from '../../types/song';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../../utils/youtube';
import {
  FileText,
  Music,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Play,
  Pause,
  Disc3,
  Heart,
  ListMusic,
  Share2,
  Youtube,
  Tv,
  ExternalLink
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

  const activeSong = currentSong || songs[0] || null;

  if (!activeSong) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Music className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p>Belum ada lagu yang dipilih.</p>
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

  const fontClasses = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-loose',
    xl: 'text-lg sm:text-xl leading-loose font-medium'
  }[fontSize];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#031c22] border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-700/80 shrink-0 shadow-lg group cursor-pointer" onClick={onTogglePlayPause}>
            <img
              src={activeSong.cover}
              alt={activeSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              {isPlaying && currentSong?.id === activeSong.id ? (
                <Pause className="w-6 h-6 text-[#00ffc8]" />
              ) : (
                <Play className="w-6 h-6 text-[#00ffc8] fill-current ml-0.5" />
              )}
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-[10px] font-bold uppercase tracking-wider mb-1 border border-[#00ffc8]/20">
              <Sparkles className="w-3 h-3" />
              <span>Studio Lirik & Video Interaktif</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-serif font-extrabold text-white tracking-tight">
              {activeSong.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Karya Cipta: <strong className="text-[#00ffc8]">{activeSong.singer}</strong> ({activeSong.year}) • {activeSong.genre}
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher if YouTube is available */}
          {youtubeEmbedUrl && (
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'lyrics' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lirik</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'video' ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Video YouTube</span>
              </button>
            </div>
          )}

          {/* Quick Play Trigger */}
          <button
            onClick={() => onPlaySong(activeSong)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-xs flex items-center gap-2 hover:scale-105 transition cursor-pointer shadow-[0_0_15px_rgba(0,255,200,0.3)]"
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
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00ffc8]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Lirik Disalin!' : 'Salin Lirik'}</span>
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'sm' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400'}`}
              title="Font Kecil"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'base' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400'}`}
              title="Font Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'lg' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400'}`}
              title="Font Besar"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'xl' ? 'bg-slate-800 text-[#00ffc8]' : 'text-slate-400'}`}
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <ListMusic className="w-4 h-4 text-[#00ffc8]" />
            <span>Pilih Lagu Lain</span>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 divide-y divide-slate-800/60 overflow-hidden max-h-[550px] overflow-y-auto">
            {songs.map((song) => {
              const isSelected = activeSong.id === song.id;
              const hasVideo = Boolean(getYouTubeEmbedUrl(song.youtubeUrl));
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`flex items-center justify-between p-3 hover:bg-slate-800/50 transition cursor-pointer ${
                    isSelected ? 'bg-[#00ffc8]/10 border-l-3 border-[#00ffc8]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate flex items-center gap-1.5 ${isSelected ? 'text-[#00ffc8]' : 'text-white'}`}>
                        <span>{song.title}</span>
                        {hasVideo && (
                          <Youtube className="w-3 h-3 text-red-500 shrink-0 inline" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {song.singer}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {song.duration}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lyrics or YouTube Stage (8 cols) */}
        <div className="lg:col-span-8">
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[550px]">
            
            {/* Ambient Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none">
              <Disc3 className="w-96 h-96 animate-spin-slow" />
            </div>

            {/* Visualizer Wave when playing */}
            {isPlaying && currentSong?.id === activeSong.id && (
              <div className="mb-6 pb-4 border-b border-slate-800/80">
                <AudioVisualizer isPlaying={isPlaying} barCount={32} />
              </div>
            )}

            {/* Stage Content: Video View or Lyrics View */}
            {activeTab === 'video' && youtubeEmbedUrl ? (
              <div className="relative z-10 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Official Video YouTube: {activeSong.title}</span>
                  </div>
                  {youtubeWatchUrl && (
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition"
                    >
                      <span>Tonton di YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
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
              <div className="relative z-10 space-y-4">
                {activeSong.lyrics ? (
                  <div className={`${fontClasses} font-serif whitespace-pre-line text-slate-200 tracking-wide select-text`}>
                    {activeSong.lyrics}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <p>Lirik belum ditambahkan untuk lagu ini.</p>
                    <p className="text-xs mt-1 text-slate-400">Gunakan Dashboard Admin CMS untuk mengisi lirik.</p>
                  </div>
                )}
              </div>
            )}

            {/* Lyrics Footer Info */}
            <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <p>© Hak Cipta Dilindungi Undang-Undang. Muhammad Dzikron.</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[#00ffc8] text-[11px] font-medium">
                  {activeSong.genre} • {activeSong.year}
                </span>
                {youtubeEmbedUrl && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[11px] font-medium flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-red-500" /> Video Ready
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
