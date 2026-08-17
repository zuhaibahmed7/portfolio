import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  Hourglass,
  Landmark,
  Send,
} from 'lucide-react';
import { bookingConfig, paymentDetails, profile } from '../data/content.js';
import { track } from '../analytics.js';

/* ---------------------------------------------------------------------------
   Custom paid booking flow (replaces Calendly entirely):

     1 · Pick date & time   — next 14 days, 10 PM–1 AM PKT window in 30-min
                              slots, shown in the VISITOR's local timezone
                              (stored/compared as absolute UTC internally)
     2 · Pick duration      — 30/60/90/120 min, capped by the 1 AM window end
     3 · Price              — live per-block calculation, then "Reserve slot"
                              creates a 15-minute HOLD (server-verified)
     4 · Hold               — countdown while the slot is reserved
     5 · Payment form       — pay externally, submit confirmation → slot moves
                              to pending_verification + Zuhaib gets an email

   The success state never says "booked" — the call is only final after
   Zuhaib manually verifies the transaction ID and replies by email.
--------------------------------------------------------------------------- */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const inputCls =
  'w-full rounded-xl border border-white/10 px-4 py-3 text-sm outline-none backdrop-blur transition-all duration-300 focus:border-accent-cyan/60 focus:shadow-glow-cyan';

const STEPS = ['Date & Time', 'Duration', 'Price', 'Reserved', 'Payment'];

/* Candidate start slots for a session date (PKT window, as absolute UTC).
   Empty/invalid dates return [] — slotsForDate runs on every render, so an
   unselected date must not crash the flow. */
function slotsForDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return [];
  const out = [];
  for (let h = bookingConfig.windowStartHourPKT; h < bookingConfig.windowEndHourPKT; h++) {
    for (let mm = 0; mm < 60; mm += bookingConfig.slotMinutes) {
      out.push(new Date(Date.UTC(y, m - 1, d, h, mm) - PKT_OFFSET_MS).toISOString());
    }
  }
  return out;
}
const windowEnd = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d, bookingConfig.windowEndHourPKT, 0) - PKT_OFFSET_MS;
};

const fmtLocal = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtPKT = (iso) =>
  new Date(Date.parse(iso) + PKT_OFFSET_MS).toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  });
