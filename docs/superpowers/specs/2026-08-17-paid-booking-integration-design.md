# Paid Booking Integration — Design

**Date:** 2026-08-17
**Status:** Approved (design reviewed 2026-08-17)

## Goal

Make the "Book a Call" feature paid-consulting-only by wiring the existing
custom booking flow (`BookingFlow.jsx`) into the Contact section's modal,
removing the free Calendly intro-call path entirely, and deleting the
now-redundant old paid flow. General inquiries remain covered by the existing
contact form and email channels.

## Current state (what already exists)

- `src/components/BookingFlow.jsx` — fully built 5-step custom flow:
  1. **Date & Time** — next-14-days picker; 10:00 PM–1:00 AM PKT window in
     30-minute slots; displayed in the visitor's local timezone, stored/compared
     in absolute UTC; unavailable/held slots grayed out.
  2. **Duration** — 30/60/90/120 min; validated against the 1:00 AM PKT window
     end and overlap with existing bookings.
  3. **Price** — live per-block calculation from `bookingConfig`
     (`blockPKR = 5000`, `blockUSD = 18` per 30-min block).
  4. **Reserved (hold)** — calls the server, which creates a 15-minute `held`
     record with a `hold_expires` timestamp; UI shows a countdown.
  5. **Payment** — shows Payoneer (USD) + Bank Transfer (PKR) details, a
     confirmation form (Name, Email, Transaction ID, Notes), and a success
     state that says "pending verification" (never "booked").
  - Includes a 5-step progress breadcrumb and the shared dark-glass/Framer
    Motion styling. NOT yet imported anywhere.
- `api/bookings.js` + `api/_bookings.mjs` — backend:
  - `GET /api/bookings?date=YYYY-MM-DD` → active (non-expired) bookings.
  - `POST { action: 'hold' }` → server-authoritative conflict re-check; creates
    a `held` record with 15-min expiry; returns `holdId`/`holdExpires`.
  - `POST { action: 'confirm' }` → validates, moves record to
    `pending_verification` (hold expiry cleared), emails Zuhaib, returns `ok`.
  - Supabase REST storage when `SUPABASE_URL` + `SUPABASE_ANON_KEY` env vars are
    set; otherwise an in-memory `Map` fallback (per runtime instance).
  - Rate limiting via `bookingRateLimited` (5/min per IP).
- `vite.config.js` — `/api/bookings` middleware mounted for dev/preview,
  mirroring the Vercel serverless function.
- `src/data/content.js` — `bookingConfig` (single source of truth for window,
  slots, pricing, hold minutes) and `paymentDetails` (payoneer/bank/disclaimer).
- `src/index.css` — global input contrast rules (dark/light) already handle
  typed-input visibility.

## Changes

### 1. `src/components/Contact.jsx` — single-path paid modal

- Delete `CALENDLY_URL`, the `CalendlyEmbed` component, and the
  `PaidSessionFlow` component.
- Import `BookingFlow` from `./BookingFlow.jsx`.
- Remove the tab switcher (`role="tablist"`) and the `bookTab` state; the modal
  renders `BookingFlow` directly.
- Keep the `Modal` component with `wide` (the slot grid needs the width), Esc /
  backdrop close, and the existing `bookOpen` state.
- Update copy to paid-only:
  - CTA line: "Prefer talking? Book a paid consulting session."
  - Modal `title`: "Book a paid consulting call"; `subtitle`:
    "Pick a time slot, reserve it, and confirm after payment."
- Trim now-unused lucide imports to what the remaining JSX actually uses
  (`Calendar` stays for the CTA button; `Mail`, `Send` etc. re-checked).

### 2. `src/data/content.js` — remove dead pricing data

- Remove `paymentDetails.prices` (only consumed by the deleted
  `PaidSessionFlow`). `BookingFlow` computes totals from `bookingConfig`.
- Keep `paymentDetails.payoneer`, `paymentDetails.bank`, and
  `paymentDetails.disclaimer` — `BookingFlow` renders these.

### 3. Setup docs for the booking backend

- `.env.example`: add `SUPABASE_URL=` and `SUPABASE_ANON_KEY=` under a short
  comment (both optional; without them the in-memory fallback applies).
- `README.md`: add a "Custom booking (paid calls)" section with:
  - The Supabase `bookings` table SQL (columns expected by `_bookings.mjs`:
    `date`, `start_iso`, `duration_min`, `status`, `hold_expires`, `name`,
    `email`, `method`, `txn_id`, `notes`, `id`).
  - Env var table for `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
  - Note the in-memory fallback behavior and the manual-confirmation habit
    (Zuhaib verifies transaction IDs, then sets the record to `confirmed`).

## Out of scope

- Admin view for confirming bookings.
- Stripe / JazzCash / Easypaisa automated payment confirmation (requires a
  registered merchant account — this build keeps the manual verification path).
- Cron-based hold cleanup (expiry is a compare-on-read filter).

## Verification

- `npm run build` succeeds (no unused-import or syntax errors from the Contact
  changes).
- Manual: `npm run dev` → Contact section → "Book a Call" opens the single paid
  flow (no tab switcher, no Calendly embed); the 5 steps render and the
  availability API responds at `/api/bookings`.