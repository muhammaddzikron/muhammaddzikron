import { Song } from '../types/song';
import { INITIAL_SONGS } from '../data/initialData';
import { getGoogleDriveAudioUrl, getGoogleDriveImageUrl } from './googleDrive';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwptAPCvBm9EAp7jGpIFg1vy53hJdrYokwbVZfQDnC8LlsiUTRkkAzZ2MZ-S0EOcdbE/exec';

const LOCAL_STORAGE_APPS_SCRIPT_KEY = 'dzikron_apps_script_url';
const LOCAL_STORAGE_CACHE_KEY = 'dzikron_cached_songs';

export function getStoredAppsScriptUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_APPS_SCRIPT_URL;
  const saved = localStorage.getItem(LOCAL_STORAGE_APPS_SCRIPT_KEY);
  return (saved && saved.trim()) || DEFAULT_APPS_SCRIPT_URL;
}

export function setStoredAppsScriptUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_APPS_SCRIPT_KEY, url.trim());
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
        duration: String(duration),
        lyrics: String(lyrics),
        status: String(status),
        order: order,
        audioUrl: audioStream
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
 * Menampung: Katalog Lagu, Pesanan Kolaborasi, dan Galeri Studio
 * =========================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    
    // 1. Simpan / Update Lagu
    if (action === 'save_song' || action === 'add_song' || action === 'tambah_lagu') {
      var sheet = getOrCreateSheet(ss, 'Lagu', [
        'No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun',
        'Link Google Drive', 'Cover URL', 'Durasi', 'Lirik', 'Status', 'Urutan'
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
        body.duration || body.durasi || '03:30',
        body.lyrics || body.lirik || '',
        body.status || 'Publish',
        body.order || (rowIndex > 0 ? data[rowIndex-1][10] : data.length)
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Lagu tersimpan di Spreadsheet' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Sinkronkan Seluruh Katalog Lagu Sekaligus
    if (action === 'sync_all' && Array.isArray(body.songs)) {
      var sheet = getOrCreateSheet(ss, 'Lagu', [
        'No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun',
        'Link Google Drive', 'Cover URL', 'Durasi', 'Lirik', 'Status', 'Urutan'
      ]);
      sheet.clearContents();
      sheet.appendRow(['No', 'Judul Lagu', 'Penyanyi', 'Genre', 'Tahun', 'Link Google Drive', 'Cover URL', 'Durasi', 'Lirik', 'Status', 'Urutan']);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#f3f4f6');
      
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
          song.duration || '03:30',
          song.lyrics || '',
          song.status || 'Publish',
          song.order || s + 1
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Semua lagu berhasil disinkronkan' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Hapus Lagu
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
    
    // 4. Menerima Pesanan Masuk
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


