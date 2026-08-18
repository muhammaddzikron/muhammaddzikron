/**
 * Utility functions for normalizing, parsing, and formatting audio durations.
 */

export function formatSecondsToMinutes(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || !isFinite(totalSeconds) || totalSeconds <= 0) {
    return '00:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatSongDuration(rawDuration: any): string {
  if (!rawDuration) return '03:45';

  // If already in MM:SS format like "04:12" or "4:12"
  if (typeof rawDuration === 'string') {
    const trimmed = rawDuration.trim();

    // Check for Google Sheet ISO Date timestamps like "1899-12-29T21:04:48.000Z" or "1899-12-30T04:48:00.000Z"
    if (trimmed.includes('1899-12-') || trimmed.includes('T') && trimmed.endsWith('Z')) {
      try {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          const mins = date.getMinutes();
          const secs = date.getSeconds();
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      } catch {
        // fallback to regex extraction
      }

      // Regex fallback for ISO string: e.g. T21:04:48.000Z
      const matchIso = trimmed.match(/T\d{2}:(\d{2}):(\d{2})/);
      if (matchIso) {
        return `${matchIso[1]}:${matchIso[2]}`;
      }
    }

    // Standard "MM:SS" or "M:SS"
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const parts = trimmed.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }

    // "HH:MM:SS" e.g. "00:04:12" -> "04:12"
    if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      const parts = trimmed.split(':');
      const hours = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10) + hours * 60;
      return `${mins.toString().padStart(2, '0')}:${parts[2]}`;
    }

    // Numeric string seconds (e.g. "245" or "180.5")
    const num = parseFloat(trimmed);
    if (!isNaN(num) && num > 0) {
      return formatSecondsToMinutes(num);
    }
  }

  // If number of seconds
  if (typeof rawDuration === 'number' && !isNaN(rawDuration) && rawDuration > 0) {
    return formatSecondsToMinutes(rawDuration);
  }

  return '03:45';
}

/**
 * Preloads audio metadata in background to auto-detect the duration if missing or invalid.
 */
export function detectAudioDuration(audioUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!audioUrl || typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioUrl;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };

    const onLoaded = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        const formatted = formatSecondsToMinutes(audio.duration);
        cleanup();
        resolve(formatted);
      } else {
        cleanup();
        resolve(null);
      }
    };

    const onError = () => {
      cleanup();
      resolve(null);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);

    // Timeout safety 6 seconds
    setTimeout(() => {
      cleanup();
      resolve(null);
    }, 6000);
  });
}
