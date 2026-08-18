/**
 * YouTube Utility Helper
 * Supports standard watch URLs, short youtu.be, shorts, embeds, and raw IDs
 */

export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  if (!clean) return null;

  // Direct 11-char ID check (e.g. dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Standard watch URL: youtube.com/watch?v=...
  const watchMatch = clean.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // Parameter v=... anywhere
  const paramMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (paramMatch && paramMatch[1]) {
    return paramMatch[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(urlOrId?: string, autoplay = false): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
}

export function getYouTubeThumbnailUrl(urlOrId?: string): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeWatchUrl(urlOrId?: string): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}
