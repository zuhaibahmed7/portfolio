// Vercel serverless function: POST /api/contact
// Validates + rate-limits the contact form and delivers it via Resend.
import { clientKeyFromReq, rateLimited } from './_llm.mjs';
import { submitContact } from './_contact.mjs';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, reason: 'method_not_allowed' }));
  }

  // Tighter than the chatbot: form spam gets 5/min per IP
  if (rateLimited(`contact:${clientKeyFromReq(req)}`)) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ ok: false, reason: 'rate_limited' }));
  }

  try {
    const { status, ok, reason } = await submitContact(req.body || {});
    res.statusCode = status;
    return res.end(JSON.stringify({ ok, reason: reason ?? null }));
  } catch {
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, reason: 'server' }));
  }
}
