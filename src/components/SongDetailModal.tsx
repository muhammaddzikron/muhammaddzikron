import React, { useState, useEffect } from 'react';
import { Song } from '../types/song';
import { formatSongDuration } from '../utils/duration';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';
import { FormattedLyrics } from './FormattedLyrics';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  Copy,
  Check,
  Download,
  Disc,
  Music,
  Calendar,
  User,
  Sparkles,
  ExternalLink,
  Youtube
} from 'lucide-react';

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onToggleFavorite: (songId: string) => void;
  isFavorite: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalSongs?: number;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  onClose,
  isPlaying,
  onPlayPause,
  onToggleFavorite,
  isFavorite,
  onNext,
  onPrev,
  currentIndex,
  totalSongs
}) => {
  const [copied, setCopied] = useState(false);
  const [lyricsCopied, setLyricsCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
    setLyricsCopied(false);
  }, [song?.id]);

  if (!song) return null;

  const youtubeEmbedUrl = getYouTubeEmbedUrl(song.youtubeUrl);
  const youtubeWatchUrl = getYouTubeWatchUrl(song.youtubeUrl);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const creator = song.singer || 'Muhammad Dzikron';
  const shareText = `Dengarkan lagu "${song.title}" - Ciptaan & Aransemen: ${creator}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${currentUrl}#song-${song.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLyrics = () => {
    navigator.clipboard.writeText(`${song.title}\nCiptaan & Aransemen: ${creator}\n\n${song.lyrics}`);
    setLyricsCopied(true);
    setTimeout(() => setLyricsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const downloadUrl = song.audioUrl || `https://drive.google.com/uc?export=download&id=${song.driveId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Container Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xl text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Big Cover Image, Vinyl Effect, Main Meta */}
          <div className="md:col-span-5 flex flex-col items-center">
            
            {/* Spinning Vinyl Cover Wrapper */}
            <div className="relative group w-64 h-64 sm:w-72 sm:h-72 my-4">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-200 to-amber-200 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition" />

              {/* Cover Card */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-100">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />

                {/* Spinning Vinyl Overlay when Playing */}
                <div className={`absolute inset-0 bg-slate-900/40 flex items-center justify-center transition-opacity ${
                  isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-2xl animate-spin-slow">
                    <Disc className="w-12 h-12 text-indigo-600" />
                    <div className="absolute w-4 h-4 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Play Button, Previous/Next & Favorites */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-2 w-full justify-center">
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 border border-slate-200 transition cursor-pointer shadow-xs"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onPlayPause}
                className="px-5 sm:px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-200 hover:scale-105 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Jeda Lagu' : 'Putar Sekarang'}</span>
              </button>

              {onNext && (
                <button
                  onClick={onNext}
                  className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 border border-slate-200 transition cursor-pointer shadow-xs"
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onToggleFavorite(song.id)}
                className={`p-3 rounded-full border transition cursor-pointer shadow-xs ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Download Link if allowed */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 transition font-medium"
              >
                <Download className="w-4 h-4" /> Download Audio dari Google Drive
              </a>
            )}

          </div>

          {/* Right Column: Song Metadata, YouTube Video, & Full Lyrics */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {song.genre}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> {song.year}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 font-mono">
                  <Music className="w-3.5 h-3.5" /> {formatSongDuration(song.duration)}
                </span>
                {youtubeEmbedUrl && (
                  <span className="px-3 py-1 rounded-lg text-xs bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 font-bold">
                    <Youtube className="w-3.5 h-3.5 text-rose-600" /> Video Siap Putar
                  </span>
                )}
                {typeof currentIndex === 'number' && typeof totalSongs === 'number' && totalSongs > 0 && (
                  <span className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200">
                    Track {currentIndex + 1}/{totalSongs}
                  </span>
                )}
              </div>

              {/* Title & Creator */}
              <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 mb-2">
                {song.title}
              </h2>
              <p className="text-sm text-slate-600 mb-5 flex items-center gap-2 flex-wrap">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-500">Ciptaan & Aransemen:</span>
                <span className="font-semibold text-slate-900">{creator}</span>
              </p>

              {/* YouTube Video Player Embed */}
              {youtubeEmbedUrl && (
                <div className="mb-6 space-y-2 rounded-2xl bg-slate-50 border border-rose-200 p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <div className="p-1 rounded bg-rose-600 text-white">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <span>Video Musik / YouTube</span>
                    </div>

                    {youtubeWatchUrl && (
                      <a
                        href={youtubeWatchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold transition"
                      >
                        <span>Buka di YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={`Video musik ${song.title} - ${song.singer}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Full Lyrics Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative mb-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Lirik Lagu Lengkap
                  </h4>
                  <button
                    onClick={handleCopyLyrics}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs cursor-pointer"
                  >
                    {lyricsCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{lyricsCopied ? 'Tersalin!' : 'Salin Lirik'}</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto pr-2 text-xs sm:text-sm text-slate-800 font-sans">
                  <FormattedLyrics lyrics={song.lyrics} fontSizeClass="text-xs sm:text-sm leading-relaxed" />
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" /> Bagikan Karya Ini:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={shareFacebook}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer shadow-xs"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={shareTwitter}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition cursor-pointer shadow-xs"
                  >
                    X (Twitter)
                  </button>
                  <button
                    onClick={shareTelegram}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer shadow-xs"
                  >
                    Telegram
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Link Salin!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
