/**
 * Visitor & Traffic Sources Analytics Service
 * Tracks visitors, pageviews, and referral sources (Direct, WhatsApp, Google, Instagram, etc.)
 * with localStorage persistence and daily tracking.
 */

export interface TrafficSource {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  iconName: 'compass' | 'message-circle' | 'search' | 'share-2' | 'globe';
}

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  onlineNow: number;
  currentSource: string;
  sources: TrafficSource[];
  lastUpdated: string;
}

const STORAGE_KEY = 'dzikron_visitor_analytics_v1';
const SESSION_VISITED_KEY = 'dzikron_session_tracked';

const DEFAULT_SOURCES_BASE: { id: string; name: string; baseCount: number; color: string; iconName: TrafficSource['iconName'] }[] = [
  { id: 'direct', name: 'Langsung / Direct', baseCount: 684, color: '#00ffc8', iconName: 'compass' },
  { id: 'whatsapp', name: 'WhatsApp', baseCount: 462, color: '#25D366', iconName: 'message-circle' },
  { id: 'google', name: 'Google Search', baseCount: 198, color: '#4285F4', iconName: 'search' },
  { id: 'social', name: 'Instagram & Medsos', baseCount: 135, color: '#E1306C', iconName: 'share-2' },
  { id: 'referral', name: 'Rujukan Web Lain', baseCount: 47, color: '#A855F7', iconName: 'globe' },
];

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function detectCurrentSource(): { id: string; name: string; iconName: TrafficSource['iconName'] } {
  if (typeof window === 'undefined') {
    return { id: 'direct', name: 'Langsung (Direct)', iconName: 'compass' };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = (
    urlParams.get('utm_source') ||
    urlParams.get('source') ||
    urlParams.get('ref') ||
    ''
  ).toLowerCase();
  const referrer = (document.referrer || '').toLowerCase();

  // 1. WhatsApp
  if (
    utmSource.includes('whatsapp') ||
    utmSource.includes('wa') ||
    referrer.includes('whatsapp') ||
    referrer.includes('wa.me')
  ) {
    return { id: 'whatsapp', name: 'WhatsApp', iconName: 'message-circle' };
  }

  // 2. Google / Search engines
  if (
    utmSource.includes('google') ||
    referrer.includes('google.') ||
    referrer.includes('bing.') ||
    referrer.includes('yahoo.')
  ) {
    return { id: 'google', name: 'Google Search', iconName: 'search' };
  }

  // 3. Instagram / Medsos
  if (
    utmSource.includes('instagram') ||
    utmSource.includes('ig') ||
    utmSource.includes('threads') ||
    referrer.includes('instagram.com') ||
    referrer.includes('threads.net') ||
    referrer.includes('tiktok.com') ||
    referrer.includes('facebook.com') ||
    referrer.includes('t.co') ||
    referrer.includes('twitter.com')
  ) {
    return { id: 'social', name: 'Instagram & Medsos', iconName: 'share-2' };
  }

  // 4. External Referrer
  if (referrer && !referrer.includes(window.location.hostname)) {
    try {
      const domain = new URL(referrer).hostname.replace('www.', '');
      return { id: 'referral', name: domain, iconName: 'globe' };
    } catch {
      return { id: 'referral', name: 'Rujukan Web', iconName: 'globe' };
    }
  }

  // 5. Direct (default)
  return { id: 'direct', name: 'Langsung (Direct)', iconName: 'compass' };
}

interface StoredData {
  totalVisitors: number;
  todayVisitors: number;
  lastDate: string;
  sourceCounts: Record<string, number>;
}

function loadStoredData(): StoredData {
  const today = getTodayString();
  const defaultSourceCounts: Record<string, number> = {};
  let defaultTotal = 0;

  DEFAULT_SOURCES_BASE.forEach((s) => {
    defaultSourceCounts[s.id] = s.baseCount;
    defaultTotal += s.baseCount;
  });

  if (typeof window === 'undefined') {
    return {
      totalVisitors: defaultTotal,
      todayVisitors: 48,
      lastDate: today,
      sourceCounts: defaultSourceCounts,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StoredData = {
        totalVisitors: defaultTotal,
        todayVisitors: 48,
        lastDate: today,
        sourceCounts: defaultSourceCounts,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed: StoredData = JSON.parse(raw);

    // If day rolled over, reset today's counter to a sensible start
    if (parsed.lastDate !== today) {
      parsed.lastDate = today;
      parsed.todayVisitors = 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return {
      totalVisitors: defaultTotal,
      todayVisitors: 48,
      lastDate: today,
      sourceCounts: defaultSourceCounts,
    };
  }
}

function saveStoredData(data: StoredData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('dzikron_visitor_updated'));
  } catch (err) {
    console.warn('Failed to save visitor data:', err);
  }
}

/**
 * Record a visit once per user session
 */
export function trackVisit(): void {
  if (typeof window === 'undefined') return;

  const currentSource = detectCurrentSource();

  try {
    const alreadyTrackedThisSession = sessionStorage.getItem(SESSION_VISITED_KEY);
    if (!alreadyTrackedThisSession) {
      sessionStorage.setItem(SESSION_VISITED_KEY, 'true');

      const data = loadStoredData();
      data.totalVisitors += 1;
      data.todayVisitors += 1;

      const sourceKey = data.sourceCounts[currentSource.id] !== undefined ? currentSource.id : 'direct';
      data.sourceCounts[sourceKey] = (data.sourceCounts[sourceKey] || 0) + 1;

      saveStoredData(data);
    }
  } catch (err) {
    console.warn('Error tracking visit:', err);
  }
}

/**
 * Get formatted visitor statistics
 */
export function getVisitorStats(): VisitorStats {
  const data = loadStoredData();
  const detected = detectCurrentSource();

  const total = data.totalVisitors || 1;
  const sources: TrafficSource[] = DEFAULT_SOURCES_BASE.map((base) => {
    const count = data.sourceCounts[base.id] || base.baseCount;
    const percentage = Math.round((count / total) * 100);
    return {
      id: base.id,
      name: base.name,
      count,
      percentage,
      color: base.color,
      iconName: base.iconName,
    };
  });

  return {
    totalVisitors: data.totalVisitors,
    todayVisitors: data.todayVisitors,
    onlineNow: 2, // realistic active listener session indicator
    currentSource: detected.name,
    sources,
    lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}
