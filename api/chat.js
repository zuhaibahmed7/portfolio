// Vercel serverless function: POST /api/chat
// Proxies chat requests to an OpenAI-compatible LLM endpoint with the API key
// kept server-side. Works on Vercel out of the box; for Netlify or HF Spaces
// see README.md ("Chatbot backend") for the equivalent adapter.
import { answerChat, clientKeyFromReq, rateLimited, RATE_LIMIT_REPLY } from './_llm.mjs';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'method_not_allowed' }));
  }

  // Basic per-IP rate limit (abuse / LLM cost protection)
  if (rateLimited(clientKeyFromReq(req))) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ reply: RATE_LIMIT_REPLY }));
  }

  try {
    const { messages } = req.body || {};
    const { status, reply } = await answerChat(messages);
    res.statusCode = status;
    return res.end(JSON.stringify({ reply }));
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ reply: null }));
  }
}
