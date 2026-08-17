// ---------------------------------------------------------------------------
// Booking engine shared by api/bookings.js (Vercel) and the vite middleware.
//
// Storage backends:
//   • Supabase REST (recommended, cross-visitor)  — set SUPABASE_URL +
//     SUPABASE_ANON_KEY env vars. Table SQL in README ("Custom booking").
//   • In-memory fallback (no env) — fully functional per runtime instance:
//     perfect locally, and on serverless it still enforces holds within a
//     single warm instance. TODO: create the free Supabase project + table
//     for true cross-visitor conflict detection.
//
// All times are stored as absolute UTC ISO strings; the PKT window logic
// (UTC+5, no DST) lives here so timezone bugs can't creep in.
// ---------------------------------------------------------------------------
import { bookingConfig } from '../src/data/content.js';
import { clientKeyFromReq, rateLimited } from './_llm.mjs';

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // PKT = UTC+5

/* ---------- PKT <-> UTC helpers ---------- */

// Absolute UTC time for "hour:minute PKT on session date D" (hour may be 25)
function pktToUTCISO(dateStr, hour, minute) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour, minute) - PKT_OFFSET_MS).toISOString();
}

export function windowStartISO(dateStr) {
  return pktToUTCISO(dateStr, bookingConfig.windowStartHourPKT, 0);
}
export function windowEndISO(dateStr) {
  return pktToUTCISO(dateStr, bookingConfig.windowEndHourPKT, 0);
}

/* All 30-min candidate start slots for a session date (22:00 -> 00:30 PKT) */
export function slotsForDate(dateStr) {
  const out = [];
  for (let h = bookingConfig.windowStartHourPKT; h < bookingConfig.windowEndHourPKT; h++) {
    for (let mm = 0; mm < 60; mm += bookingConfig.slotMinutes) {
      out.push(pktToUTCISO(dateStr, h, mm));
    }
  }
  return out;
}

const isValidDateStr = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
const VALID_DURATIONS = [30, 60, 90, 120];

/* ---------- storage abstraction ---------- */

const memory = new Map(); // id -> booking record
const usingSupabase = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

async function sb(path, opts = {}) {
  const res = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  const text = await res.text();
  // Supabase may return 201/204 with an empty (or `[]`) body — treat as null
  return text ? JSON.parse(text) : null;
}

/** Active (non-expired) bookings for a session date */
async function activeBookings(dateStr) {
  const now = new Date().toISOString();
  if (usingSupabase()) {
    const rows = await sb(`bookings?select=*&date=eq.${dateStr}`);
    return rows.filter(
      (r) => r.status !== 'held' || (r.hold_expires && r.hold_expires > now)
    );
  }
  return [...memory.values()].filter(
    (r) => r.date === dateStr && (r.status !== 'held' || r.hold_expires > now)
  );
}

const overlaps = (startISO, durationMin, list) => {
  const s = Date.parse(startISO);
  const e = s + durationMin * 60000;
  return list.some((r) => {
    const rs = Date.parse(r.start_iso);
    const re = rs + r.duration_min * 60000;
    return s < re && rs < e;
  });
};

/* ---------- API operations ---------- */

/** GET — bookings for a date (client computes availability from these) */
export async function getBookings(query) {
  const date = String(query?.date || '');
  if (!isValidDateStr(date)) return { status: 400, body: { error: 'bad_date' } };
  const list = await activeBookings(date);
  return {
    status: 200,
    body: {
      bookings: list.map((r) => ({
        startISO: r.start_iso,
        duration: r.duration_min,
        status: r.status,
        holdExpires: r.hold_expires,
      })),
    },
  };
}

/** POST — hold or confirm */
export async function postBooking(payload) {
  if (payload?.action === 'hold') return createHold(payload);
  if (payload?.action === 'confirm') return confirmHold(payload);
  return { status: 400, body: { error: 'bad_action' } };
}

