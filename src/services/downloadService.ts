import { DownloadItem } from '../types/song';
import { getGoogleDriveDownloadUrl, extractDriveId } from './googleDrive';

export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/muhammaddzikron';
export const INSTAGRAM_USERNAME = '@muhammaddzikron';

const DOWNLOADS_STORAGE_KEY = 'dzikron_download_items_v1';
const IG_FOLLOW_STORAGE_KEY = 'dzikron_ig_followed_v1';

export const INITIAL_DOWNLOAD_ITEMS: DownloadItem[] = [
  {
    id: 'dl-1',
    fileName: 'The Miracle of Rain - Master Audio HQ (24-bit WAV & MP3 320kbps)',
    description: 'File audio kualitas master studio tertinggi untuk kebutuhan audiophile, pemutaran acara, dan referensi produksi musik.',
    fileUrl: 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p/view?usp=sharing',
    fileSize: '48.5 MB',
    category: 'Master Audio HQ',
    format: 'WAV + MP3',
    downloadCount: 382,
    status: 'active',
    createdAt: '2026-09-01'
  },
  {
    id: 'dl-2',
    fileName: 'Buku Notasi & Partitur Chord - Koleksi Karya Muhammad Dzikron (Vol. 1)',
    description: 'Partitur lengkap, chord progresi, melodi vokal, dan panduan dinamika aransemen untuk musisi & pengiring musik.',
    fileUrl: 'https://drive.google.com/file/d/1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q/view?usp=sharing',
    fileSize: '12.8 MB',
    category: 'Partitur & Chord PDF',
    format: 'PDF Digital Book',
    downloadCount: 247,
    status: 'active',
    createdAt: '2026-09-10'
  },
  {
    id: 'dl-3',
    fileName: 'Lirik & Panduan Makna Lagu - Anthology Muhammad Dzikron',
    description: 'Dokumen lirik resmi lengkap dengan anotasi pesan moral, latar belakang penciptaan, dan rujukan bait puitis.',
    fileUrl: 'https://drive.google.com/file/d/1C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r/view?usp=sharing',
    fileSize: '5.2 MB',
    category: 'Lirik & Panduan',
    format: 'PDF Booklet',
    downloadCount: 195,
    status: 'active',
    createdAt: '2026-09-15'
  },
  {
    id: 'dl-4',
    fileName: 'Multi-Track Stems & Backing Track Instrumentalia (Pop Religi & Indie)',
    description: 'Audio backing track tanpa vokal (karaoke / instrumen) untuk penampilan live, ibadah, festival, atau cover.',
    fileUrl: 'https://drive.google.com/file/d/1D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s/view?usp=sharing',
    fileSize: '112.0 MB',
    category: 'Backing Track / Stems',
    format: 'ZIP Archive',
    downloadCount: 164,
    status: 'active',
    createdAt: '2026-10-01'
  }
];

export function getDownloadItems(): DownloadItem[] {
  if (typeof window === 'undefined') return INITIAL_DOWNLOAD_ITEMS;
  try {
    const raw = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(INITIAL_DOWNLOAD_ITEMS));
      return INITIAL_DOWNLOAD_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DOWNLOAD_ITEMS;
  } catch (err) {
    console.warn('Failed to load download items:', err);
    return INITIAL_DOWNLOAD_ITEMS;
  }
}

export function saveDownloadItems(items: DownloadItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('dzikron_downloads_updated'));
  } catch (err) {
    console.error('Failed to save download items:', err);
  }
}

