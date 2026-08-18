import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types/song';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Disc,
  Maximize2,
  Heart,
  Music,
  Download,
  Share2,
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { getGoogleDriveAudioCandidates, extractDriveId } from '../services/googleDrive';

interface AudioPlayerProps {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectSong: (song: Song) => void;
  onOpenDetails: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  favorites: string[];
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentSong,
  playlist,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSelectSong,
  onOpenDetails,
  onToggleFavorite,
  favorites
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [candidates, setCandidates] = useState<string[]>([]);

  // Sync audio source when currentSong changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    setAudioError(false);
    const driveInput = currentSong.driveId || currentSong.audioUrl || '';
    const candList = getGoogleDriveAudioCandidates(driveInput);
    
    const finalCandidates: string[] = [];
    candList.forEach((c) => {
      if (c && !finalCandidates.includes(c)) finalCandidates.push(c);
    });

    if (currentSong.audioUrl && !finalCandidates.includes(currentSong.audioUrl)) {
      finalCandidates.push(currentSong.audioUrl);
    }

    setCandidates(finalCandidates);
    setCandidateIndex(0);

    const initialSrc = finalCandidates[0] || currentSong.audioUrl || '';
    if (initialSrc) {
      audioRef.current.src = initialSrc;
      audioRef.current.load();

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Autoplay prevented or audio load error:', err);
        });
      }
    }
  }, [currentSong]);

  // Handle Play/Pause trigger
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Error playing audio:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onNext, onPrev]);

  // Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onSelectSong(playlist[randomIndex]);
    } else {
      onNext();
    }
  };

  const handleAudioError = () => {
    console.warn(`Audio candidate ${candidateIndex} failed. Trying next fallback format...`);
    if (candidates.length > candidateIndex + 1 && audioRef.current) {
      const nextIdx = candidateIndex + 1;
      setCandidateIndex(nextIdx);
      audioRef.current.src = candidates[nextIdx];
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      console.warn('All streaming formats restricted by Google Drive or link invalid.');
      setAudioError(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const isFav = favorites.includes(currentSong.id);
  const rawDriveId = extractDriveId(currentSong.driveId || currentSong.audioUrl || '');
  const googleDriveViewLink = rawDriveId ? `https://drive.google.com/file/d/${rawDriveId}/view` : null;

  // Find next song in queue
  const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
  const nextSong = playlist[(currentIndex + 1) % playlist.length];

  return (
    <>
      {/* Hidden Audio HTML Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Floating Bottom Spotify-Style Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto glass-panel rounded-3xl p-3 sm:p-4 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto backdrop-blur-2xl">
          
          {/* Audio Error Alert if Drive File is Private / Restricted */}
          {audioError && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Audio Google Drive belum bisa berputar otomatis. Pastikan file Drive diatur ke: <strong>"Siapa saja yang memiliki link: Pelihat"</strong>.
                </span>
              </div>
              {googleDriveViewLink && (
                <a
                  href={googleDriveViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-[11px] shrink-0 inline-flex items-center gap-1 transition"
                >
                  <span>Buka di Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Top Mini Progress Bar */}
          <div className="relative w-full h-1 bg-slate-800 rounded-full mb-3 cursor-pointer group">
            <div
              className="absolute h-full bg-gradient-to-r from-[#0099ff] to-[#00ffc8] rounded-full group-hover:bg-[#00ffc8]"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
            
            {/* Left 4 Cols: Song Info & Vinyl Cover */}
            <div className="col-span-8 sm:col-span-4 lg:col-span-3 flex items-center gap-3">
              <div
                onClick={() => onOpenDetails(currentSong)}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 cursor-pointer group shadow-lg border border-slate-700/60"
              >
                <img
                  src={currentSong.cover}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />

                {/* Spinning Vinyl overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <Disc className={`w-6 h-6 text-[#00ffc8] ${isPlaying ? 'animate-spin-slow' : ''}`} />
                </div>
              </div>

              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <h4
                    onClick={() => onOpenDetails(currentSong)}
                    className="text-sm font-bold text-white truncate cursor-pointer hover:text-[#00ffc8] transition-colors"
                  >
                    {currentSong.title}
                  </h4>
                  <button
                    onClick={() => onToggleFavorite(currentSong.id)}
                    className="text-slate-400 hover:text-rose-500 shrink-0"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 truncate">{currentSong.singer}</p>

                {/* Waveform Visualizer */}
                <div className="mt-1 hidden sm:block">
                  <AudioVisualizer isPlaying={isPlaying && !audioError} barCount={20} height={16} />
                </div>
              </div>
            </div>

            {/* Middle 4-5 Cols: Main Play Controls & Seek Time */}
            <div className="col-span-4 sm:col-span-4 lg:col-span-6 flex flex-col items-center justify-center">
              
              {/* Playback Controls */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Shuffle Button */}
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-full text-xs transition-colors hidden lg:block ${
                    isShuffle ? 'text-[#00ffc8] bg-[#00ffc8]/10' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Acak Lagu (Shuffle)"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Prev Song */}
                <button
                  onClick={onPrev}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
                  title="Lagu Sebelumnya (←)"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play / Pause Main Button */}
                <button
                  onClick={onPlayPause}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#0099ff] to-[#00ffc8] text-slate-950 font-bold flex items-center justify-center shadow-[0_0_20px_rgba(0,255,200,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Play / Pause (Space)"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 ml-0.5" />
                  )}
                </button>

                {/* Next Song */}
                <button
                  onClick={onNext}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition-colors cursor-pointer"
                  title="Lagu Berikutnya (→)"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Repeat Button */}
                <button
                  onClick={() => {
                    if (repeatMode === 'off') setRepeatMode('all');
                    else if (repeatMode === 'all') setRepeatMode('one');
                    else setRepeatMode('off');
                  }}
                  className={`p-1.5 rounded-full text-xs transition-colors hidden lg:block ${
                    repeatMode !== 'off' ? 'text-[#00ffc8] bg-[#00ffc8]/10' : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Ulangi: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Seek Bar Time Indicators */}
              <div className="hidden lg:flex items-center gap-3 w-full max-w-md text-[11px] font-mono text-slate-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00ffc8]"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            {/* Right 3 Cols: Volume, Queue Drawer, Full details */}
            <div className="hidden sm:flex col-span-4 lg:col-span-3 items-center justify-end gap-3">
              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#00ffc8]" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 accent-[#00ffc8] cursor-pointer"
                />
              </div>

              {/* Playlist Queue Toggle */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showQueue
                    ? 'bg-[#00ffc8]/20 border-[#00ffc8] text-[#00ffc8]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Daftar Antrean"
              >
                <ListMusic className="w-4 h-4" />
              </button>

              {/* Full Lyric/Detail Modal Trigger */}
              <button
                onClick={() => onOpenDetails(currentSong)}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-[#00ffc8] hover:border-[#00ffc8]/50 transition-colors cursor-pointer"
                title="Lirik & Detail"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Playlist Queue Drawer Modal */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-80 sm:w-96 glass-panel rounded-3xl p-5 border border-slate-700 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#00ffc8]" />
              Daftar Antrean Putar ({playlist.length} Lagu)
            </h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {playlist.map((s) => {
              const isCurrent = s.id === currentSong.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSong(s)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-[#00ffc8]/10 border-[#00ffc8] text-[#00ffc8]'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={s.cover} alt={s.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold truncate">{s.title}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{s.singer}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{s.duration}</span>
                </div>
              );
            })}
          </div>

          {/* Next Up Recommendation */}
          {nextSong && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Lagu Berikutnya:</span>
              <span className="font-semibold text-[#00ffc8] truncate max-w-[180px]">
                {nextSong.title}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

