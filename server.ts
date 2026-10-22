import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Readable } from 'stream';

function extractDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const matchD = trimmed.match(/\/(?:file\/d|d|folders)\/([a-zA-Z0-9_-]+)/i);
  if (matchD && matchD[1]) return matchD[1];
  const matchId = trimmed.match(/[?&](?:id|docid|export=download&id)=([a-zA-Z0-9_-]+)/i);
  if (matchId && matchId[1]) return matchId[1];
  const matchOpen = trimmed.match(/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/i);
  if (matchOpen && matchOpen[1]) return matchOpen[1];
  if (!trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('&') && trimmed.length >= 15) {
    return trimmed;
  }
  const matchLongAlpha = trimmed.match(/([a-zA-Z0-9_-]{25,55})/);
  if (matchLongAlpha && matchLongAlpha[1]) return matchLongAlpha[1];
  return null;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DOWNLOADS_FILE = path.join(DATA_DIR, 'downloads.json');

const INITIAL_DOWNLOADS = [
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

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DOWNLOADS_FILE)) {
    fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(INITIAL_DOWNLOADS, null, 2), 'utf-8');
  }
}

function readDownloads(): any[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DOWNLOADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check for corrupted "File Unduhan #" placeholder names
      const corrupted = parsed.some(
        (p: any) => typeof p.fileName === 'string' && p.fileName.startsWith('File Unduhan #')
      );
      if (corrupted) {
        fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(INITIAL_DOWNLOADS, null, 2), 'utf-8');
        return INITIAL_DOWNLOADS;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading downloads.json:', err);
  }
  return INITIAL_DOWNLOADS;
}