export function addDownloadItem(newItem: Omit<DownloadItem, 'id' | 'downloadCount' | 'createdAt'>): DownloadItem {
  const items = getDownloadItems();
  const item: DownloadItem = {
    ...newItem,
    id: 'dl-' + Date.now(),
    downloadCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [item, ...items];
  saveDownloadItems(updated);
  return item;
}

export function updateDownloadItem(id: string, updates: Partial<DownloadItem>): DownloadItem[] {
  const items = getDownloadItems();
  const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveDownloadItems(updated);
  return updated;
}

export function deleteDownloadItem(id: string): DownloadItem[] {
  const items = getDownloadItems();
  const updated = items.filter((item) => item.id !== id);
  saveDownloadItems(updated);
  return updated;
}

export function incrementDownloadCount(id: string): void {
  const items = getDownloadItems();
  const updated = items.map((item) =>
    item.id === id ? { ...item, downloadCount: (item.downloadCount || 0) + 1 } : item
  );
  saveDownloadItems(updated);
}

export function resetDownloadItemsToDefault(): DownloadItem[] {
  saveDownloadItems(INITIAL_DOWNLOAD_ITEMS);
  return INITIAL_DOWNLOAD_ITEMS;
}

/**
 * Check if the user has followed Instagram @muhammaddzikron
 */
export function getInstagramFollowStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(IG_FOLLOW_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Update Instagram follow status
 */
export function setInstagramFollowStatus(followed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (followed) {
      localStorage.setItem(IG_FOLLOW_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(IG_FOLLOW_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('dzikron_ig_follow_updated'));
  } catch (err) {
    console.warn('Failed to update Instagram follow state:', err);
  }
}

const BANNER_CONFIG_STORAGE_KEY = 'dzikron_download_banner_config_v1';

export interface DownloadBannerConfig {
  badgeTitle: string; // e.g. "Akses Unduhan Terbuka"
  verifiedBadge: string; // e.g. "Terverifikasi"
  thankYouTitle: string; // e.g. "Terima kasih telah mengikuti Instagram @muhammaddzikron"
  description: string; // e.g. "Semua tombol download file di bawah ini telah aktif dan dapat langsung Anda unduh secara gratis."
  instagramUsername: string; // e.g. "@muhammaddzikron"
  instagramUrl: string; // e.g. "https://www.instagram.com/muhammaddzikron"
  pageHeaderBadge: string; // e.g. "Pusat Unduhan Resmi • Muhammad Dzikron"
  pageHeaderTitle: string; // e.g. "Unduh Master Audio & Materi Musik"
  pageHeaderDesc: string; // e.g. "Dapatkan master audio original kualitas studio..."
}

export const DEFAULT_DOWNLOAD_BANNER_CONFIG: DownloadBannerConfig = {
  badgeTitle: 'Akses Unduhan Terbuka',
  verifiedBadge: 'Terverifikasi',
  thankYouTitle: 'Terima kasih telah mengikuti Instagram @muhammaddzikron',
  description: 'Semua tombol download file di bawah ini telah aktif dan dapat langsung Anda unduh secara gratis.',
  instagramUsername: '@muhammaddzikron',
  instagramUrl: 'https://www.instagram.com/muhammaddzikron',
  pageHeaderBadge: 'Pusat Unduhan Resmi • Muhammad Dzikron',
  pageHeaderTitle: 'Unduh Master Audio & Materi Musik',
  pageHeaderDesc: 'Dapatkan master audio original kualitas studio (WAV / MP3 320kbps), buku chord & notasi partitur resmi, panduan lirik, serta paket instrumentalia langsung dari tautan aman Google Drive.'
};

export function getDownloadBannerConfig(): DownloadBannerConfig {
  if (typeof window === 'undefined') return DEFAULT_DOWNLOAD_BANNER_CONFIG;
  try {
    const raw = localStorage.getItem(BANNER_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_DOWNLOAD_BANNER_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DOWNLOAD_BANNER_CONFIG, ...parsed };
  } catch {
    return DEFAULT_DOWNLOAD_BANNER_CONFIG;
  }
}

export function saveDownloadBannerConfig(updates: Partial<DownloadBannerConfig>): DownloadBannerConfig {
  const current = getDownloadBannerConfig();
  const merged: DownloadBannerConfig = { ...current, ...updates };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BANNER_CONFIG_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event('dzikron_download_banner_updated'));
    } catch (err) {
      console.warn('Failed to save download banner config:', err);
    }
  }
  return merged;
}

export function resetDownloadBannerConfig(): DownloadBannerConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(BANNER_CONFIG_STORAGE_KEY);
      window.dispatchEvent(new Event('dzikron_download_banner_updated'));
    } catch (err) {
      console.warn('Failed to reset download banner config:', err);
    }
  }
  return DEFAULT_DOWNLOAD_BANNER_CONFIG;
}

/**
 * Resolve direct download link (supports Google Drive file URLs and direct files)
 */
export function resolveDownloadUrl(urlOrDriveId: string): string {
  return getGoogleDriveDownloadUrl(urlOrDriveId);
}
