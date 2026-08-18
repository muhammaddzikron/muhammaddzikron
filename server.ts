import express from 'express';
import path from 'path';
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
