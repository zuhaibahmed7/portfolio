# Paid Booking Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Book a Call" feature paid-consulting-only by wiring the existing `BookingFlow` into the Contact modal, removing the free Calendly path and the old paid flow.

**Architecture:** The custom 5-step booking flow (`BookingFlow.jsx`) and its backend (`api/_bookings.mjs`) already exist and are complete — they just aren't rendered anywhere. This plan removes the old Calendly/two-tab modal from `Contact.jsx`, renders `BookingFlow` directly, deletes the dead `paymentDetails.prices` data, and documents the Supabase setup.

**Tech Stack:** React 19 · Vite 6 · Tailwind 3 · Framer Motion · lucide-react

## Global Constraints

- **Paid-only:** The Book a Call modal must NOT contain a free-call path or any Calendly embed/URL.
- **Keep existing architecture:** Do not restructure `BookingFlow.jsx`, `api/_bookings.mjs`, `vite.config.js`, or `bookingConfig`. They already match the spec.
- **Copy rule:** Success/copy must say "pending verification" — never "booked". CTA copy: "Prefer talking? Book a paid consulting session."
- **No test framework exists** in this repo (package.json has no `test` script). Verification is `npm run build` (must exit 0) plus grep checks and manual dev-server review.
- **No git repo** in this folder — skip all `git commit` steps.
- **Don't add comments to new code** unless the surrounding file already uses explanatory header comments (Contact.jsx does — mirror that style).

---

### Task 1: Wire BookingFlow into the Contact modal

**Files:**
- Modify: `src/components/Contact.jsx`

**Interfaces:**
- Consumes: `BookingFlow` (default export from `./BookingFlow.jsx`, renders the full 5-step flow, no props), `Modal` (existing `wide` prop), `profile`, `socials`, `useView`, `ui.jsx` helpers, `track`.
- Produces: `Contact` (default export, unchanged signature) with a single-path paid modal.

- [ ] **Step 1: Trim the React and lucide imports**

Replace the current import lines 1–2:

```jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, Github, Hourglass, Landmark, Linkedin, Mail, Phone, Send, Youtube } from 'lucide-react';
```

with:

```jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Github, Linkedin, Mail, Phone, Send, Youtube } from 'lucide-react';
```

(`useRef`, `Clock`, `CreditCard`, `Hourglass`, `Landmark` were only used by the components being deleted below.)

- [ ] **Step 2: Trim data/ui imports and add BookingFlow**

Replace the import lines 4–8:

```jsx
import { paymentDetails, profile, socials } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { CopyEmailButton, CopyValueButton, Magnetic, Reveal, SectionHeading } from './ui.jsx';
import Modal from './Modal.jsx';
import { track } from '../analytics.js';
```

with:

```jsx
import { profile, socials } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { CopyEmailButton, Magnetic, Reveal, SectionHeading } from './ui.jsx';
import Modal from './Modal.jsx';
import BookingFlow from './BookingFlow.jsx';
import { track } from '../analytics.js';
```

(`paymentDetails` and `CopyValueButton` were only used by the old `PaidSessionFlow`.)

- [ ] **Step 3: Update the file's header comment**

Replace the header comment (currently lines 10–15):

```jsx
/* ---------------------------------------------------------------------------
   Contact section — glowing channels, two-path Book a Call modal
   (Free Intro Call = instant Calendly self-service; Paid Consulting Session =
   pay externally then submit a confirmation form, manually verified), and the
   general contact form (Resend-backed with mailto fallback).
--------------------------------------------------------------------------- */
```

with:

```jsx
/* ---------------------------------------------------------------------------
   Contact section — glowing channels, single-path paid Book a Call modal
   (custom multi-step flow in BookingFlow: pick slot → duration → price →
   hold → payment confirmation), and the general contact form (Resend-backed
   with mailto fallback). General inquiries use email + the contact form.
--------------------------------------------------------------------------- */
```

- [ ] **Step 4: Delete `CALENDLY_URL` + `CalendlyEmbed`**

Delete everything from the `const CALENDLY_URL = 'https://calendly.com/zuhaibmahar234/30min';` line through the closing brace of the `CalendlyEmbed` function (currently lines 17–92), i.e. up to and including the line `}` that closes `CalendlyEmbed` and the blank line after it. The `inputCls` constant above it **stays** — the general contact form still uses it.

- [ ] **Step 5: Delete the old `PaidSessionFlow`**

Delete everything from the `/* ---...` comment block that begins "PAID path — deliberately does NOT touch Calendly." (currently lines 94–101) through the closing brace of the `PaidSessionFlow` function and the blank line before `export default function Contact()` (currently lines 102–365).

After this step, the file's first `export default function Contact() {` is immediately preceded only by the trimmed imports, the header comment, `inputCls`, and a blank line.

- [ ] **Step 6: Remove the `bookTab` state**

Inside `Contact()` delete the line:

```jsx
  const [bookTab, setBookTab] = useState('free'); // 'free' | 'paid'
```

Keep `const [bookOpen, setBookOpen] = useState(false);`.

- [ ] **Step 7: Update the CTA copy**

Replace:

```jsx
            <p className="text-sm text-muted">Prefer talking? Book a free intro call — or a paid consulting session.</p>
```

with:

```jsx
            <p className="text-sm text-muted">Prefer talking? Book a paid consulting session.</p>
```

- [ ] **Step 8: Replace the two-path modal block with the single-path modal**

