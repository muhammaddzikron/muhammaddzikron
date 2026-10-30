import React, { useState, useEffect, useCallback } from 'react';
import { Song, ComposerProfile } from './types/song';
import { INITIAL_SONGS, INITIAL_COMPOSER_PROFILE } from './data/initialData';
import {
  fetchSongsFromGoogleSheet,
  setStoredAppsScriptUrl,
  getStoredAppsScriptUrl,
  fetchProfileFromGoogleSheet,
  saveProfileToGoogleSheet,
  getStoredProfile,
  fetchDownloadsFromGoogleSheet
} from './services/appsScript';

import { BackgroundAurora } from './components/BackgroundAurora';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { AudioPlayer } from './components/AudioPlayer';
import { SongDetailModal } from './components/SongDetailModal';
import { GoogleSheetConfigModal } from './components/GoogleSheetConfigModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Web App UI Components
import { Sidebar, WebAppTab } from './components/webapp/Sidebar';
import { TopHeader } from './components/webapp/TopHeader';
import { HomeView } from './components/webapp/HomeView';
import { LibraryView } from './components/webapp/LibraryView';
import { LyricsView } from './components/webapp/LyricsView';
import { AboutView } from './components/webapp/AboutView';
import { ContactView } from './components/webapp/ContactView';
import { AdminView } from './components/webapp/AdminView';
import { DownloadView } from './components/webapp/DownloadView';
import { ShortcutsModal } from './components/webapp/ShortcutsModal';
import { MobileBottomNav } from './components/webapp/MobileBottomNav';
import { VisitorStatsWidget } from './components/webapp/VisitorStatsWidget';
import { getDownloadItems } from './services/downloadService';
import { formatSongDuration } from './utils/duration';
import { X, Disc3, Heart, FileText, Sparkles } from 'lucide-react';

const DUMMY_IDS = [
  '1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p',
  '2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q',
  '3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r',
  '4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s',
  '5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t',
  '6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u'
];

