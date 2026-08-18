import React, { useState, useEffect, useCallback } from 'react';
import { Song, ComposerProfile } from './types/song';
import { INITIAL_SONGS, INITIAL_COMPOSER_PROFILE } from './data/initialData';
import {
  fetchSongsFromGoogleSheet,
  setStoredAppsScriptUrl,
  getStoredAppsScriptUrl,
  fetchProfileFromGoogleSheet,
  saveProfileToGoogleSheet,
  getStoredProfile
} from './services/appsScript';

import { BackgroundAurora } from './components/BackgroundAurora';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { AudioPlayer } from './components/AudioPlayer';
import { SongDetailModal } from './components/SongDetailModal';
import { GoogleSheetConfigModal } from './components/GoogleSheetConfigModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditProfileModal } from './components/EditProfileModal';

// Web App UI Components
import { Sidebar, WebAppTab } from './components/webapp/Sidebar';
import { TopHeader } from './components/webapp/TopHeader';
import { HomeView } from './components/webapp/HomeView';
import { LibraryView } from './components/webapp/LibraryView';
import { LyricsView } from './components/webapp/LyricsView';
import { AboutView } from './components/webapp/AboutView';
import { ContactView } from './components/webapp/ContactView';
import { AdminView } from './components/webapp/AdminView';
import { ShortcutsModal } from './components/webapp/ShortcutsModal';
import { MobileBottomNav } from './components/webapp/MobileBottomNav';
import { formatSongDuration } from './utils/duration';
import { X, Disc3 } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dzikron_cached_songs');
        const list: Song[] = stored ? JSON.parse(stored) : INITIAL_SONGS;
        return list.map((s) => ({ ...s, duration: formatSongDuration(s.duration) }));
      } catch {
        return INITIAL_SONGS.map((s) => ({ ...s, duration: formatSongDuration(s.duration) }));
      }
    }
    return INITIAL_SONGS.map((s) => ({ ...s, duration: formatSongDuration(s.duration) }));
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
          if (list && list.length > 0) {
            return { ...list[0], duration: formatSongDuration(list[0].duration) };
          }
        }
      } catch {}
    }
    return INITIAL_SONGS.length > 0
      ? { ...INITIAL_SONGS[0], duration: formatSongDuration(INITIAL_SONGS[0].duration) }
      : null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiveSheet, setIsLiveSheet] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  // Web App Navigation State
  const [activeTab, setActiveTab] = useState<WebAppTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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
        return stored ? JSON.parse(stored) : ['song-1', 'song-2'];
      } catch {
        return ['song-1', 'song-2'];
      }
    }
    return ['song-1', 'song-2'];
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

  useEffect(() => {
    loadSongs();
    loadProfile();
  }, [loadSongs, loadProfile]);

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
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0) return;
    if (!currentSong) {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
      return;
    }
    const idx = songs.findIndex(
      (s) =>
        s.id === currentSong.id ||
        (s.title.toLowerCase().trim() === currentSong.title.toLowerCase().trim() &&
          s.singer.toLowerCase().trim() === currentSong.singer.toLowerCase().trim())
    );
    const nextIndex = idx === -1 ? 0 : (idx + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (songs.length === 0) return;
    if (!currentSong) {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
      return;
    }
    const idx = songs.findIndex(
      (s) =>
        s.id === currentSong.id ||
        (s.title.toLowerCase().trim() === currentSong.title.toLowerCase().trim() &&
          s.singer.toLowerCase().trim() === currentSong.singer.toLowerCase().trim())
    );
    const prevIndex = idx === -1 ? 0 : (idx - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const handleTestAndSaveAppsScript = async (url: string) => {
    setStoredAppsScriptUrl(url);
    const success = await loadSongs(url);
    return success;
  };

  return (
    <div className="relative h-screen w-screen bg-[#050505] text-slate-100 font-sans selection:bg-[#00ffc8]/30 selection:text-[#00ffc8] overflow-hidden flex flex-col">
      
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-[#080d17] border-r border-slate-800 p-5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0099ff] to-[#00ffc8] p-[1px]">
                      <div className="w-full h-full bg-[#050811] rounded-[11px] flex items-center justify-center">
                        <Disc3 className="w-4 h-4 text-[#00ffc8]" />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white font-serif tracking-tight leading-none">
                        Muhammad Dzikron
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Jarak Yang Tak Berujung
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1 text-sm font-semibold">
                  {[
                    { id: 'home', label: 'Beranda' },
                    { id: 'library', label: `Semua Lagu (${songs.length})` },
                    { id: 'lyrics', label: 'Studio Lirik' },
                    { id: 'about', label: 'Profil Komposer' },
                    { id: 'contact', label: 'Kontak & Pesanan' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as WebAppTab);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition ${
                        activeTab === item.id
                          ? 'bg-[#00ffc8] text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {isAdminLoggedIn && (
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setActiveTab('admin');
                    }}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-[#00ffc8] text-xs font-bold"
                  >
                    Buka Studio Admin CMS
                  </button>

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      handleAdminLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold"
                  >
                    Keluar / Logout Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Main Scrollable View Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#060911]/60">
          
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
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-40 md:pb-32">
            <div className="max-w-7xl mx-auto">
              
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
                <AdminView
                  songs={songs}
                  onUpdateSongs={handleAdminUpdateSongs}
                  onLogout={handleAdminLogout}
                  onResetToDefault={handleResetToDefaultSongs}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onOpenLoginModal={() => setShowAdminLoginModal(true)}
                  onOpenEditProfile={() => setShowEditProfileModal(true)}
                />
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

