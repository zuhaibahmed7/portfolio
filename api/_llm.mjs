// ---------------------------------------------------------------------------
// Shared LLM proxy used by BOTH:
//   • api/chat.js        → Vercel serverless function (production)
//   • vite.config.js     → dev/preview server middleware (local)
//
// The API key is read from process.env on the SERVER only — it is never
// shipped to the browser bundle.
//
// Works with any OpenAI-compatible /chat/completions endpoint. Configure via:
//   LLM_API_KEY   (required)  e.g. sk-...
//   LLM_BASE_URL  (optional)  default: https://api.openai.com/v1
//   LLM_MODEL     (optional)  default: gpt-4o-mini
// Examples:
//   GLM/Zhipu : LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4  LLM_MODEL=glm-4-flash
//   Qwen      : LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1  LLM_MODEL=qwen-plus
// ---------------------------------------------------------------------------
import { SYSTEM_PROMPT } from '../src/chatbot/knowledge.js';
import { localAnswer } from '../src/chatbot/localBrain.js';

const MAX_HISTORY = 24; // keep payloads small; drops the oldest turns
const MAX_CHARS = 1000; // per message (client sends ≤500; server enforces its own cap)
const TIMEOUT_MS = 30000;

/* ---------------------------------------------------------------------------
   Basic in-memory rate limiting (per runtime instance) — caps each client at
   12 chat requests/minute so the endpoint can't be used to run up LLM costs
   or relay spam. On serverless (Vercel) this is per-lambda-instance: it stops
   casual abuse; a determined attacker would need a shared store (e.g. Upstash
   Redis) — see README "Manual steps".
--------------------------------------------------------------------------- */
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const hits = new Map();

/** @returns {boolean} true when the key has exceeded the limit */
export function rateLimited(key) {
  const now = Date.now();
  const entry = hits.get(key);

  // Opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 500) {
    for (const [k, v] of hits) if (now - v.start > RATE_LIMIT_WINDOW_MS) hits.delete(k);
  }

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/** Best-effort client identifier (Vercel puts the caller IP in x-forwarded-for) */
export function clientKeyFromReq(req) {
  const fwd = req?.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();
  return req?.socket?.remoteAddress || 'local';
}

export const RATE_LIMIT_REPLY =
  "You're sending messages a bit fast — give me a few seconds and try again. 🙂";

/** Sanitize incoming client history → [{role, content}] */
function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_HISTORY);
}

/**
 * Core handler: prepends the system prompt to the (sanitized) conversation
 * history and calls the configured OpenAI-compatible endpoint.
 * @returns {Promise<{status: number, reply: string|null}>}
 */
export async function answerChat(rawHistory) {
  const history = sanitizeHistory(rawHistory);
  if (history.length === 0) return { status: 400, reply: null };

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    // No LLM configured → answer from the built-in knowledge brain so the
    // chatbot still works on static-only deployments (HF Spaces, etc.)
    const local = localAnswer(history);
    return local ? { status: 200, reply: local, source: 'local' } : { status: 503, reply: null };
  }

  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        // System prompt first, then the growing multi-turn history
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        temperature: 0.6,
        max_tokens: 350,
      }),
      signal: controller.signal,
    });

    if (!res.ok || typeof data?.choices?.[0]?.message?.content !== 'string') {
      // Provider failed → degrade gracefully to the local brain
      const local = localAnswer(history);
      return local ? { status: 200, reply: local, source: 'local-fallback' } : { status: 502, reply: null };
    }

    const reply = data.choices[0].message.content;
    if (!reply.trim()) {
      const local = localAnswer(history);
      return local ? { status: 200, reply: local, source: 'local-fallback' } : { status: 502, reply: null };
    }

    return { status: 200, reply: reply.trim(), source: 'llm' };
  } catch {
    // Network error / timeout / malformed response
    return { status: 502, reply: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Reads a JSON body from a raw Node request (dev/preview middleware). */
export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf-8');
        resolve(text ? JSON.parse(text) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
