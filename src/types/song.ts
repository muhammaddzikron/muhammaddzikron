export interface Song {
  id: string;
  no: number;
  title: string;
  singer: string;
  genre: string;
  year: string | number;
  cover: string;
  driveId: string;
  duration: string;
  lyrics: string;
  status: string;
  order: number;
  audioUrl?: string; // Resolved direct stream URL
  isFavorite?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Studio' | 'Konser' | 'Behind The Scene' | 'Kegiatan';
  imageUrl: string;
  date: string;
  description: string;
}

export interface Achievement {
  id: string;
  year: string;
  title: string;
  category: 'Album' | 'Penghargaan' | 'Festival' | 'Kolaborasi';
  description: string;
  location?: string;
  icon?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconName: string;
  color: string;
}

export interface SkillItem {
  name: string;
  percentage: number;
  iconName: string;
  color: string;
}

export interface AppConfig {
  appsScriptUrl: string;
  autoPlayNext: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  volume: number;
}
