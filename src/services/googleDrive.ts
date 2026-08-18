/**
 * Service for converting Google Drive File IDs & Full Links to playable streaming links & cover image links
 */

export function extractDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern 1: /file/d/{id} or /d/{id} or /folders/{id}
  const matchD = trimmed.match(/\/(?:file\/d|d|folders)\/([a-zA-Z0-9_-]+)/i);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 2: id={id} or docid={id} or export=download&id={id}
  const matchId = trimmed.match(/[?&](?:id|docid|export=download&id)=([a-zA-Z0-9_-]+)/i);
  if (matchId && matchId[1]) return matchId[1];

  // Pattern 3: open?id={id} or uc?id={id}
  const matchOpen = trimmed.match(/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/i);
  if (matchOpen && matchOpen[1]) return matchOpen[1];

  // Pattern 4: direct ID alphanumeric string with length >= 15 without slashes
  if (!trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('&') && trimmed.length >= 15) {
    return trimmed;
  }

  // Pattern 5: any 25-55 char alphanumeric sequence inside URL
  const matchLongAlpha = trimmed.match(/([a-zA-Z0-9_-]{25,55})/);
  if (matchLongAlpha && matchLongAlpha[1]) {
    return matchLongAlpha[1];
  }

  return null;
}

export function getGoogleDriveAudioCandidates(driveIdOrUrl: string): string[] {
  if (!driveIdOrUrl) return [];
  const trimmed = driveIdOrUrl.trim();

  // If it's already our backend stream endpoint
  if (trimmed.startsWith('/api/stream-drive')) {
    return [trimmed];
  }

  // If it's a direct mp3/wav/ogg/m4a link not on google drive
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('drive.google.com') &&
    !trimmed.includes('docs.google.com') &&
    !trimmed.includes('drive.usercontent.google.com')
  ) {
    return [trimmed];
  }

  const driveId = extractDriveId(trimmed);
  if (!driveId) {
    return trimmed.startsWith('http') ? [trimmed] : [];
  }

  // Priority 1: High-Performance Backend Audio Proxy (Full byte range support & CORS/CORP bypass)
  // Priority 2+: Direct Google Drive links
  return [
    `/api/stream-drive?id=${driveId}`,
    `https://docs.google.com/uc?export=download&id=${driveId}`,
    `https://drive.google.com/uc?export=download&id=${driveId}`,
    `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0`,
    `https://drive.google.com/uc?id=${driveId}&export=download`,
    `https://docs.google.com/uc?export=open&id=${driveId}`,
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
