import { Song, Order, ComposerProfile } from '../types/song';
import { INITIAL_SONGS, INITIAL_COMPOSER_PROFILE } from '../data/initialData';
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
    return raw ? { ...INITIAL_COMPOSER_PROFILE, ...JSON.parse(raw) } : INITIAL_COMPOSER_PROFILE;
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
    const list: Order[] = JSON.parse(raw);
    // Filter out old dummy sample orders if any lingered in localStorage
    return list.filter(
      (o) =>
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
        item['Judul Lagu'] || item['judul'] || item['title'] || item['Judul'] || 'Lagu Tanpa Judul';
      const singer =
        item['Penyanyi'] || item['singer'] || item['Penyanyi/Artis'] || item['Artis'] || 'Muhammad Dzikron';
      const genre = item['Genre'] || item['genre'] || 'Pop';
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
      const duration = item['Durasi'] || item['duration'] || item['Durasi Lagu'] || '03:30';
      const lyrics = item['Lirik'] || item['lyrics'] || item['Lirik Lagu'] || 'Lirik belum tersedia.';
      const status = item['Status'] || item['status'] || 'Publish';
      const order = Number(item['Urutan'] || item['order'] || item['No'] || index + 1);
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
        : (item['audioUrl'] || INITIAL_SONGS[index % INITIAL_SONGS.length].audioUrl);
      const coverImage = rawCover
        ? getGoogleDriveImageUrl(rawCover)
        : INITIAL_SONGS[index % INITIAL_SONGS.length].cover;

      return {
        id: `gsheet-${index + 1}-${driveId || index}`,
        no: Number(item['No'] || index + 1),
        title: String(title),
        singer: String(singer),
        genre: String(genre),
        year: year,
        cover: coverImage,
        driveId: String(driveId),
        duration: formatSongDuration(duration),
        lyrics: String(lyrics),
        status: String(status),
        order: order,
        audioUrl: audioStream,
        youtubeUrl: String(rawYoutube).trim()
      };
    }).filter((s) => s.status.toLowerCase() !== 'draft' && s.status.toLowerCase() !== 'hidden');

    parsedSongs.sort((a, b) => a.order - b.order);

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
    return raw ? JSON.parse(raw) : [];
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

export const APPS_SCRIPT_CODE_SAMPLE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE - MUHAMMAD DZIKRON
 * Menampung 3 Tab:
 * 1. Tab "Lagu"     : Katalog Lagu, Google Drive ID, Link YouTube, Durasi, Cover, Lirik
 * 2. Tab "Profil"   : Identitas, Foto Profil, Bio, dan Statistik Komposer
 * 3. Tab "Pesanan"  : Pesanan Kolaborasi / Kontak Klien Masuk
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
  
  Logger.log('Semua tab berhasil diinisialisasi!');
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


