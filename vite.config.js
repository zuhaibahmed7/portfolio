import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { answerChat, clientKeyFromReq, rateLimited, RATE_LIMIT_REPLY, readJsonBody } from './api/_llm.mjs';
import { submitContact } from './api/_contact.mjs';
import { getBookings, postBooking, bookingRateLimited } from './api/_bookings.mjs';

// ---------------------------------------------------------------------------
// Minimal server-side .env loader (Vite only exposes VITE_* vars to the
// client; our API middleware reads process.env directly). The .env file is
// gitignored — secrets never reach the browser bundle or version control.
// ---------------------------------------------------------------------------
try {
  const envPath = fileURLToPath(new URL('./.env', import.meta.url));
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
} catch {
  /* no .env — pure-local fallbacks apply */
}

// Mounts the chatbot's LLM proxy as a middleware on BOTH the dev server and
// the preview server, so /api/chat works locally exactly like it does on
// Vercel (where api/chat.js handles it as a serverless function).
async function mountChatApi(middlewares) {
  middlewares.use('/api/chat', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    try {
      // Same per-IP rate limit as the production serverless function
      if (rateLimited(clientKeyFromReq(req))) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        return res.end(JSON.stringify({ reply: RATE_LIMIT_REPLY }));
      }
      const body = await readJsonBody(req);
      const { status, reply } = await answerChat(body?.messages);
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ reply }));
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ reply: null }));
    }
  });

  // Booking system endpoint (same shape as api/bookings.js on Vercel)
  middlewares.use('/api/bookings', async (req, res, next) => {
    try {
      if (req.method === 'GET') {
        const url = new URL(req.url, 'http://localhost');
        const { status, body } = await getBookings({ date: url.searchParams.get('date') });
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        return res.end(JSON.stringify(body));
      }
      if (req.method !== 'POST') return next();
      if (bookingRateLimited(req)) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ error: 'rate_limited' }));
      }
      const body = await readJsonBody(req);
      const { status, body: out } = await postBooking(body);
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(out));
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'bad_request' }));
    }
  });

  // Contact form endpoint (same shape as api/contact.js on Vercel)
  middlewares.use('/api/contact', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    try {
      if (rateLimited(`contact:${clientKeyFromReq(req)}`)) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ ok: false, reason: 'rate_limited' }));
      }
      const body = await readJsonBody(req);
      const { status, ok, reason } = await submitContact(body);
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ ok, reason: reason ?? null }));
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, reason: 'bad_request' }));
    }
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'chatbot-api',
      configureServer(server) {
        mountChatApi(server.middlewares);
      },
      configurePreviewServer(server) {
        mountChatApi(server.middlewares);
      },
    },
  ],
  // Strip console/debugger from the production build so no internals leak
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    // Small single-page site — ship one JS/CSS chunk for faster first paint
    chunkSizeWarningLimit: 1600,
  },
});
