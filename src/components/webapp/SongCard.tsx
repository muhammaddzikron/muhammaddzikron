import React, { useState } from 'react';
import { Song } from '../../types/song';
import {
  Play,
  Pause,
  Heart,
  FileText,
  Share2,
  HardDrive,
  Youtube,
  CheckCircle2,
  Music2
} from 'lucide-react';
import { formatSongDuration } from '../../utils/duration';

interface SongCardProps {
  song: Song;
  index?: number;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onSelectSongDetails: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  isFavorite: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  index = 0,
  currentSong,
  isPlaying,
  onPlaySong,
  onSelectSongDetails,
  onToggleFavorite,
  isFavorite
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const isCurrent = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handleShare = (e: React.MouseEvent) => {
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
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
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

  // Extract clean lyrics snippet
  const lyricsSnippet = song.lyrics
    ? song.lyrics
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(' • ')
    : 'Karya komposisi melodi orisinal hasil karya cipta Muhammad Dzikron.';

  return (
    <div
      onClick={() => onPlaySong(song)}
      className={`group relative rounded-2xl sm:rounded-3xl bg-white border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between space-y-3 shadow-[0_2px_18px_rgba(15,23,42,0.03)] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        isCurrent
          ? 'border-indigo-500 ring-2 ring-indigo-200/80 shadow-md bg-indigo-50/15'
          : 'border-slate-200/90 hover:border-indigo-300'
      }`}
    >
      <div className="space-y-2.5">
        {/* Header row: Album Thumbnail + Genre & Meta + Track Number & Favorite */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Album Cover Thumbnail */}
            <div
              className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs group/thumb bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                onPlaySong(song);
              }}
            >
              <img
                src={song.cover}
                alt={song.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                className={`absolute inset-0 bg-slate-900/40 flex items-center justify-center transition-opacity ${
                  isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
                }`}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getGenreColorBadge(
                    song.genre
                  )}`}
                >
                  {song.genre}
                </span>
                {song.youtubeUrl && (
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                    <Youtube className="w-2.5 h-2.5" /> Video
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                Format: <span className="text-slate-800 font-semibold">Audio Master HQ</span> • {formatSongDuration(song.duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
              #{String(song.order || index + 1).padStart(2, '0')}
            </span>
            <button
              onClick={() => onToggleFavorite(song.id)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Song Title & Creator */}
        <div>
          <h3
            className={`text-sm sm:text-base font-bold leading-snug transition-colors line-clamp-1 ${
              isCurrent ? 'text-indigo-600 font-extrabold' : 'text-slate-900 group-hover:text-indigo-600'
            }`}
          >
            {song.title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>Karya:</span>
            <strong className="text-slate-800 font-semibold">{song.singer}</strong>
            <span>•</span>
            <span className="font-medium text-slate-600">Rilis {song.year}</span>
          </p>
        </div>

        {/* Lyrics Quote Preview (Character card like Download Area) */}
        <div className="bg-slate-50/90 p-2 rounded-xl border border-slate-100/90 text-[11px] text-slate-600 leading-relaxed italic line-clamp-2">
          &ldquo;{lyricsSnippet}&rdquo;
        </div>

        {/* Google Drive Link Indicator */}
        <div className="flex items-center gap-1.5 text-[9.5px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
          <HardDrive className="w-3 h-3 text-indigo-600 shrink-0" />
          <span className="truncate font-medium">Tersimpan di Google Drive Resmi • Kualitas Studio</span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-1.5 pt-0.5">
        {/* Full-width Primary Play/Pause Button (matching Download Area card) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlaySong(song);
          }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCurrentPlaying
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200 animate-pulse'
              : isCurrent
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-sm shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isCurrentPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Jeda Audio Sedang Berputar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Putar Lagu Sekarang</span>
            </>
          )}
        </button>

        {/* Secondary Actions: Lirik & Info + Bagikan */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectSongDetails(song)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Lihat lirik dan informasi lengkap"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lirik & Info</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Bagikan lagu ini"
          >
            {copiedShare ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Bagikan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
