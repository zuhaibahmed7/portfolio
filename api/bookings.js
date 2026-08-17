// Vercel serverless function: /api/bookings
//   GET  ?date=YYYY-MM-DD        → active bookings for that session date
//   POST { action: 'hold' | 'confirm', ... }
import { getBookings, postBooking, bookingRateLimited } from './_bookings.mjs';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const { status, body } = await getBookings({ date: url.searchParams.get('date') });
    res.statusCode = status;
    return res.end(JSON.stringify(body));
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'method_not_allowed' }));
  }

  if (bookingRateLimited(req)) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ error: 'rate_limited' }));
  }

  try {
    const { status, body } = await postBooking(req.body || {});
    res.statusCode = status;
    return res.end(JSON.stringify(body));
  } catch {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'storage' }));
  }
}
