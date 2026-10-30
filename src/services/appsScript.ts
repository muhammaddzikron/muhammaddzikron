import { Song, Order, ComposerProfile, DownloadItem } from '../types/song';
import { INITIAL_SONGS, INITIAL_COMPOSER_PROFILE } from '../data/initialData';
import { getDownloadItems, saveDownloadItems, INITIAL_DOWNLOAD_ITEMS } from './downloadService';
import { getGoogleDriveAudioUrl, getGoogleDriveImageUrl } from './googleDrive';
import { formatSongDuration } from '../utils/duration';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwptAPCvBm9EAp7jGpIFg1vy53hJdrYokwbVZfQDnC8LlsiUTRkkAzZ2MZ-S0EOcdbE/exec';

const LOCAL_STORAGE_APPS_SCRIPT_KEY = 'dzikron_apps_script_url';
const LOCAL_STORAGE_CACHE_KEY = 'dzikron_cached_songs';
const LOCAL_STORAGE_ORDERS_CACHE_KEY = 'dzikron_cached_orders';
const LOCAL_STORAGE_PROFILE_KEY = 'dzikron_cached_profile';

export const INITIAL_SAMPLE_ORDERS: Order[] = [];

export function getStoredAppsScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_APPS_SCRIPT_URL;
  const saved = localStorage.getItem(LOCAL_STORAGE_APPS_SCRIPT_KEY);
  return (saved && saved.trim()) || DEFAULT_APPS_SCRIPT_URL;
}

export function setStoredAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_APPS_SCRIPT_KEY, url.trim());
}

// ==========================================
// 1. PROFIL KOMPOSER SINKRONISASI SPREADSHEET
// ==========================================

export function getStoredProfile(): ComposerProfile {
  if (typeof window === 'undefined') return INITIAL_COMPOSER_PROFILE;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (!raw) return INITIAL_COMPOSER_PROFILE;
    const parsed = JSON.parse(raw);
    // If cache still has old bio or doesn't mention Klaten, update to new official bio
    if (!parsed.bio || !parsed.bio.includes('Klaten')) {
      parsed.bio = INITIAL_COMPOSER_PROFILE.bio;
      parsed.location = INITIAL_COMPOSER_PROFILE.location;
      parsed.activeSince = INITIAL_COMPOSER_PROFILE.activeSince;
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify({ ...INITIAL_COMPOSER_PROFILE, ...parsed }));
    }
    return { ...INITIAL_COMPOSER_PROFILE, ...parsed };
  } catch {
    return INITIAL_COMPOSER_PROFILE;
  }
}

export function saveStoredProfile(profile: ComposerProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('dzikron_profile_updated'));
}

export async function fetchProfileFromGoogleSheet(
  customUrl?: string
): Promise<{ profile: ComposerProfile; isLive: boolean; error?: string }> {
  const endpoint = customUrl || getStoredAppsScriptUrl();
  const cached = getStoredProfile();

  if (!endpoint) {
    return { profile: cached, isLive: false };
  }

  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const fetchUrl = `${endpoint}${separator}type=profile&_t=${Date.now()}`;
    const res = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    let profileData: Partial<ComposerProfile> = {};

    if (json && json.data && typeof json.data.profile === 'object') {
      profileData = json.data.profile;
    } else if (json && typeof json.profile === 'object') {
      profileData = json.profile;
    } else if (Array.isArray(json)) {
      // If returned as key-value pairs array [{ Field: 'Nama', Value: 'Muhammad Dzikron' }]
      json.forEach((row: any) => {
        const key = String(row.Field || row.field || row.Key || row.key || '').toLowerCase().trim();
        const val = row.Value || row.value || row.Nilai || row.nilai;
        if (key.includes('nama')) profileData.name = val;
        else if (key.includes('tagline')) profileData.tagline = val;
        else if (key.includes('headline')) profileData.headline = val;
        else if (key.includes('foto') || key.includes('photo')) profileData.photoUrl = val;
        else if (key.includes('bio')) profileData.bio = val;
        else if (key.includes('pengalaman') || key.includes('experience')) profileData.experience = val;
        else if (key.includes('lokasi') || key.includes('location')) profileData.location = val;
        else if (key.includes('tahun') || key.includes('aktif') || key.includes('since')) profileData.activeSince = val;
        else if (key.includes('kolaborasi') || key.includes('status')) profileData.collaborationStatus = val;
        else if (key.includes('lagu') || key.includes('songs')) profileData.statSongs = val;
        else if (key.includes('album')) profileData.statAlbums = val;
        else if (key.includes('pendengar') || key.includes('listeners')) profileData.statListeners = val;
        else if (key.includes('genre')) profileData.statGenres = val;
      });
    } else if (typeof json === 'object' && json !== null) {
      profileData = json;
    }

    if (Object.keys(profileData).length > 0) {
      const mergedProfile: ComposerProfile = {
        ...INITIAL_COMPOSER_PROFILE,
        ...cached,
        ...profileData,
        photoUrl: profileData.photoUrl ? getGoogleDriveImageUrl(profileData.photoUrl) : (cached.photoUrl || INITIAL_COMPOSER_PROFILE.photoUrl)
      };
      saveStoredProfile(mergedProfile);
      return { profile: mergedProfile, isLive: true };
    }

    return { profile: cached, isLive: true };
  } catch (err: any) {
    console.warn('Gagal memuat profil dari Apps Script:', err.message);
    return { profile: cached, isLive: false, error: err.message };
  }
}

export async function saveProfileToGoogleSheet(
  profile: ComposerProfile,
  customUrl?: string
): Promise<{ success: boolean; message: string }> {
  const endpoint = customUrl || getStoredAppsScriptUrl();
  saveStoredProfile(profile);

  if (!endpoint) {
    return {
      success: true,
      message: 'Profil tersimpan di memori browser (URL Google Apps Script belum diisi).'
    };
  }

  try {
    const payload = {
      action: 'save_profile',
      profile: {
        name: profile.name,
        tagline: profile.tagline,
        headline: profile.headline,
        photoUrl: profile.photoUrl,
        bio: profile.bio,
        experience: profile.experience,
        location: profile.location,
        activeSince: profile.activeSince,
        collaborationStatus: profile.collaborationStatus,
        statSongs: profile.statSongs,
        statAlbums: profile.statAlbums,
        statListeners: profile.statListeners,
        statGenres: profile.statGenres
      }
    };

    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: 'Profil Komposer berhasil disimpan ke Google Spreadsheet (Tab "Profil")!'
    };
  } catch (err: any) {
    console.error('Error saving profile to Apps Script:', err);
    return {
      success: false,
      message: `Tersimpan secara lokal, namun gagal sinkron ke Spreadsheet: ${err.message}`
    };
  }
}