const tzLabel = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time';
  } catch {
    return 'your time';
  }
};

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [startISO, setStartISO] = useState('');
  const [duration, setDuration] = useState(30);
  const [bookings, setBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [holdId, setHoldId] = useState('');
  const [holdExpires, setHoldExpires] = useState(0); // epoch ms
  const [nowMs, setNowMs] = useState(Date.now());
  const [holdError, setHoldError] = useState('');

  // Payment form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('payoneer');
  const [txnId, setTxnId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed

  /* Next 14 days as picker chips */
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 0; i < bookingConfig.maxDaysAhead; i++) {
      const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + i));
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, []);

  /* Fetch active bookings whenever the picked date changes */
  const loadBookings = useCallback(async (d) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/bookings?date=${d}`);
      const data = await res.json().catch(() => ({ bookings: [] }));
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch {
      setBookings([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (date) loadBookings(date);
  }, [date, loadBookings]);

  /* Hold countdown ticker (also releases the UI when the hold expires) */
  useEffect(() => {
    if (step < 4 || !holdExpires) return undefined;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, holdExpires]);

  const holdRemaining = Math.max(0, holdExpires - nowMs);
  const holdExpired = step >= 4 && holdExpires && holdRemaining === 0;

  /* Slot availability (client-side view of server truth; server re-checks) */
  const activeList = bookings.filter(
    (b) => b.status !== 'held' || (b.holdExpires && Date.parse(b.holdExpires) > nowMs)
  );
  const slotTaken = (iso) =>
    activeList.some((b) => {
      const s = Date.parse(b.startISO);
      const e = s + b.duration * 60000;
      const t = Date.parse(iso);
      return t < e && s < t + bookingConfig.slotMinutes * 60000;
    });
  const durationFits = (mins) =>
    !!startISO && Date.parse(startISO) + mins * 60000 <= windowEnd(date) && !overlapsSelection(mins);
  const overlapsSelection = (mins) =>
    !!startISO &&
    activeList.some((b) => {
      const s = Date.parse(b.startISO);
      const e = s + b.duration * 60000;
      const t = Date.parse(startISO);
      return t < e && s < t + mins * 60000;
    });

  const futureSlots = slotsForDate(date).filter((iso) => Date.parse(iso) > Date.now() + 15 * 60000);
  const anyAvailable = date && futureSlots.some((iso) => !slotTaken(iso));

  /* Dynamic price */
  const blocks = duration / 30;
  const totalPKR = blocks * bookingConfig.blockPKR;
  const totalUSD = blocks * bookingConfig.blockUSD;

  /* Step 3 → server hold */
  const reserveSlot = async () => {
    setHoldError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hold', date, startISO, duration }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.holdId) {
        track('Slot Hold Created');
        setHoldId(data.holdId);
        setHoldExpires(Date.parse(data.holdExpires));
        setNowMs(Date.now());
        setStep(5);
      } else if (res.status === 409) {
        setHoldError('Someone just took that slot — picking a new time.');
        await loadBookings(date);
        setStep(1);
      } else {
        setHoldError('Could not reserve the slot right now — please try again.');
      }
    } catch {
      setHoldError('Network hiccup — please try again.');
    }
  };

  /* Step 5 validation + submit */
  const validate = () => {
    const next = {};
    if (!name.trim() || name.trim().length > 100) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!txnId.trim() || txnId.trim().length < 4) next.txnId = 'Enter the transaction/reference ID (≥4 chars).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitConfirmation = async (e) => {
    e.preventDefault();
    if (status === 'sending' || !validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', holdId, name, email, method, txnId, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        track('Booking Confirmation Submitted');
        setStatus('sent');
      } else if (res.status === 410) {
        setHoldError('Your 15-minute hold expired — the slot was released. Please pick a time again.');
        setStep(1);
        setStatus('idle');
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  /* ---------- success (pending verification) ---------- */
  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-gradient-accent shadow-glow"
        >
          <Hourglass size={24} strokeWidth={2} className="text-white" />
        </motion.span>
        <p className="font-display text-lg font-semibold text-ink">Your slot is reserved pending payment verification</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Zuhaib will confirm by email within 24 hours. A summary was sent to him with your booking and
          payment details.
        </p>
        <p className="text-[11px] text-muted">
          Your session is <span className="font-semibold text-accent-cyan">pending verification</span> — it isn&apos;t
          final until you receive the confirmation email.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ---------- progress indicator ---------- */}
      <ol className="mb-6 flex items-center justify-between gap-1" aria-label="Booking progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const current = step === n;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                  current
                    ? 'bg-gradient-accent text-white shadow-glow'
                    : done
                      ? 'bg-accent-violet/30 text-ink'
                      : 'border border-white/15 text-muted'
                }`}
                aria-current={current ? 'step' : undefined}
              >
                {done ? <Check size={12} strokeWidth={3} /> : n}
              </span>
              <span className={`hidden text-[9px] font-medium uppercase tracking-wider sm:block ${current ? 'text-ink' : 'text-muted'}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {holdError && (
        <p className="mb-4 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.06] px-4 py-2.5 text-xs text-accent-pink">
          {holdError}
        </p>
      )}

      {/* ---------- STEP 1 · date & time ---------- */}
      {step === 1 && (
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <CalendarDays size={13} className="text-accent-cyan" />
            Pick a day (next 14)
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const dt = new Date(`${d}T00:00:00Z`);
              const active = date === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDate(d);
                    setStartISO('');
                  }}
                  aria-pressed={active}
                  className={`flex w-14 shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition-all duration-200 ${
                    active
                      ? 'border-accent-violet/60 bg-accent-violet/15 text-ink shadow-glow'
                      : 'border-white/10 text-muted hover:border-white/25 hover:text-ink'
                  }`}
                >
                  <span className="text-[9px] uppercase">
                    {dt.toLocaleDateString([], { weekday: 'short', timeZone: 'UTC' })}
                  </span>
                  <span className="font-display text-base font-bold">{dt.getUTCDate()}</span>
                </button>
              );
            })}
          </div>

          {date && (
            <>
              <p className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                <Clock size={13} className="text-accent-cyan" />
                Start time — shown in {tzLabel()} (window 10 PM–1 AM PKT)
              </p>
              {loadingSlots ? (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-xl bg-white/[0.05]" />
                  ))}
                </div>
              ) : !anyAvailable ? (
                <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-muted">
                  No availability on{' '}
                  {new Date(`${date}T00:00:00Z`).toLocaleDateString([], { dateStyle: 'long', timeZone: 'UTC' })} —
                  please pick another day.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {futureSlots.map((iso) => {
                    const taken = slotTaken(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={taken}
                        onClick={() => setStartISO(iso)}
                        aria-pressed={startISO === iso}
                        title={taken ? 'Unavailable' : `${fmtPKT(iso)} PKT`}
                        className={`rounded-xl border px-2 py-2.5 text-center transition-all duration-200 ${
                          taken
                            ? 'cursor-not-allowed border-white/5 text-muted/40 line-through'
                            : startISO === iso
                              ? 'border-accent-violet/60 bg-accent-violet/15 text-ink shadow-glow'
                              : 'border-white/10 text-muted hover:border-white/25 hover:text-ink'
                        }`}
                      >
                        <span className="font-display text-sm font-semibold">{fmtLocal(iso)}</span>
                        <span className="block text-[9px] opacity-70">{fmtPKT(iso)} PKT</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!date || !startISO}
              onClick={() => setStep(2)}
              className="btn-primary !px-6 !py-2.5 !text-xs disabled:opacity-40"
            >
              Choose duration
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ---------- STEP 2 · duration ---------- */}
      {step === 2 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Duration — capped by the 1:00 AM PKT window end
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[30, 60, 90, 120].map((m) => {
              const fits = durationFits(m);
              return (
                <button
                  key={m}
                  type="button"
                  disabled={!fits}
                  onClick={() => setDuration(m)}
                  aria-pressed={duration === m}
                  title={fits ? '' : 'Would run past 1:00 AM PKT or overlap a booking'}
                  className={`rounded-xl border px-3 py-3 text-center transition-all duration-200 ${
                    !fits
                      ? 'cursor-not-allowed border-white/5 text-muted/40'
                      : duration === m
                        ? 'border-accent-violet/60 bg-accent-violet/15 text-ink shadow-glow'
                        : 'border-white/10 text-muted hover:border-white/25 hover:text-ink'
                  }`}
                >
                  <span className="font-display text-sm font-semibold">{m} min</span>
                  <span className="block text-[10px] opacity-70">
                    PKR {((m / 30) * bookingConfig.blockPKR).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost !px-5 !py-2.5 !text-xs">
              <ArrowLeft size={14} />
              Back
            </button>
            <button type="button" onClick={() => setStep(3)} className="btn-primary !px-6 !py-2.5 !text-xs">
              See price
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ---------- STEP 3 · price + reserve ---------- */}
      {step === 3 && (
        <div>
          <div className="glass-card--border-gradient glass-card rounded-2xl p-5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {duration >= 60 ? `${duration / 60} hour${duration > 60 ? 's' : ''} session` : `${duration} min session`}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-gradient">
              PKR {totalPKR.toLocaleString()} <span className="text-muted">/</span> ~${totalUSD} USD
            </p>
            <p className="mt-1 text-xs text-muted">
              {new Date(startISO).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} · {fmtPKT(startISO)}{' '}
              PKT start
            </p>
            <p className="mt-2 text-[11px] text-muted">
              {blocks} × 30-min block (PKR {bookingConfig.blockPKR.toLocaleString()} / ~${bookingConfig.blockUSD})
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost !px-5 !py-2.5 !text-xs">
              <ArrowLeft size={14} />
              Back
            </button>
            <button type="button" onClick={reserveSlot} className="btn-primary !px-6 !py-2.5 !text-xs">
              Reserve this slot
              <ArrowRight size={14} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            Reserving holds the slot for {bookingConfig.holdMinutes} minutes while you complete payment.
          </p>
        </div>
      )}

      {/* ---------- STEP 5 · payment (4 is the hold itself) ---------- */}
      {step === 5 && (
        <div>
          {holdExpired ? (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="font-display text-sm font-semibold text-ink">Your 15-minute hold expired</p>
              <p className="mt-1 text-xs text-muted">The slot was released — please pick a time again.</p>
              <button type="button" onClick={() => setStep(1)} className="btn-primary mt-4 !px-6 !py-2.5 !text-xs">
                Pick a new time
              </button>
            </div>
          ) : (
            <>
              {/* Hold countdown */}
              <div className="glass-card flex items-center justify-between gap-3 rounded-2xl px-5 py-3">
                <p className="text-xs text-muted">
                  Slot reserved:{' '}
                  <span className="font-display font-semibold text-ink">
                    {new Date(startISO).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>{' '}
                  ({duration} min)
                </p>
                <span className="font-mono text-sm font-bold text-accent-cyan" aria-live="polite">
                  ⏳ {String(Math.floor(holdRemaining / 60000)).padStart(2, '0')}:
                  {String(Math.floor((holdRemaining % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>

              {/* Payment methods */}
              <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted">
                Pay via your preferred method
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div className={`glass-card rounded-2xl p-4 ${method === 'payoneer' ? 'border-accent-cyan/50' : ''}`}>
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                    <CreditCard size={15} className="text-accent-cyan" />
                    {paymentDetails.payoneer.label}
                  </p>
                  <p className="mt-2 text-[13px] text-muted">
                    {paymentDetails.payoneer.accountName} · ID{' '}
                    <span className="font-mono text-ink">{paymentDetails.payoneer.customerId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMethod('payoneer')}
                    aria-pressed={method === 'payoneer'}
                    className="mt-2 text-[11px] font-semibold text-accent-cyan"
                  >
                    {method === 'payoneer' ? '✓ Using this method' : 'Use this method'}
                  </button>
                </div>
                <div className={`glass-card rounded-2xl p-4 ${method === 'bank' ? 'border-accent-cyan/50' : ''}`}>
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                    <Landmark size={15} className="text-accent-violet" />
                    {paymentDetails.bank.label}
                  </p>
                  <p className="mt-2 text-[13px] text-muted">
                    {paymentDetails.bank.accountTitle} ·{' '}
                    <span className="font-mono text-ink">{paymentDetails.bank.accountNumber}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    aria-pressed={method === 'bank'}
                    className="mt-2 text-[11px] font-semibold text-accent-cyan"
                  >
                    {method === 'bank' ? '✓ Using this method' : 'Use this method'}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Total due: <span className="text-ink">PKR {totalPKR.toLocaleString()}</span> / ~${totalUSD} USD ·{' '}
                {paymentDetails.disclaimer}
              </p>

              {/* Confirmation form */}
              <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted">
                After paying, confirm below
              </p>
              <form onSubmit={submitConfirmation} className="glass-card mt-2 rounded-2xl p-5" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Name</span>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={`${inputCls} ${errors.name ? '!border-accent-pink/70' : ''}`}
                    />
                    {errors.name && <span className="mt-1.5 block text-xs text-accent-pink">{errors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Email</span>
                    <input
                      type="email"
                      required
                      maxLength={150}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`${inputCls} ${errors.email ? '!border-accent-pink/70' : ''}`}
                    />
                    {errors.email && <span className="mt-1.5 block text-xs text-accent-pink">{errors.email}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                      Transaction ID
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="From your payment receipt"
                      className={`${inputCls} ${errors.txnId ? '!border-accent-pink/70' : ''}`}
                    />
                    {errors.txnId && <span className="mt-1.5 block text-xs text-accent-pink">{errors.txnId}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                      Notes (optional)
                    </span>
                    <input
                      type="text"
                      maxLength={500}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Topics you'd like to cover…"
                      className={inputCls}
                    />
                  </label>
                </div>

                {status === 'failed' && (
                  <p className="mt-4 rounded-xl border border-accent-pink/30 bg-accent-pink/[0.06] px-4 py-3 text-xs text-accent-pink">
                    Couldn&apos;t submit right now — please email your transaction ID and time to {profile.email}.
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'} className="btn-primary mt-5 w-full disabled:opacity-60">
                  {status === 'sending' ? 'Submitting…' : 'Submit Payment Confirmation'}
                  <Send size={15} strokeWidth={2.2} />
                </button>
                <p className="mt-2 text-center text-[11px] text-muted">
                  Submitting reserves the slot pending verification — Zuhaib confirms by email within 24 hours.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
