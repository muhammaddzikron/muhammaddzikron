import React, { useState } from 'react';
import { Song } from '../types/song';
import {
  X,
  Play,
  Pause,
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
  ExternalLink
} from 'lucide-react';

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onToggleFavorite: (songId: string) => void;
  isFavorite: boolean;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  onClose,
  isPlaying,
  onPlayPause,
  onToggleFavorite,
  isFavorite
}) => {
  const [copied, setCopied] = useState(false);
  const [lyricsCopied, setLyricsCopied] = useState(false);

  if (!song) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Dengarkan lagu "${song.title}" karya ${song.singer} (Cipt. Muhammad Dzikron)`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${currentUrl}#song-${song.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLyrics = () => {
    navigator.clipboard.writeText(`${song.title} - ${song.singer}\nCiptaan: Muhammad Dzikron\n\n${song.lyrics}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Container Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Big Cover Image, Vinyl Effect, Main Meta */}
          <div className="md:col-span-5 flex flex-col items-center">
            
            {/* Spinning Vinyl Vinyl Cover Wrapper */}
            <div className="relative group w-64 h-64 sm:w-72 sm:h-72 my-4">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#0099ff] to-[#00ffc8] rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition" />

              {/* Cover Card */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />

                {/* Spinning Vinyl Overlay when Playing */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-[#00ffc8] flex items-center justify-center shadow-2xl animate-spin-slow">
                    <Disc className="w-12 h-12 text-[#00ffc8]" />
                    <div className="absolute w-4 h-4 rounded-full bg-[#0099ff]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Play Button & Favorites */}
            <div className="flex items-center gap-4 mt-2 w-full justify-center">
              <button
                onClick={onPlayPause}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,200,0.4)] hover:scale-105 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{isPlaying ? 'Jeda Lagu' : 'Putar Sekarang'}</span>
              </button>

              <button
                onClick={() => onToggleFavorite(song.id)}
                className={`p-3 rounded-full border transition cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
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
                className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#00ffc8] transition"
              >
                <Download className="w-4 h-4" /> Download Audio dari Google Drive
              </a>
            )}

          </div>

          {/* Right Column: Song Metadata & Full Lyrics */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/40">
                  {song.genre}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {song.year}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300 flex items-center gap-1 font-mono">
                  <Music className="w-3.5 h-3.5" /> {song.duration}
                </span>
              </div>

              {/* Title & Artist */}
              <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-white mb-2">
                {song.title}
              </h2>
              <p className="text-sm text-slate-300 mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0099ff]" />
                Penyanyi: <span className="font-semibold text-white">{song.singer}</span>
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Ciptaan & Aransement: <span className="text-[#00ffc8] font-medium">Muhammad Dzikron</span>
              </p>

              {/* Full Lyrics Box */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 relative mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00ffc8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Lirik Lagu Lengkap
                  </h4>
                  <button
                    onClick={handleCopyLyrics}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 cursor-pointer"
                  >
                    {lyricsCopied ? <Check className="w-3.5 h-3.5 text-[#00ffc8]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{lyricsCopied ? 'Tersalin!' : 'Salin Lirik'}</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto pr-2 text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {song.lyrics}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#00ffc8]" /> Bagikan Karya Ini:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition cursor-pointer"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={shareFacebook}
                    className="px-3 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition cursor-pointer"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={shareTwitter}
                    className="px-3 py-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-600/30 transition cursor-pointer"
                  >
                    X (Twitter)
                  </button>
                  <button
                    onClick={shareTelegram}
                    className="px-3 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition cursor-pointer"
                  >
                    Telegram
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00ffc8]" /> : <Copy className="w-3.5 h-3.5" />}
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