Replace the whole block from the `{/* -----...` comment line that begins "Two-path booking modal:" (currently lines 609–662) down to the matching `</Modal>` through the end of the file's closing JSX with:

```jsx
      {/* Paid consulting booking — custom multi-step flow (no free call path) */}
      <Modal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        title="Book a paid consulting call"
        subtitle="Pick a time slot, reserve it, and confirm after payment."
        wide
      >
        <BookingFlow />
      </Modal>
```

Ensure the section's closing `</div>` and `</section>` are preserved below the `</Modal>`.

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: exit 0, no import/syntax errors.

- [ ] **Step 10: Verify no stale references remain**

Run in `src/`:
`grep -rn "CalendlyEmbed\|PaidSessionFlow\|CALENDLY_URL\|bookTab\|paymentDetails\|CopyValueButton" src/components/Contact.jsx`
Expected: no matches in `Contact.jsx`.

---

### Task 2: Remove dead `paymentDetails.prices`

**Files:**
- Modify: `src/data/content.js:276-295`

**Interfaces:**
- Consumes: nothing (deletion only).
- Produces: `paymentDetails` still exporting `payoneer`, `bank`, `disclaimer` — the fields `BookingFlow.jsx` reads (`paymentDetails.payoneer.label/accountName/customerId`, `paymentDetails.bank.label/accountTitle/accountNumber`, `paymentDetails.disclaimer`). No code references `paymentDetails.prices` after Task 1.

- [ ] **Step 1: Delete the `prices` array**

In `paymentDetails`, remove the `prices:` array (currently lines 277–280):

```js
  prices: [
    { duration: '30 minutes', pkr: 'PKR 5,000', usd: '~$18' },
    { duration: '1 hour', pkr: 'PKR 10,000', usd: '~$36' },
  ],
```

so `paymentDetails` starts directly with `payoneer: {`.

- [ ] **Step 2: Verify no references remain**

Run: `grep -rn "paymentDetails.prices" src/`
Expected: no matches.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit 0.

---

### Task 3: Document the Supabase booking backend

**Files:**
- Modify: `.env.example` (append a section)
- Modify: `README.md` (append a section under "Security posture")

**Interfaces:**
- Consumes: the env var names read by `api/_bookings.mjs` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) and the table columns it writes/reads (`date`, `start_iso`, `duration_min`, `status`, `hold_expires`, `name`, `email`, `method`, `txn_id`, `notes`, `id`).
- Produces: documentation only — no code behavior change.

- [ ] **Step 1: Append Supabase vars to `.env.example`**

Append to `.env.example`:

```bash

# ---------------------------------------------------------------------------
# Paid booking conflict detection (optional) — without these the booking API
# falls back to per-runtime in-memory storage (works locally; on serverless
# it only enforces holds within a single warm instance).
# TODO: create a free Supabase project + the `bookings` table (SQL in README
# "Custom booking (paid calls)"), then fill these in.
# ---------------------------------------------------------------------------
#SUPABASE_URL=https://<project-ref>.supabase.co
#SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 2: Append a README section**

Append to `README.md` (after the "Security posture" section, before "### Manual steps"):

```markdown
### Custom booking (paid calls)

The "Book a Call" modal is a paid-consulting-only custom flow: pick a slot
within Zuhaib's 10:00 PM–1:00 AM PKT window, choose a duration, see a live
price, and reserve the slot for 15 minutes while completing payment. Backend:
`POST /api/bookings` (hold + confirm), wired via `api/bookings.js` on Vercel
and the vite middleware locally.

For **cross-visitor conflict detection**, create a free Supabase project and
table:

```sql
create table public.bookings (
  id uuid primary key,
  date date not null,
  start_iso timestamptz not null,
  duration_min int not null,
  status text not null default 'held',
  hold_expires timestamptz,
  name text,
  email text,
  method text,
  txn_id text,
  notes text,
  created_at timestamptz not null default now()
);
```

Then set these env vars (local `.env` and your host's dashboard):

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | for cross-visitor holds | Project URL, e.g. `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | for cross-visitor holds | Publishable anon key |

Without them, the API uses an in-memory store — fine locally, but only
enforces holds within a single warm serverless instance.

**Manual confirmation habit:** on submit the record becomes
`pending_verification` and Zuhaib gets an email with the transaction ID.
Verify it against your Payoneer/bank records, reply to confirm, then update
the record's `status` to `confirmed` in Supabase. The site never claims the
call is booked before that step.
```

- [ ] **Step 3: Verify the README renders as intended**

Run: `Select-String -Path README.md -Pattern "Custom booking|SUPABASE_URL|pending_verification" | Select-Object LineNumber,Line`
Expected: the new section's heading and both env var names appear.

---

## Self-Review Notes

- **Spec coverage:** Task 1 covers spec §1 (remove Calendly), §2-5 (renders existing BookingFlow, which already implements the slot picker, duration, pricing, conflict detection, payment form), the paid-only copy, and progress indicator (already in BookingFlow). Task 2 removes the dead `prices` array. Task 3 covers the Supabase/setup documentation and manual-confirmation habit. The input-contrast fix and dark-glass styling are already present in `index.css` and `BookingFlow.jsx` — no change needed.
- **Placeholder scan:** all edits carry exact before/after content; no TBD steps.
- **Type consistency:** `BookingFlow` default export, `Modal` `wide` prop, `paymentDetails.*` field names all match existing code (verified against current sources).