function writeDownloads(items: any[]): void {
  ensureDataFile();
  fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // DOWNLOADS PERSISTENCE & SPREADSHEET SYNC API
  // ==========================================

  // GET all download items
  app.get('/api/downloads', (req, res) => {
    try {
      const items = readDownloads();
      res.json({ success: true, downloads: items });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST save or update a download item
  app.post('/api/downloads', (req, res) => {
    try {
      const { item, oldFileName } = req.body;
      if (!item || !item.fileName || !item.fileUrl) {
        res.status(400).json({ success: false, message: 'Data file tidak lengkap (nama & URL wajib ada)' });
        return;
      }

      const current = readDownloads();
      const existingIdx = current.findIndex(
        (d: any) =>
          d.id === item.id ||
          (oldFileName && d.fileName.toLowerCase() === oldFileName.toLowerCase()) ||
          d.fileName.toLowerCase() === item.fileName.toLowerCase()
      );

      let updatedList: any[];
      if (existingIdx >= 0) {
        // Update existing
        current[existingIdx] = {
          ...current[existingIdx],
          ...item,
          id: current[existingIdx].id || item.id || `dl-${Date.now()}`
        };
        updatedList = [...current];
      } else {
        // Add new item
        const newItem = {
          ...item,
          id: item.id || `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          downloadCount: item.downloadCount || 0,
          createdAt: item.createdAt || new Date().toISOString().split('T')[0]
        };
        updatedList = [newItem, ...current];
      }

      writeDownloads(updatedList);
      res.json({ success: true, downloads: updatedList });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE a download item
  app.delete('/api/downloads/:id', (req, res) => {
    try {
      const target = req.params.id;
      const current = readDownloads();
      const updatedList = current.filter((d: any) => d.id !== target && d.fileName !== target);
      writeDownloads(updatedList);
      res.json({ success: true, downloads: updatedList });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // RESET downloads to initial default
  app.post('/api/downloads/reset', (req, res) => {
    try {
      writeDownloads(INITIAL_DOWNLOADS);
      res.json({ success: true, downloads: INITIAL_DOWNLOADS });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // CHECK Apps Script deployment status for Tab Unduhan
  app.post('/api/downloads/check-spreadsheet', async (req, res) => {
    const { endpointUrl } = req.body;
    if (!endpointUrl) {
      res.status(400).json({ success: false, message: 'URL Apps Script belum diisi' });
      return;
    }

    try {
      const separator = endpointUrl.includes('?') ? '&' : '?';
      const checkUrl = `${endpointUrl}${separator}type=downloads&_t=${Date.now()}`;
      const response = await fetch(checkUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'MuhammadDzikron-Website/1.0' }
      });

      if (!response.ok) {
        res.json({
          ready: false,
          httpStatus: response.status,
          message: `Koneksi gagal dengan HTTP status ${response.status}`
        });
        return;
      }

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        res.json({
          ready: false,
          message: 'Apps Script mengembalikan respons non-JSON. Pastikan Web App disetel "Anyone" (Siapa saja).'
        });
        return;
      }

      // Check if it returned song catalog instead of downloads (legacy script issue)
      const isSongData =
        Array.isArray(data) &&
        data.length > 0 &&
        Boolean(data[0]['Judul Lagu'] || data[0]['Penyanyi'] || data[0]['Genre']);

      const hasDownloadFields =
        Array.isArray(data) &&
        data.some((item: any) =>
          Boolean(item['Nama File'] || item['nama_file'] || item['Link Download'] || item['Format'])
        );

      if (isSongData && !hasDownloadFields) {
        res.json({
          ready: false,
          needsNewDeploymentVersion: true,
          message:
            'Google Apps Script yang sedang berjalan masih versi lama (belum mengenali Tab Unduhan). Harap buka Google Apps Script -> Terapkan (Deploy) -> Kelola penerapan -> Edit (pensil) -> Pilih "Versi baru" (New version) -> Terapkan.'
        });
        return;
      }

      res.json({
        ready: true,
        downloadsCount: Array.isArray(data) ? data.length : 0,
        message: 'Google Apps Script berhasil terhubung dan mengenali Tab Unduhan!'
      });
    } catch (err: any) {
      res.json({ ready: false, message: `Error koneksi ke Apps Script: ${err.message}` });
    }
  });

  // SYNC single item or all downloads to Google Spreadsheet through server proxy
  app.post('/api/downloads/sync-spreadsheet', async (req, res) => {
    const { endpointUrl, action, item, downloads, oldFileName } = req.body;
    if (!endpointUrl) {
      res.status(400).json({ success: false, message: 'URL Apps Script belum diisi' });
      return;
    }

    try {
      let payload: any;
      if (action === 'sync_all' || Array.isArray(downloads)) {
        payload = {
          action: 'sync_downloads',
          downloads: (downloads || readDownloads()).map((d: any, idx: number) => ({
            no: idx + 1,
            id: d.id,
            fileName: d.fileName,
            category: d.category || 'Master Audio HQ',
            format: d.format || 'File',
            fileSize: d.fileSize || '-',
            fileUrl: d.fileUrl || '',
            description: d.description || '-',
            downloadCount: d.downloadCount || 0,
            status: d.status === 'active' ? 'Publish' : 'Hidden'
          }))
        };
      } else {
        payload = {
          action: 'save_download',
          id: item?.id,
          fileName: item?.fileName,
          oldFileName: oldFileName || undefined,
          category: item?.category,
          format: item?.format,
          fileSize: item?.fileSize || '-',
          fileUrl: item?.fileUrl,
          description: item?.description,
          downloadCount: item?.downloadCount || 0,
          status: item?.status === 'active' ? 'Publish' : 'Hidden'
        };
      }

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      const text = await response.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      // If Apps Script returns {"status":"ok"}, it means it was unhandled by current deployed version!
      if (json && json.status === 'ok') {
        res.json({
          success: false,
          needsNewDeploymentVersion: true,
          message:
            'Data tersimpan di server website, namun Google Apps Script yang aktif masih versi lama (belum mengenali Tab Unduhan). Silakan lakukan "Deploy -> Manage deployments -> Edit -> Versi baru (New version) -> Deploy" pada editor Google Apps Script Anda.'
        });
        return;
      }

      if (json && json.status === 'success') {
        res.json({
          success: true,
          spreadsheetSynced: true,
          message: json.message || 'Berhasil disimpan dan disinkronkan ke Google Spreadsheet (Tab "Unduhan")!'
        });
        return;
      }

      // General fallback
      res.json({
        success: true,
        spreadsheetSynced: false,
        rawResponse: json,
        message: 'Tersimpan di website. Periksa Google Apps Script untuk memastikan Tab "Unduhan" terbarui.'
      });
    } catch (err: any) {
      console.error('Error in /api/downloads/sync-spreadsheet:', err);
      res.status(500).json({ success: false, message: `Gagal sinkron ke spreadsheet: ${err.message}` });
    }
  });

  // Streaming Proxy for Google Drive Audio
  app.get('/api/stream-drive', async (req, res) => {
    const rawIdOrUrl = (req.query.id as string) || (req.query.url as string) || '';
    if (!rawIdOrUrl) {
      res.status(400).send('Missing Google Drive ID or URL');
      return;
    }

    const driveId = extractDriveId(rawIdOrUrl);
    const targetUrl = driveId
      ? `https://drive.google.com/uc?export=download&id=${driveId}`
      : rawIdOrUrl;

    try {
      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      if (req.headers.range) {
        headers['Range'] = req.headers.range as string;
      }

      // Fetch from Google Drive with follow redirects
      let response = await fetch(targetUrl, {
        method: 'GET',
        headers,
        redirect: 'follow'
      });

      // Handle Drive download virus-warning confirmation page for larger files
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') && driveId) {
        const html = await response.text();
        const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
        const confirmCode = confirmMatch ? confirmMatch[1] : 't';
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmCode}&id=${driveId}`;

        response = await fetch(confirmUrl, {
          method: 'GET',
          headers,
          redirect: 'follow'
        });
      }

      // Forward status and relevant headers
      res.status(response.status);

      const forwardHeaders = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
        'cache-control'
      ];

      forwardHeaders.forEach((h) => {
        const val = response.headers.get(h);
        if (val) res.setHeader(h, val);
      });

      // Ensure audio/mpeg content type if ambiguous, and set CORS headers
      const currentCt = res.getHeader('content-type') as string;
      if (!currentCt || currentCt.includes('text/plain') || currentCt.includes('application/octet-stream')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      }
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (!response.body) {
        res.end();
        return;
      }

      // Pipe the body to client
      // @ts-ignore
      const readable = Readable.fromWeb(response.body);
      readable.pipe(res);
    } catch (err: any) {
      console.error('Error streaming Google Drive audio:', err);
      if (!res.headersSent) {
        res.status(500).send('Error streaming Google Drive file: ' + err.message);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