async function createHold(p) {
  const { date, startISO, duration } = p || {};
  if (!isValidDateStr(String(date))) return { status: 422, body: { error: 'bad_date' } };
  if (!VALID_DURATIONS.includes(Number(duration))) return { status: 422, body: { error: 'bad_duration' } };

  // startISO must be one of the canonical slots for that date
  if (!slotsForDate(String(date)).includes(String(startISO))) {
    return { status: 422, body: { error: 'bad_slot' } };
  }
  // Must end within the availability window
  if (Date.parse(startISO) + duration * 60000 > Date.parse(windowEndISO(String(date)))) {
    return { status: 422, body: { error: 'past_window_end' } };
  }
  // No past slots
  if (Date.parse(startISO) <= Date.now()) return { status: 422, body: { error: 'past_slot' } };

  // Authoritative conflict re-check
  const list = await activeBookings(String(date));
  if (overlaps(String(startISO), Number(duration), list)) {
    return { status: 409, body: { error: 'slot_taken' } };
  }

  const id = crypto.randomUUID();
  const hold_expires = new Date(Date.now() + bookingConfig.holdMinutes * 60000).toISOString();
  const record = { id, date, start_iso: startISO, duration_min: Number(duration), status: 'held', hold_expires };

  if (usingSupabase()) await sb('bookings', { method: 'POST', body: JSON.stringify(record) });
  else memory.set(id, record);

  return { status: 200, body: { holdId: id, holdExpires: hold_expires } };
}

async function confirmHold(p) {
  const { holdId, name, email, method, txnId, notes } = p || {};
  if (typeof holdId !== 'string' || !/^[0-9a-f-]{36}$/i.test(holdId)) {
    return { status: 422, body: { error: 'bad_hold' } };
  }
  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const cName = clean(name, 100);
  const cEmail = clean(email, 150);
  const cTxn = clean(txnId, 100);
  const cMethod = method === 'bank' ? 'bank' : 'payoneer';
  const cNotes = clean(notes, 500);
  if (!cName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail) || cTxn.length < 4) {
    return { status: 422, body: { error: 'bad_details' } };
  }

  // Load the hold (must still be active)
  let record = null;
  if (usingSupabase()) {
    const rows = await sb(`bookings?id=eq.${holdId}&select=*`);
    record = rows[0];
  } else {
    record = memory.get(holdId);
  }
  const active =
    record &&
    record.status === 'held' &&
    record.hold_expires > new Date().toISOString();
  if (!active) return { status: 410, body: { error: 'hold_expired' } };

  // Move to pending_verification — the slot stays reserved while Zuhaib
  // manually verifies the transaction ID (expiry intentionally cleared)
  const updated = {
    ...record,
    status: 'pending_verification',
    hold_expires: null,
    name: cName,
    email: cEmail,
    method: cMethod,
    txn_id: cTxn,
    notes: cNotes,
  };
  if (usingSupabase()) {
    await sb(`bookings?id=eq.${holdId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: 'pending_verification',
        hold_expires: null,
        name: cName,
        email: cEmail,
        method: cMethod,
        txn_id: cTxn,
        notes: cNotes,
      }),
    });
  } else {
    memory.set(holdId, updated);
  }

  // Email Zuhaib with all details (same Resend setup as the contact form)
  const emailSent = await sendBookingEmail(updated);
  if (!emailSent) return { status: 200, body: { ok: true, emailSent: false } };
  return { status: 200, body: { ok: true, emailSent: true } };
}

/* Booking email — subject format per spec */
async function sendBookingEmail(r) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const to = process.env.CONTACT_TO || 'zuhaibmahar234@gmail.com';
  const from = process.env.RESEND_FROM || 'Zuhaib Ahmed — Bookings <onboarding@resend.dev>';

  // Times rendered in PKT for Zuhaib
  const startPKT = new Date(Date.parse(r.start_iso) + PKT_OFFSET_MS);
  const dateLabel = startPKT.toLocaleDateString('en-GB', { timeZone: 'UTC' });
  const timeLabel = startPKT.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: r.email,
        subject: `Paid Call Request — ${r.name} — ${dateLabel} ${timeLabel} (${r.duration_min} min)`,
        text: [
          `Paid call request (pending verification)`,
          ``,
          `Date: ${dateLabel} (PKT session)`,
          `Start: ${timeLabel} PKT`,
          `Duration: ${r.duration_min} minutes`,
          `Price: PKR ${(r.duration_min / 30) * bookingConfig.blockPKR} / ~$${(r.duration_min / 30) * bookingConfig.blockUSD}`,
          `Payment method: ${r.method === 'bank' ? 'Bank Transfer — Meezan Bank (PKR)' : 'Payoneer (USD)'}`,
          `Transaction ID: ${r.txn_id}`,
          ``,
          `Visitor: ${r.name} <${r.email}>`,
          r.notes ? `Notes: ${r.notes}` : '',
          ``,
          `Verify the transaction ID against your Payoneer/bank records, then reply to confirm.`,
          `Booking id: ${r.id}`,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/** Rate limiting (5/min per IP — tighter than chat) */
export function bookingRateLimited(req) {
  return rateLimited(`book:${clientKeyFromReq(req)}`);
}