// ==========================================
// 2. PESANAN & KONTAK
// ==========================================

export async function fetchOrdersFromGoogleSheet(): Promise<{ orders: Order[]; isLive: boolean; error?: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    const cached = getCachedOrders();
    return { orders: cached, isLive: false };
  }

  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const fetchUrl = `${endpoint}${separator}type=orders&_t=${Date.now()}`;
    const res = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    let rawList: any[] = [];
    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && json.data && Array.isArray(json.data.orders)) {
      rawList = json.data.orders;
    } else if (json && Array.isArray(json.orders)) {
      rawList = json.orders;
    }

    if (rawList.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_ORDERS_CACHE_KEY, JSON.stringify([]));
      }
      return { orders: [], isLive: true };
    }

    const parsedOrders: Order[] = rawList.map((item: any, index: number) => ({
      id: `order-${index + 1}-${item.Timestamp || Date.now()}`,
      timestamp: item['Timestamp'] || item['timestamp'] || item['Waktu'] || new Date().toLocaleString('id-ID'),
      name: item['Nama Klien'] || item['nama'] || item['name'] || item['Nama'] || 'Klien',
      phone: String(item['Nomor WhatsApp'] || item['whatsapp'] || item['phone'] || item['Telepon'] || '-'),
      email: item['Email'] || item['email'] || '-',
      service: item['Jenis Layanan'] || item['layanan'] || item['service'] || 'Cipta Lagu',
      genre: item['Genre Musik'] || item['genre'] || '-',
      budget: item['Estimasi Budget'] || item['budget'] || '-',
      message: item['Deskripsi Proyek'] || item['deskripsi'] || item['message'] || item['pesan'] || '-',
      status: item['Status Pesanan'] || item['status'] || 'Baru Masuk'
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_CACHE_KEY, JSON.stringify(parsedOrders));
    }

    return { orders: parsedOrders, isLive: true };
  } catch (err: any) {
    console.warn('Gagal memuat pesanan dari Apps Script:', err.message);
    const cached = getCachedOrders();
    return {
      orders: cached,
      isLive: false,
      error: err.message
    };
  }
}

export function getCachedOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_CACHE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Filter out old dummy sample orders if any lingered in localStorage
    return list.filter(
      (o) =>
        o &&
        typeof o === 'object' &&
        o.id !== 'ord-1' &&
        o.id !== 'ord-2' &&
        !String(o.name || '').includes('Ahmad Fauzi') &&
        !String(o.name || '').includes('Siti Nurhaliza Putri')
    );
  } catch {
    return [];
  }
}

export function saveCachedOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_ORDERS_CACHE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('dzikron_orders_updated'));
}

export async function deleteOrderFromLocalAndSheet(order: Order): Promise<{ success: boolean; message?: string }> {
  // 1. Update local cache
  const currentOrders = getCachedOrders();
  const updatedOrders = currentOrders.filter((o) => o.id !== order.id && o.timestamp !== order.timestamp);
  saveCachedOrders(updatedOrders);

  // 2. Attempt delete on Google Apps Script if endpoint exists
  const endpoint = getStoredAppsScriptUrl();
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'delete_order',
          id: order.id,
          name: order.name,
          timestamp: order.timestamp
        })
      });
    } catch (e) {
      console.warn('Gagal menghapus pesanan di Apps Script:', e);
    }
  }

  return { success: true, message: 'Pesanan berhasil dihapus dari daftar dan Google Spreadsheet.' };
}

export async function clearAllOrdersFromLocal(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_ORDERS_CACHE_KEY);
    window.dispatchEvent(new Event('dzikron_orders_updated'));
  }
  const endpoint = getStoredAppsScriptUrl();
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'clear_all_orders'
        })
      });
    } catch (e) {
      console.warn('Gagal membersihkan pesanan di Apps Script:', e);
    }
  }
}