function sanitizeSongItem(s: Song): Song {
  return {
    ...s,
    driveId: DUMMY_IDS.includes(s.driveId || '') ? '' : s.driveId,
    duration: formatSongDuration(s.duration),
    status: s.status === 'Draft' ? 'Draft' : 'Publish'
  };
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dzikron_cached_songs');
        if (stored) {
          const list: Song[] = JSON.parse(stored);
          const hasOldDummy = list.some(
            (s) =>
              s.title === 'Cinta Dalam Doa' ||
              s.title === 'Melodi Sunyi' ||
              s.title === 'Langkah Kemenangan' ||
              s.title === 'Cahaya Ibu' ||
              s.id === 'song-1' ||
              s.id === 'song-2'
          );
          if (!hasOldDummy && list.length > 0) {
            list.sort((a, b) => (b.order - a.order) || (b.no - a.no));
            return list.map(sanitizeSongItem);
          } else {
            localStorage.removeItem('dzikron_cached_songs');
          }
        }
      } catch {}
    }
    return INITIAL_SONGS.map(sanitizeSongItem);
  });

  // Profile State
  const [profile, setProfile] = useState<ComposerProfile>(() => {
    return getStoredProfile();
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dzikron_cached_songs');
        if (stored) {
          const list: Song[] = JSON.parse(stored);
          const hasOldDummy = list.some(
            (s) => s.title === 'Cinta Dalam Doa' || s.title === 'Melodi Sunyi' || s.id === 'song-1'
          );
          if (!hasOldDummy && list.length > 0) {
            list.sort((a, b) => (b.order - a.order) || (b.no - a.no));
            return sanitizeSongItem(list[0]);
          }
        }
      } catch {}
    }
    return INITIAL_SONGS.length > 0 ? sanitizeSongItem(INITIAL_SONGS[0]) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveSheet, setIsLiveSheet] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  // Web App Navigation State
  const [activeTab, setActiveTab] = useState<WebAppTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Downloads Count
  const [downloadsCount, setDownloadsCount] = useState<number>(() => {
    return getDownloadItems().filter((d) => d.status !== 'hidden').length;
  });

  useEffect(() => {
    const handleDownloadsUpdated = () => {
      setDownloadsCount(getDownloadItems().filter((d) => d.status !== 'hidden').length);
    };
    window.addEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
    return () => window.removeEventListener('dzikron_downloads_updated', handleDownloadsUpdated);
  }, []);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dzikron_admin_authenticated') === 'true';
    }
    return false;
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dzikron_favorite_songs');
        if (stored) {
          const list: string[] = JSON.parse(stored);
          const filtered = list.filter((id) => !['song-1', 'song-2', 'song-3', 'song-4', 'song-5', 'song-6'].includes(id));
          if (filtered.length > 0) return filtered;
        }
      } catch {}
    }
    return ['song-real-1', 'song-real-2'];
  });

  const [selectedDetailSong, setSelectedDetailSong] = useState<Song | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Load songs from Google Apps Script endpoint if configured
  const loadSongs = useCallback(async (customUrl?: string) => {
    setIsLoadingSheet(true);
    const result = await fetchSongsFromGoogleSheet(customUrl);
    setSongs(result.songs);
    setIsLiveSheet(result.isLive);
    setIsLoadingSheet(false);

    if (result.songs.length > 0) {
      setCurrentSong((prev) => {
        if (!prev) return result.songs[0];
        const matched = result.songs.find(
          (s) =>
            s.id === prev.id ||
            (s.title.toLowerCase().trim() === prev.title.toLowerCase().trim() &&
              s.singer.toLowerCase().trim() === prev.singer.toLowerCase().trim())
        );
        return matched || result.songs[0];
      });
    }
    return result.isLive;
  }, []);

  // Load profile from Google Sheet on start
  const loadProfile = useCallback(async () => {
    const res = await fetchProfileFromGoogleSheet();
    setProfile(res.profile);
  }, []);

  // Load downloads from Google Sheet on start
  const loadDownloads = useCallback(async () => {
    await fetchDownloadsFromGoogleSheet();
  }, []);

  useEffect(() => {
    loadSongs();
    loadProfile();
    loadDownloads();
  }, [loadSongs, loadProfile, loadDownloads]);

  const handleSaveProfile = async (newProfile: ComposerProfile) => {
    setProfile(newProfile);
    const result = await saveProfileToGoogleSheet(newProfile);
    return result;
  };

  // Admin song management
  const handleAdminUpdateSongs = (updatedSongs: Song[]) => {
    setSongs(updatedSongs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dzikron_cached_songs', JSON.stringify(updatedSongs));
    }
  };

  const handleResetToDefaultSongs = () => {
    setSongs(INITIAL_SONGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dzikron_cached_songs');
    }
  };

  const handleUpdateSongDuration = useCallback((songId: string, duration: string) => {
    if (!duration || duration === '00:00') return;
    setSongs((prev) => {
      let hasChanged = false;
      const updated = prev.map((s) => {
        if (s.id === songId && s.duration !== duration) {
          hasChanged = true;
          return { ...s, duration };
        }
        return s;
      });
      if (hasChanged && typeof window !== 'undefined') {
        try {
          localStorage.setItem('dzikron_cached_songs', JSON.stringify(updated));
        } catch {}
      }
      return hasChanged ? updated : prev;
    });
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('dzikron_admin_authenticated');
    setIsAdminLoggedIn(false);
    setActiveTab('home');
  };

  // Persist favorites
  const toggleFavorite = (songId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('dzikron_favorite_songs', JSON.stringify(next));
      }
      return next;
    });
  };

  // Player controls
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      if (selectedDetailSong) {
        setSelectedDetailSong(song);
      }
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0) return;
    const baseSong = currentSong || selectedDetailSong || songs[0];
    const idx = songs.findIndex(
      (s) =>
        s.id === baseSong.id ||
        (s.title.toLowerCase().trim() === baseSong.title.toLowerCase().trim() &&
          s.singer.toLowerCase().trim() === baseSong.singer.toLowerCase().trim())
    );
    const nextIndex = idx === -1 ? 0 : (idx + 1) % songs.length;
    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);
    if (selectedDetailSong) {
      setSelectedDetailSong(nextSong);
    }
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (songs.length === 0) return;
    const baseSong = currentSong || selectedDetailSong || songs[0];
    const idx = songs.findIndex(
      (s) =>
        s.id === baseSong.id ||
        (s.title.toLowerCase().trim() === baseSong.title.toLowerCase().trim() &&
          s.singer.toLowerCase().trim() === baseSong.singer.toLowerCase().trim())
    );
    const prevIndex = idx === -1 ? 0 : (idx - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    setCurrentSong(prevSong);
    if (selectedDetailSong) {
      setSelectedDetailSong(prevSong);
    }
    setIsPlaying(true);
  };

  // Automatically update preview modal if it is currently open when song changes
  useEffect(() => {
    if (selectedDetailSong && currentSong && selectedDetailSong.id !== currentSong.id) {
      setSelectedDetailSong(currentSong);
    }
  }, [currentSong]);

  const handleTestAndSaveAppsScript = async (url: string) => {
    setStoredAppsScriptUrl(url);
    const success = await loadSongs(url);
    return success;
  };

  return (
    <div className="relative h-screen w-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 overflow-hidden flex flex-col">
      
      {/* Ambient Aurora Effects */}
      <BackgroundAurora />

      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* Loading Splash */}
      <LoadingScreen />

      {/* Main Web App Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileDrawerOpen(false);
          }}
          songsCount={songs.length}
          favoritesCount={favorites.length}
          downloadCount={downloadsCount}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={() => setShowAdminLoginModal(true)}
          onAdminLogout={handleAdminLogout}
          currentSong={currentSong}
          isPlaying={isPlaying}
        />

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md md:hidden flex"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-white border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1.5px] shadow-sm">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                        <Disc3 className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 font-serif tracking-tight leading-none">
                        Muhammad Dzikron
                      </h2>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Karya Tanpa Batas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1.5 text-sm font-semibold">
                  {[
                    { id: 'home', label: 'Beranda', activeBg: 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-500 font-extrabold', iconBg: 'bg-emerald-100 text-emerald-700' },
                    { id: 'library', label: `Semua Lagu (${songs.length})`, activeBg: 'bg-indigo-50 text-indigo-950 border-l-4 border-indigo-600 font-extrabold', iconBg: 'bg-indigo-100 text-indigo-700' },
                    { id: 'lyrics', label: 'Studio Lirik', activeBg: 'bg-amber-50 text-amber-950 border-l-4 border-amber-500 font-extrabold', iconBg: 'bg-amber-100 text-amber-700' },
                    { id: 'download', label: `Download Area (${downloadsCount})`, activeBg: 'bg-sky-50 text-sky-950 border-l-4 border-sky-500 font-extrabold', iconBg: 'bg-sky-100 text-sky-700' },
                    { id: 'about', label: 'Profil Komposer', activeBg: 'bg-purple-50 text-purple-950 border-l-4 border-purple-600 font-extrabold', iconBg: 'bg-purple-100 text-purple-700' },
                    { id: 'contact', label: 'Kontak & Pesanan', activeBg: 'bg-rose-50 text-rose-950 border-l-4 border-rose-500 font-extrabold', iconBg: 'bg-rose-100 text-rose-700' }
                  ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as WebAppTab);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition cursor-pointer text-xs font-semibold ${
                          isActive
                            ? `${item.activeBg} shadow-sm`
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Koleksi Saya (Mobile) */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="px-2 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Koleksi Saya</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('library');
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-500/20" />
                        <span>Lagu Favorit</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                        {favorites.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('lyrics');
                        setMobileDrawerOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Sedang Diputar</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                        {currentSong ? currentSong.title : 'None'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Statistik Pengunjung & Sumber Trafik (Di Bawah Koleksi Saya) */}
                <div className="pt-2 border-t border-slate-100">
                  <VisitorStatsWidget />
                </div>
              </div>

              {isAdminLoggedIn && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setActiveTab('admin');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-md"
                  >
                    Buka Studio Admin CMS
                  </button>

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      handleAdminLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                  >
                    Keluar / Logout Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Main Scrollable View Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f8fafc]/95">
          
          {/* Top Sticky Header */}
          <TopHeader
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
            onAdminLogout={handleAdminLogout}
            onOpenShortcuts={() => setShowShortcutsModal(true)}
            onToggleMobileMenu={() => setMobileDrawerOpen(true)}
          />

          {/* Dynamic Content View with Smooth Scroll */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 pb-28 md:pb-24">
            <div className="w-full">
              
              {activeTab === 'home' && (
                <HomeView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={handlePlaySong}
                  onSelectTab={setActiveTab}
                  onSelectSongDetails={(s) => setSelectedDetailSong(s)}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'library' && (
                <LibraryView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={handlePlaySong}
                  onSelectSongDetails={(s) => setSelectedDetailSong(s)}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  onRefreshPlaylist={() => loadSongs()}
                  isLoadingSheet={isLoadingSheet}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {activeTab === 'lyrics' && (
                <LyricsView
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={handlePlaySong}
                  onTogglePlayPause={() => setIsPlaying(!isPlaying)}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              )}

              {activeTab === 'download' && (
                <DownloadView
                  isAdminLoggedIn={isAdminLoggedIn}
                  onNavigateToAdmin={() => setActiveTab('admin')}
                />
              )}

              {activeTab === 'about' && (
                <AboutView
                  profile={profile}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onOpenEditProfile={() => setShowEditProfileModal(true)}
                  onOpenLoginModal={() => setShowAdminLoginModal(true)}
                />
              )}

              {activeTab === 'contact' && (
                <ContactView
                  isAdminLoggedIn={isAdminLoggedIn}
                  onOpenLoginModal={() => setShowAdminLoginModal(true)}
                />
              )}

              {activeTab === 'admin' && (
                <ErrorBoundary fallbackTitle="Kendala Memuat Dasbor Admin">
                  <AdminView
                    songs={songs}
                    onUpdateSongs={handleAdminUpdateSongs}
                    onLogout={handleAdminLogout}
                    onResetToDefault={handleResetToDefaultSongs}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onOpenLoginModal={() => setShowAdminLoginModal(true)}
                    onOpenEditProfile={() => setShowEditProfileModal(true)}
                  />
                </ErrorBoundary>
              )}

            </div>
          </main>

        </div>

      </div>

      {/* Persistent Web App Bottom Audio Player */}
      <AudioPlayer
        currentSong={currentSong}
        playlist={songs}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNextSong}
        onPrev={handlePrevSong}
        onSelectSong={(s) => {
          setCurrentSong(s);
          if (selectedDetailSong) {
            setSelectedDetailSong(s);
          }
          setIsPlaying(true);
        }}
        onOpenDetails={(s) => setSelectedDetailSong(s)}
        onToggleFavorite={toggleFavorite}
        favorites={favorites}
        onSongDurationDetected={handleUpdateSongDuration}
      />

      {/* Mobile Bottom Navigation Bar (Shown on small screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

      {/* Song Details & Lyrics Modal */}
      {selectedDetailSong && (
        <SongDetailModal
          song={selectedDetailSong}
          onClose={() => setSelectedDetailSong(null)}
          isPlaying={isPlaying && currentSong?.id === selectedDetailSong.id}
          onPlayPause={() => {
            if (currentSong?.id === selectedDetailSong.id) {
              setIsPlaying(!isPlaying);
            } else {
              setCurrentSong(selectedDetailSong);
              setIsPlaying(true);
            }
          }}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedDetailSong.id)}
          onNext={handleNextSong}
          onPrev={handlePrevSong}
          currentIndex={songs.findIndex((s) => s.id === selectedDetailSong.id)}
          totalSongs={songs.length}
        />
      )}

      {/* Google Spreadsheet Sync Modal */}
      <GoogleSheetConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onTestAndSave={handleTestAndSaveAppsScript}
        isLive={isLiveSheet}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveTab('admin');
        }}
      />

      {/* Edit Composer Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

    </div>
  );
}

