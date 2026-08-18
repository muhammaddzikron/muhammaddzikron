/**
 * Service for converting Google Drive File IDs & Full Links to playable streaming links & cover image links
 */

export function extractDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If input contains full Google Drive URL
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) return matchFile[1];

  // If it's already a raw ID without slash (Google Drive IDs are typically 25-45 characters alphanumeric)
  if (!trimmed.includes('/') && !trimmed.includes('?') && trimmed.length >= 20) {
    return trimmed;
  }

  return null;
}

export function getGoogleDriveAudioCandidates(driveIdOrUrl: string): string[] {
  if (!driveIdOrUrl) return [];
  const trimmed = driveIdOrUrl.trim();

  // If it's a direct mp3/wav link not on google drive
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('drive.google.com') &&
    !trimmed.includes('docs.google.com')
  ) {
    return [trimmed];
  }

  const driveId = extractDriveId(trimmed);
  if (!driveId) {
    return trimmed.startsWith('http') ? [trimmed] : [];
  }

  // Return candidate streaming URLs in order of modern browser compatibility
  return [
    `https://drive.google.com/uc?export=download&id=${driveId}`,
    `https://docs.google.com/uc?export=open&id=${driveId}`,
    `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`,
    `https://drive.google.com/uc?id=${driveId}`
  ];
}

export function getGoogleDriveAudioUrl(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const candidates = getGoogleDriveAudioCandidates(driveIdOrUrl);
  return candidates[0] || '';
}

export function getGoogleDriveImageUrl(coverOrDriveId: string): string {
  if (!coverOrDriveId) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
  }

  const trimmed = coverOrDriveId.trim();

  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('drive.google.com') &&
    !trimmed.includes('docs.google.com')
  ) {
    return trimmed;
  }

  const id = extractDriveId(trimmed);
  if (id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }

  return trimmed;
}