// Helper to detect if a cell value contains song lyrics
export function isLikelyLyrics(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  const str = val.trim();
  if (str.length > 35 && (str.includes('\n') || str.includes(' '))) return true;
  if (/^(intro|verse|\(verse|\[verse|###|chorus|\(chorus|\[chorus|reff|\(reff|\[reff|bridge|outro|coda)/i.test(str)) return true;
  return false;
}

// Helper to detect if a cell value is a Google Sheets ISO date/time string
export function isLikelyDateOrTime(val: any): boolean {
  if (!val || typeof val !== 'string') return false;
  return val.includes('1899-12-') || (val.includes('T') && val.endsWith('Z'));
}

// Helper to clean markdown headers and extra spaces from lyrics
export function cleanLyricsText(raw: any): string {
  if (!raw) return '';
  let str = String(raw).trim();
  // Clean markdown "### Verse" -> clean standard verse heading
  str = str.replace(/^###\s+/gm, '');
  return str;
}

export async function fetchSongsFromGoogleSheet(
  customUrl?: string
): Promise<{ songs: Song[]; isLive: boolean; error?: string }> {
  const endpoint = customUrl || getStoredAppsScriptUrl();

  if (!endpoint) {
    const cached = getCachedSongs();
    return { songs: cached.length > 0 ? cached : INITIAL_SONGS, isLive: false };
  }

  try {
    // Add cache buster timestamp to ensure fresh spreadsheet updates
    const fetchUrl = endpoint.includes('?')
      ? `${endpoint}&_t=${Date.now()}`
      : `${endpoint}?_t=${Date.now()}`;

    const res = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json = await res.json();

    // Extract song array from multiple possible Apps Script response structures
    let rawSongsArray: any[] = [];
    if (Array.isArray(json)) {
      rawSongsArray = json;
    } else if (json && json.data && Array.isArray(json.data.songs)) {
      rawSongsArray = json.data.songs;
    } else if (json && Array.isArray(json.songs)) {
      rawSongsArray = json.songs;
    } else if (json && Array.isArray(json.data)) {
      rawSongsArray = json.data;
    } else {
      throw new Error('Format data tidak valid. Pastikan Apps Script mengembalikan array lagu.');
    }

    if (rawSongsArray.length === 0) {
      console.info('Spreadsheet kosong atau belum diisi, menggunakan katalog dasar.');
      return { songs: INITIAL_SONGS, isLive: true };
    }

    const parsedSongs: Song[] = rawSongsArray.map((item: any, index: number) => {
      // Handle both Indonesian & English key variations from Spreadsheet
      const title =
        item['Judul Lagu'] || item['judul'] || item['title'] || item['Judul'] || `Lagu #${index + 1}`;
      const singer =
        item['Penyanyi'] || item['singer'] || item['Penyanyi/Artis'] || item['Artis'] || 'Muhammad Dzikron';
      const genre = item['Genre'] || item['genre'] || 'Pop Indie';
      const year = item['Tahun'] || item['year'] || new Date().getFullYear();
      const rawCover =
        item['Cover'] || item['cover'] || item['Cover URL'] || item['Link Cover'] || item['Foto'] || '';
      const driveId =
        item['Link Google Drive'] ||
        item['Link Drive'] ||
        item['Google Drive'] ||
        item['Google Drive File ID'] ||
        item['driveId'] ||
        item['Drive ID'] ||
        item['fileId'] ||
        item['drive_id'] ||
        item['Link Audio'] ||
        item['Audio URL'] ||
        item['Link Lagu'] ||
        item['Link MP3'] ||
        item['Audio'] ||
        item['URL'] ||
        '';

      // 1. Smart Lyrics Detection (handles column shifts where lyrics may land in 'Urutan' or 'Status' or '')
      let rawLyrics = '';
      if (isLikelyLyrics(item['Urutan'])) {
        rawLyrics = item['Urutan'];
      } else if (isLikelyLyrics(item['Status'])) {
        rawLyrics = item['Status'];
      } else if (isLikelyLyrics(item['Lirik'])) {
        rawLyrics = item['Lirik'];
      } else if (isLikelyLyrics(item[''])) {
        rawLyrics = item[''];
      } else if (item['Lirik'] && !isLikelyDateOrTime(item['Lirik'])) {
        rawLyrics = item['Lirik'];
      } else if (item['lyrics'] || item['Lirik Lagu']) {
        rawLyrics = item['lyrics'] || item['Lirik Lagu'];
      }

      // Match with INITIAL_SONGS by title if available for lyrics/duration fallbacks
      const matchedInitial = INITIAL_SONGS.find(
        (s) => s.title.toLowerCase().trim() === String(title).toLowerCase().trim()
      );

      // If lyrics still empty, match with INITIAL_SONGS by title if available
      if (!rawLyrics || rawLyrics.length < 10) {
        if (matchedInitial && matchedInitial.lyrics) {
          rawLyrics = matchedInitial.lyrics;
        }
      }

      const lyrics = cleanLyricsText(rawLyrics);

      // 2. Smart Duration Detection (handles case where Google Sheets duration shifted to 'Lirik' or 'Durasi')
      let rawDuration = item['Durasi'] || item['duration'] || item['Durasi Lagu'] || '';
      if (isLikelyDateOrTime(item['Lirik'])) {
        rawDuration = item['Lirik'];
      }
      let duration = formatSongDuration(rawDuration);
      if (
        duration === '52:48' ||
        duration.startsWith('52:') ||
        duration.startsWith('53:') ||
        duration.startsWith('51:') ||
        parseInt(duration.split(':')[0], 10) >= 20
      ) {
        if (matchedInitial && matchedInitial.duration) {
          duration = matchedInitial.duration;
        }
      }

      // 3. Strict Status Sanitization (status must NEVER contain lyrics, defaults to 'Publish')
      let status = 'Publish';
      const rawStatusStr = String(item['Status'] || '').trim().toLowerCase();
      if (!isLikelyLyrics(item['Status'])) {
        if (rawStatusStr === 'draft' || rawStatusStr === 'hidden') {
          status = 'Draft';
        }
      }

      // 4. Smart Order Detection
      let order = index + 1;
      if (item['Urutan'] && !isLikelyLyrics(item['Urutan']) && !isNaN(Number(item['Urutan']))) {
        order = Number(item['Urutan']);
      } else if (item[''] && !isNaN(Number(item['']))) {
        order = Number(item['']);
      } else if (item['No'] && !isNaN(Number(item['No']))) {
        order = Number(item['No']);
      }

      const rawYoutube =
        item['Link YouTube'] ||
        item['Link Youtube'] ||
        item['YouTube'] ||
        item['Youtube'] ||
        item['Video YouTube'] ||
        item['Video Youtube'] ||
        item['Link Video'] ||
        item['Video'] ||
        item['youtubeUrl'] ||
        item['youtube'] ||
        '';

      // Construct working streaming URL
      const audioStream = driveId
        ? getGoogleDriveAudioUrl(driveId)
        : (item['audioUrl'] || (INITIAL_SONGS[index % INITIAL_SONGS.length]?.audioUrl || ''));
      const coverImage = rawCover
        ? getGoogleDriveImageUrl(rawCover)
        : (INITIAL_SONGS[index % INITIAL_SONGS.length]?.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80');

      return {
        id: `gsheet-${index + 1}-${driveId ? driveId.substring(0, 15) : index}`,
        no: Number(item['No'] || index + 1),
        title: String(title).trim(),
        singer: String(singer).trim(),
        genre: String(genre).trim(),
        year: year,
        cover: coverImage,
        driveId: String(driveId).trim(),
        duration: duration,
        lyrics: lyrics,
        status: status,
        order: order,
        audioUrl: audioStream,
        youtubeUrl: String(rawYoutube).trim()
      };
    }).filter((s) => s.status !== 'Draft');

    // Urutan lagu: yang paling terbaru muncul di atas (order / no tertinggi lebih dulu)
    parsedSongs.sort((a, b) => {
      if (b.order !== a.order) return b.order - a.order;
      if (b.no !== a.no) return b.no - a.no;
      return 0;
    });

    if (typeof window !== 'undefined' && parsedSongs.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(parsedSongs));
    }

    return { songs: parsedSongs.length > 0 ? parsedSongs : INITIAL_SONGS, isLive: true };
  } catch (err: any) {
    console.warn('Gagal mengambil playlist dari Google Apps Script:', err.message);
    const cached = getCachedSongs();
    return {
      songs: cached.length > 0 ? cached : INITIAL_SONGS,
      isLive: false,
      error: `Gagal memuat Apps Script: ${err.message}. Menggunakan katalog cadangan.`
    };
  }
}

export async function submitContactOrder(orderData: {
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  genre?: string;
  budget?: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    const payload = {
      action: 'order',
      name: orderData.name,
      whatsapp: orderData.phone,
      email: orderData.email || '',
      service: orderData.serviceType,
      genre: orderData.genre || '-',
      budget: orderData.budget || '-',
      message: orderData.message
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors', // standard for Google Apps Script post redirects
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: 'Pesanan kolaborasi berhasil dikirim dan tersimpan ke Google Spreadsheet!'
    };
  } catch (err: any) {
    console.error('Error submitting order to Apps Script:', err);
    return {
      success: false,
      message: `Gagal mengirim: ${err.message}`
    };
  }
}

function getCachedSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return [];
    const list: Song[] = JSON.parse(raw);
    // Purge cache if it contains old dummy songs
    const hasDummy = list.some(
      (s) =>
        s.title === 'Cinta Dalam Doa' ||
        s.title === 'Melodi Sunyi' ||
        s.title === 'Langkah Kemenangan' ||
        s.title === 'Cahaya Ibu' ||
        s.title === 'Harmoni Nusantara' ||
        s.id === 'song-1' ||
        s.id === 'song-2'
    );
    if (hasDummy) {
      localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
      return [];
    }
    return list.sort((a, b) => (b.order - a.order) || (b.no - a.no));
  } catch {
    return [];
  }
}

export async function saveSongToGoogleSheet(song: Song): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    const payload = {
      action: 'save_song',
      no: song.no,
      title: song.title,
      singer: song.singer,
      genre: song.genre,
      year: song.year,
      driveId: song.driveId,
      cover: song.cover,
      youtubeUrl: song.youtubeUrl || '',
      youtube: song.youtubeUrl || '',
      'Link YouTube': song.youtubeUrl || '',
      duration: song.duration,
      lyrics: song.lyrics,
      status: song.status,
      order: song.order
    };

    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Lagu "${song.title}" berhasil dikirim dan tersimpan di Google Spreadsheet!`
    };
  } catch (err: any) {
    console.error('Error saving song to Apps Script:', err);
    return { success: false, message: `Gagal mengirim ke Spreadsheet: ${err.message}` };
  }
}

export async function deleteSongFromGoogleSheet(title: string): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_song', title })
    });

    return { success: true, message: `Lagu "${title}" dihapus dari Google Spreadsheet!` };
  } catch (err: any) {
    console.error('Error deleting song from Apps Script:', err);
    return { success: false, message: `Gagal menghapus dari Spreadsheet: ${err.message}` };
  }
}

export async function syncAllSongsToGoogleSheet(songs: Song[]): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_all',
        songs: songs.map((s, idx) => ({
          no: s.no || idx + 1,
          title: s.title,
          singer: s.singer,
          genre: s.genre,
          year: s.year,
          driveId: s.driveId,
          cover: s.cover,
          youtubeUrl: s.youtubeUrl || '',
          youtube: s.youtubeUrl || '',
          'Link YouTube': s.youtubeUrl || '',
          duration: s.duration,
          lyrics: s.lyrics,
          status: s.status,
          order: s.order || idx + 1
        }))
      })
    });

    return {
      success: true,
      message: `Semua (${songs.length}) lagu berhasil disinkronkan ke Google Spreadsheet!`
    };
  } catch (err: any) {
    console.error('Error syncing all songs to Apps Script:', err);
    return { success: false, message: `Gagal menyinkronkan: ${err.message}` };
  }
}

// ==========================================
// 4. UNDUHAN / AKSES UNDUHAN TERBUKA SPREADSHEET SYNC
// ==========================================

export async function fetchDownloadsFromGoogleSheet(
  customUrl?: string
): Promise<{ downloads: DownloadItem[]; isLive: boolean; error?: string; needsScriptUpdate?: boolean }> {
  const endpoint = customUrl || getStoredAppsScriptUrl();
  const cached = getDownloadItems();

  if (!endpoint) {
    return { downloads: cached, isLive: false };
  }

  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const fetchUrl = `${endpoint}${separator}type=downloads&_t=${Date.now()}`;
    const res = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    let rawList: any[] = [];
    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && json.data && Array.isArray(json.data.downloads)) {
      rawList = json.data.downloads;
    } else if (json && Array.isArray(json.downloads)) {
      rawList = json.downloads;
    } else if (json && Array.isArray(json.data)) {
      rawList = json.data;
    }

    const isSongData =
      rawList.length > 0 &&
      Boolean(rawList[0]['Judul Lagu'] || rawList[0]['Penyanyi'] || rawList[0]['Genre']);
    const hasDownloadFields = rawList.some((item: any) =>
      Boolean(item['Nama File'] || item['nama_file'] || item['Link Download'] || item['Format'] || item['format'])
    );

    // Jika Apps Script lama mengembalikan sheet Lagu karena belum mengenali type=downloads
    if (isSongData || !hasDownloadFields) {
      console.warn('Apps Script belum mendukung Tab Unduhan (mengembalikan katalog lagu).');
      return {
        downloads: cached,
        isLive: false,
        needsScriptUpdate: true,
        error: 'Kode Google Apps Script di Spreadsheet Anda belum memiliki branch Tab Unduhan. Silakan perbarui kode script.'
      };
    }

    const parsed: DownloadItem[] = rawList.map((item: any, idx: number) => {
      const fileName =
        item['Nama File'] ||
        item['nama_file'] ||
        item['fileName'] ||
        item['Judul'] ||
        item['File'] ||
        item['Nama'] ||
        `File Unduhan #${idx + 1}`;
      const category = item['Kategori'] || item['category'] || 'Master Audio HQ';
      const format = item['Format'] || item['format'] || 'File';
      const fileSize = item['Ukuran'] || item['fileSize'] || item['size'] || '';
      const fileUrl =
        item['Link Download'] ||
        item['Link Google Drive'] ||
        item['Link'] ||
        item['URL'] ||
        item['fileUrl'] ||
        item['Link File'] ||
        '';
      const description =
        item['Deskripsi'] || item['description'] || item['Keterangan'] || '';
      const rawCount = item['Jumlah Unduhan'] || item['Unduhan'] || item['downloadCount'] || 0;
      const downloadCount = typeof rawCount === 'number' ? rawCount : parseInt(String(rawCount), 10) || 0;
      const rawStatus = String(item['Status'] || item['status'] || 'active').trim().toLowerCase();
      const status: 'active' | 'hidden' =
        rawStatus === 'hidden' || rawStatus === 'draft' || rawStatus === 'disembunyikan'
          ? 'hidden'
          : 'active';
      const id =
        item['ID'] || item['id'] || `dl-sheet-${idx + 1}-${encodeURIComponent(fileName).slice(0, 10)}`;

      return {
        id,
        fileName,
        category,
        format,
        fileSize: fileSize || undefined,
        fileUrl,
        description,
        downloadCount,
        status,
        createdAt: item['createdAt'] || new Date().toISOString().split('T')[0]
      };
    });

    if (parsed.length > 0) {
      saveDownloadItems(parsed);
      return { downloads: parsed, isLive: true };
    }

    return { downloads: cached, isLive: true };
  } catch (err: any) {
    console.warn('Gagal memuat unduhan dari Apps Script:', err.message);
    return { downloads: cached, isLive: false, error: err.message };
  }
}

export interface SaveDownloadResult {
  success: boolean;
  message: string;
  needsNewDeploymentVersion?: boolean;
  spreadsheetSynced?: boolean;
}

export async function checkSpreadsheetDownloadsStatus(): Promise<{
  ready: boolean;
  needsNewDeploymentVersion?: boolean;
  message: string;
}> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { ready: false, message: 'URL Google Apps Script belum diisi di Pengaturan.' };
  }

  try {
    const res = await fetch('/api/downloads/check-spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointUrl: endpoint })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.warn('Check spreadsheet downloads error:', err);
  }
  return { ready: false, message: 'Tidak dapat menghubungi server pengecekan.' };
}

export async function saveDownloadToGoogleSheet(
  item: DownloadItem,
  oldFileName?: string,
  customUrl?: string
): Promise<SaveDownloadResult> {
  const endpoint = customUrl || getStoredAppsScriptUrl();

  if (!endpoint) {
    return { success: true, message: 'Tersimpan secara lokal di website.' };
  }

  // 1. First attempt through server proxy which inspects exact Google Apps Script JSON response
  try {
    const proxyRes = await fetch('/api/downloads/sync-spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        action: 'save_download',
        item,
        oldFileName
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return {
        success: true,
        message: data.message,
        needsNewDeploymentVersion: Boolean(data.needsNewDeploymentVersion),
        spreadsheetSynced: Boolean(data.spreadsheetSynced)
      };
    }
  } catch (proxyErr) {
    console.warn('Server proxy sync fallback to browser direct fetch:', proxyErr);
  }

  // 2. Direct browser fallback
  try {
    const payload = {
      action: 'save_download',
      id: item.id,
      fileName: item.fileName,
      oldFileName: oldFileName || undefined,
      category: item.category,
      format: item.format,
      fileSize: item.fileSize || '-',
      fileUrl: item.fileUrl,
      description: item.description,
      downloadCount: item.downloadCount || 0,
      status: item.status === 'active' ? 'Publish' : 'Hidden'
    };

    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `File "${item.fileName}" tersimpan di website & dikirim ke Google Spreadsheet!`
    };
  } catch (err: any) {
    console.error('Error saving download to Apps Script:', err);
    return {
      success: false,
      message: `Tersimpan secara lokal, namun gagal sinkron ke Spreadsheet: ${err.message}`
    };
  }
}

export async function saveBannerConfigToGoogleSheet(
  config: any
): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) return { success: true, message: 'Tersimpan secara lokal di browser.' };

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'save_download_banner',
        banner: config
      })
    });
    return { success: true, message: 'Pengaturan teks unduhan berhasil disinkronkan ke Spreadsheet!' };
  } catch (err: any) {
    return { success: false, message: `Gagal sinkron teks: ${err.message}` };
  }
}

export async function deleteDownloadFromGoogleSheet(
  fileName: string,
  id?: string
): Promise<{ success: boolean; message: string }> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: true, message: 'Dihapus dari penyimpanan website.' };
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'delete_download',
        fileName,
        title: fileName,
        id
      })
    });

    return {
      success: true,
      message: `File "${fileName}" dihapus dari Google Spreadsheet (Tab "Unduhan")!`
    };
  } catch (err: any) {
    console.error('Error deleting download from Apps Script:', err);
    return {
      success: false,
      message: `Dihapus lokal, namun gagal hapus di Spreadsheet: ${err.message}`
    };
  }
}

export async function syncAllDownloadsToGoogleSheet(
  downloads: DownloadItem[]
): Promise<SaveDownloadResult> {
  const endpoint = getStoredAppsScriptUrl();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  // 1. Try server proxy for exact deployment verification
  try {
    const proxyRes = await fetch('/api/downloads/sync-spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        action: 'sync_all',
        downloads
      })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return {
        success: data.success,
        message: data.message,
        needsNewDeploymentVersion: Boolean(data.needsNewDeploymentVersion),
        spreadsheetSynced: Boolean(data.spreadsheetSynced)
      };
    }
  } catch (proxyErr) {
    console.warn('Server proxy sync fallback:', proxyErr);
  }

  // 2. Direct fallback
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'sync_downloads',
        downloads: downloads.map((d, idx) => ({
          no: idx + 1,
          id: d.id,
          fileName: d.fileName,
          category: d.category,
          format: d.format,
          fileSize: d.fileSize || '-',
          fileUrl: d.fileUrl,
          description: d.description,
          downloadCount: d.downloadCount || 0,
          status: d.status === 'active' ? 'Publish' : 'Hidden'
        }))
      })
    });

    return {
      success: true,
      message: `Semua (${downloads.length}) file unduhan berhasil dikirim ke Google Spreadsheet (Tab "Unduhan")!`
    };
  } catch (err: any) {
    console.error('Error syncing all downloads to Apps Script:', err);
    return { success: false, message: `Gagal menyinkronkan unduhan: ${err.message}` };
  }
}

export const APPS_SCRIPT_CODE_SAMPLE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE - MUHAMMAD DZIKRON
 * Menampung 4 Tab:
 * 1. Tab "Lagu"     : Katalog Lagu, Google Drive ID, Link YouTube, Durasi, Cover, Lirik
 * 2. Tab "Profil"   : Identitas, Foto Profil, Bio, dan Statistik Komposer
 * 3. Tab "Pesanan"  : Pesanan Kolaborasi / Kontak Klien Masuk
 * 4. Tab "Unduhan"  : Isi & File Akses Unduhan Terbuka (Google Drive, Audio, Partitur)
 * =========================================================================
 */

// Jalankan fungsi ini sekali di Apps Script Editor jika ingin membuat semua Tab & Kolom secara instan!
function inisialisasiTabProfilDanLagu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tab Lagu
  var sheetLagu = getOrCreateSheet(ss, 'Lagu', [
    'No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun',
    'Link Google Drive', 'Cover URL', 'Link YouTube', 'Durasi', 'Lirik', 'Status', 'Urutan'
  ]);
  
  // 2. Tab Profil (Format Baris & Kolom Lengkap)
  var sheetProfil = getOrCreateSheet(ss, 'Profil', ['Field', 'Value']);
  if (sheetProfil.getLastRow() <= 1) {
    sheetProfil.clearContents();
    sheetProfil.appendRow(['Field', 'Value']);
    sheetProfil.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#e0f2fe');
    var defaultProfile = [
      ['Nama', 'Muhammad Dzikron'],
      ['Tagline', 'Songwriter & Composer'],
      ['Headline', 'Menenun Jiwa ke dalam Harmoni & Nada'],
      ['Foto', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'],
      ['Biografi', 'Komposer dan penulis lagu berdedikasi menciptakan karya musik pop, religi, dan sinematik dengan kedalaman rasa.'],
      ['Pengalaman', 'Telah menciptakan lebih dari 80+ karya lagu, jingle korporat, dan aransemen orkestrasi untuk berbagai musisi dan label.'],
      ['Lokasi', 'Indonesia'],
      ['Tahun Aktif', 'Aktif Sejak 2016'],
      ['Status Kolaborasi', 'Terbuka untuk Kolaborasi'],
      ['Total Lagu', 85],
      ['Album & EP', 12],
      ['Total Pendengar', 1500000],
      ['Genre Musik', 8]
    ];
    for (var i = 0; i < defaultProfile.length; i++) {
      sheetProfil.appendRow(defaultProfile[i]);
    }
  }
  
  // 3. Tab Pesanan
  var sheetPesanan = getOrCreateSheet(ss, 'Pesanan', [
    'Timestamp', 'Nama Klien', 'Nomor WhatsApp', 'Email',
    'Jenis Layanan', 'Genre Musik', 'Estimasi Budget', 'Deskripsi Proyek', 'Status Pesanan'
  ]);
  
  // 4. Tab Unduhan (Akses Unduhan Terbuka)
  var sheetUnduhan = getOrCreateSheet(ss, 'Unduhan', [
    'No', 'Nama File', 'Kategori', 'Format', 'Ukuran', 'Link Download', 'Deskripsi', 'Jumlah Unduhan', 'Status'
  ]);
  if (sheetUnduhan.getLastRow() <= 1) {
    sheetUnduhan.clearContents();
    sheetUnduhan.appendRow(['No', 'Nama File', 'Kategori', 'Format', 'Ukuran', 'Link Download', 'Deskripsi', 'Jumlah Unduhan', 'Status']);
    sheetUnduhan.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#ecfdf5');
    var defaultDownloads = [
      [1, 'The Miracle of Rain - Master Audio HQ (24-bit WAV & MP3 320kbps)', 'Master Audio HQ', 'WAV + MP3', '48.5 MB', 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p/view?usp=sharing', 'File audio kualitas master studio tertinggi untuk audiophile & pemutaran acara.', 382, 'Publish'],
      [2, 'Buku Notasi & Partitur Chord - Koleksi Karya Muhammad Dzikron (Vol. 1)', 'Partitur & Chord PDF', 'PDF Digital Book', '12.8 MB', 'https://drive.google.com/file/d/1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q/view?usp=sharing', 'Partitur lengkap, chord progresi, melodi vokal untuk musisi & pengiring musik.', 247, 'Publish'],
      [3, 'Lirik & Panduan Makna Lagu - Anthology Muhammad Dzikron', 'Lirik & Panduan', 'PDF Booklet', '5.2 MB', 'https://drive.google.com/file/d/1C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r/view?usp=sharing', 'Dokumen lirik resmi lengkap dengan anotasi pesan moral dan makna lagu.', 195, 'Publish'],
      [4, 'Multi-Track Stems & Backing Track Instrumentalia (Pop Religi & Indie)', 'Backing Track / Stems', 'ZIP Archive', '112.0 MB', 'https://drive.google.com/file/d/1D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s/view?usp=sharing', 'Audio backing track tanpa vokal untuk penampilan live, ibadah, festival.', 164, 'Publish']
    ];
    for (var d = 0; d < defaultDownloads.length; d++) {
      sheetUnduhan.appendRow(defaultDownloads[d]);
    }
  }
  
  Logger.log('Semua tab (Lagu, Profil, Pesanan, Unduhan) berhasil diinisialisasi!');
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var type = (e && e.parameter && e.parameter.type) ? e.parameter.type.toLowerCase() : 'all';
    
    // 1. Ambil Profil Komposer
    if (type === 'profile' || type === 'profil') {
      var sheet = ss.getSheetByName('Profil');
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'empty' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = sheet.getDataRange().getValues();
      if (data.length === 0) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'empty' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var profile = {};
      
      // Deteksi Format Horizontal (Baris 1 = Kolom Header, Baris 2 = Nilai)
      if (data.length >= 2 && String(data[0][0]).toLowerCase().indexOf('field') === -1) {
        var headers = data[0].map(function(h) { return String(h).trim(); });
        var rowVals = data[1];
        for (var h = 0; h < headers.length; h++) {
          var hKey = headers[h].toLowerCase();
          var val = rowVals[h];
          if (hKey.indexOf('nama') >= 0) profile.name = val;
          else if (hKey.indexOf('tagline') >= 0) profile.tagline = val;
          else if (hKey.indexOf('headline') >= 0) profile.headline = val;
          else if (hKey.indexOf('foto') >= 0 || hKey.indexOf('photo') >= 0) profile.photoUrl = val;
          else if (hKey.indexOf('bio') >= 0) profile.bio = val;
          else if (hKey.indexOf('pengalaman') >= 0 || hKey.indexOf('experience') >= 0) profile.experience = val;
          else if (hKey.indexOf('lokasi') >= 0 || hKey.indexOf('location') >= 0) profile.location = val;
          else if (hKey.indexOf('tahun') >= 0 || hKey.indexOf('aktif') >= 0) profile.activeSince = val;
          else if (hKey.indexOf('kolaborasi') >= 0 || hKey.indexOf('status') >= 0) profile.collaborationStatus = val;
          else if (hKey.indexOf('lagu') >= 0 || hKey.indexOf('songs') >= 0) profile.statSongs = val;
          else if (hKey.indexOf('album') >= 0) profile.statAlbums = val;
          else if (hKey.indexOf('pendengar') >= 0 || hKey.indexOf('listeners') >= 0) profile.statListeners = val;
          else if (hKey.indexOf('genre') >= 0) profile.statGenres = val;
        }
      } else {
        // Format Vertikal (Kolom A = Field, Kolom B = Value)
        for (var p = 0; p < data.length; p++) {
          var key = String(data[p][0] || '').trim();
          var val = data[p][1];
          if (key) profile[key] = val;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', profile: profile }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Ambil Pesanan Masuk
    if (type === 'orders' || type === 'pesanan') {
      var sheet = ss.getSheetByName('Pesanan');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      var headers = data[0].map(function(h) { return String(h).trim(); });
      var orders = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j];
        }
        orders.push(obj);
      }
      return ContentService.createTextOutput(JSON.stringify(orders)).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Ambil Unduhan (Akses Unduhan Terbuka)
    if (type === 'downloads' || type === 'unduhan' || type === 'download') {
      var sheet = ss.getSheetByName('Unduhan') || ss.getSheetByName('Download') || ss.getSheetByName('Downloads');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      var data = sheet.getDataRange().getValues();
      if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      var headers = data[0].map(function(h) { return String(h).trim(); });
      var downloads = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j];
        }
        downloads.push(obj);
      }
      return ContentService.createTextOutput(JSON.stringify(downloads)).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Default: Ambil Seluruh Data Katalog Lagu
    var sheet = ss.getSheetByName('Lagu') || ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0].map(function(h) { return String(h).trim(); });
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = (e && e.postData) ? e.postData.contents : '';
    var body = {};
    if (contents) {
      try { body = JSON.parse(contents); } catch(err) { body = e.parameter || {}; }
    } else if (e && e.parameter) {
      body = e.parameter;
    }
    
    var action = body.action || 'order';
    
    // 1. Simpan / Update Profil Komposer
    if (action === 'save_profile' || action === 'update_profile' || action === 'simpan_profil') {
      var prof = body.profile || body;
      var sheet = getOrCreateSheet(ss, 'Profil', ['Field', 'Value']);
      sheet.clearContents();
      sheet.appendRow(['Field', 'Value']);
      sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#e0f2fe');
      
      var profileEntries = [
        ['Nama', prof.name || 'Muhammad Dzikron'],
        ['Tagline', prof.tagline || 'Songwriter & Composer'],
        ['Headline', prof.headline || 'Menenun Jiwa ke dalam Harmoni & Nada'],
        ['Foto', prof.photoUrl || ''],
        ['Biografi', prof.bio || ''],
        ['Pengalaman', prof.experience || ''],
        ['Lokasi', prof.location || 'Indonesia'],
        ['Tahun Aktif', prof.activeSince || 'Aktif Sejak 2016'],
        ['Status Kolaborasi', prof.collaborationStatus || 'Terbuka untuk Kolaborasi'],
        ['Total Lagu', prof.statSongs || 85],
        ['Album & EP', prof.statAlbums || 12],
        ['Total Pendengar', prof.statListeners || 1500000],
        ['Genre Musik', prof.statGenres || 8]
      ];
      
      for (var k = 0; k < profileEntries.length; k++) {
        sheet.appendRow(profileEntries[k]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Profil Komposer tersimpan di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Simpan / Update Lagu
    if (action === 'save_song' || action === 'add_song' || action === 'tambah_lagu') {
      var sheet = getOrCreateSheet(ss, 'Lagu', [
        'No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun',
        'Link Google Drive', 'Cover URL', 'Link YouTube', 'Durasi', 'Lirik', 'Status', 'Urutan'
      ]);
      
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      var title = String(body.title || body.judul || '').trim();
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim().toLowerCase() === title.toLowerCase()) {
          rowIndex = i + 1;
          break;
        }
      }
      
      var rowData = [
        body.no || (rowIndex > 0 ? data[rowIndex-1][0] : data.length),
        title,
        body.singer || body.penyanyi || 'Muhammad Dzikron',
        body.genre || 'Pop',
        body.year || body.tahun || new Date().getFullYear(),
        body.driveId || body.link_drive || '',
        body.cover || '',
        body.youtubeUrl || body.youtube || body['Link YouTube'] || '',
        body.duration || body.durasi || '03:30',
        body.lyrics || body.lirik || '',
        body.status || 'Publish',
        body.order || (rowIndex > 0 ? data[rowIndex-1][11] : data.length)
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Lagu tersimpan di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Sinkronkan Seluruh Katalog Lagu Sekaligus
    if (action === 'sync_all' && Array.isArray(body.songs)) {
      var sheet = getOrCreateSheet(ss, 'Lagu', [
        'No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun',
        'Link Google Drive', 'Cover URL', 'Link YouTube', 'Durasi', 'Lirik', 'Status', 'Urutan'
      ]);
      sheet.clearContents();
      sheet.appendRow(['No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun', 'Link Google Drive', 'Cover URL', 'Link YouTube', 'Durasi', 'Lirik', 'Status', 'Urutan']);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#f3f4f6');
      
      for (var s = 0; s < body.songs.length; s++) {
        var song = body.songs[s];
        sheet.appendRow([
          song.no || s + 1,
          song.title || '',
          song.singer || 'Muhammad Dzikron',
          song.genre || 'Pop',
          song.year || new Date().getFullYear(),
          song.driveId || '',
          song.cover || '',
          song.youtubeUrl || song.youtube || '',
          song.duration || '03:30',
          song.lyrics || '',
          song.status || 'Publish',
          song.order || s + 1
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Semua lagu berhasil disinkronkan' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 4. Hapus Lagu
    if (action === 'delete_song') {
      var sheet = ss.getSheetByName('Lagu');
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        var titleToDelete = String(body.title || '').trim().toLowerCase();
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][1]).trim().toLowerCase() === titleToDelete) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 5. Menerima Pesanan Masuk
    if (action === 'order' || action === 'pesanan') {
      var sheet = getOrCreateSheet(ss, 'Pesanan', [
        'Timestamp', 'Nama Klien', 'Nomor WhatsApp', 'Email',
        'Jenis Layanan', 'Genre Musik', 'Estimasi Budget', 'Deskripsi Proyek', 'Status Pesanan'
      ]);
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
      sheet.appendRow([
        timestamp,
        body.name || body.nama || '-',
        body.whatsapp || body.phone || '-',
        body.email || '-',
        body.service || 'Cipta Lagu',
        body.genre || '-',
        body.budget || '-',
        body.message || body.pesan || '-',
        'Baru Masuk'
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. Hapus Satu Pesanan
    if (action === 'delete_order' || action === 'hapus_pesanan') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        var clientName = String(body.name || '').trim().toLowerCase();
        var clientTimestamp = String(body.timestamp || '').trim();
        for (var i = 1; i < data.length; i++) {
          var rowName = String(data[i][1]).trim().toLowerCase();
          var rowTime = String(data[i][0]).trim();
          if ((clientName && rowName === clientName) || (clientTimestamp && rowTime === clientTimestamp)) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Pesanan terhapus' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 7. Hapus Semua Pesanan
    if (action === 'clear_all_orders' || action === 'hapus_semua_pesanan') {
      var sheet = ss.getSheetByName('Pesanan');
      if (sheet) {
        sheet.clearContents();
        sheet.appendRow([
          'Timestamp', 'Nama Klien', 'Nomor WhatsApp', 'Email',
          'Jenis Layanan', 'Genre Musik', 'Estimasi Budget', 'Deskripsi Proyek', 'Status Pesanan'
        ]);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f3f4f6');
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Semua pesanan dibersihkan' })).setMimeType(ContentService.MimeType.JSON);
    }

    // 8. Simpan / Update File Unduhan (Akses Unduhan Terbuka)
    if (action === 'save_download' || action === 'update_download' || action === 'tambah_unduhan' || action === 'save_unduhan') {
      var sheet = getOrCreateSheet(ss, 'Unduhan', [
        'No', 'Nama File', 'Kategori', 'Format', 'Ukuran', 'Link Download', 'Deskripsi', 'Jumlah Unduhan', 'Status'
      ]);
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;
      var fileName = String(body.fileName || body.nama_file || body.title || '').trim();
      var oldFileName = String(body.oldFileName || '').trim();
      for (var i = 1; i < data.length; i++) {
        var rowName = String(data[i][1]).trim().toLowerCase();
        if ((oldFileName && rowName === oldFileName.toLowerCase()) || (fileName && rowName === fileName.toLowerCase())) {
          rowIndex = i + 1;
          break;
        }
      }
      var rowData = [
        body.no || (rowIndex > 0 ? data[rowIndex-1][0] : data.length),
        fileName,
        body.category || body.kategori || 'Master Audio HQ',
        body.format || 'File',
        body.fileSize || body.ukuran || '-',
        body.fileUrl || body.link || '',
        body.description || body.deskripsi || '-',
        body.downloadCount || (rowIndex > 0 ? data[rowIndex-1][7] : 0),
        body.status || 'Publish'
      ];
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'File unduhan tersimpan di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 9. Hapus File Unduhan dari Spreadsheet
    if (action === 'delete_download' || action === 'hapus_unduhan') {
      var sheet = ss.getSheetByName('Unduhan') || ss.getSheetByName('Download') || ss.getSheetByName('Downloads');
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        var targetName = String(body.fileName || body.title || body.oldFileName || '').trim().toLowerCase();
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][1]).trim().toLowerCase() === targetName) {
            sheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'File unduhan terhapus dari Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 10. Sinkronkan Semua File Unduhan Sekaligus
    if ((action === 'sync_downloads' || action === 'sinkron_unduhan') && Array.isArray(body.downloads)) {
      var sheet = getOrCreateSheet(ss, 'Unduhan', [
        'No', 'Nama File', 'Kategori', 'Format', 'Ukuran', 'Link Download', 'Deskripsi', 'Jumlah Unduhan', 'Status'
      ]);
      sheet.clearContents();
      sheet.appendRow(['No', 'Nama File', 'Kategori', 'Format', 'Ukuran', 'Link Download', 'Deskripsi', 'Jumlah Unduhan', 'Status']);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#ecfdf5');
      for (var d = 0; d < body.downloads.length; d++) {
        var dl = body.downloads[d];
        sheet.appendRow([
          dl.no || d + 1,
          dl.fileName || '',
          dl.category || 'Master Audio HQ',
          dl.format || 'File',
          dl.fileSize || '-',
          dl.fileUrl || '',
          dl.description || '-',
          dl.downloadCount || 0,
          dl.status || 'Publish'
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Semua file unduhan tersinkron di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 11. Simpan Pengaturan Teks Unduhan
    if (action === 'save_download_banner' || action === 'update_download_banner') {
      var b = body.banner || body;
      var pSheet = getOrCreateSheet(ss, 'Profil', ['Field', 'Value']);
      var pData = pSheet.getDataRange().getValues();
      var foundRow = -1;
      for (var pi = 1; pi < pData.length; pi++) {
        if (String(pData[pi][0]).trim().toLowerCase() === 'judul halaman unduh') {
          foundRow = pi + 1;
          break;
        }
      }
      if (foundRow > 0) {
        pSheet.getRange(foundRow, 2).setValue(b.pageHeaderTitle || 'Download Area');
      } else {
        pSheet.appendRow(['Judul Halaman Unduh', b.pageHeaderTitle || 'Download Area']);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Pengaturan teks unduhan tersimpan di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, sheetName, defaultHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight('bold').setBackground('#f3f4f6');
    }
  }
  return sheet;
}`;


