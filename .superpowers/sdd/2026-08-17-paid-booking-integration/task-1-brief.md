# Task 1 Brief — Wire BookingFlow into the Contact modal

**Project:** Zuhaib Ahmed portfolio (React 19 + Vite 6 + Tailwind 3 + Framer Motion). The custom paid booking flow (`src/components/BookingFlow.jsx`) and its backend (`api/_bookings.mjs`) already exist and are complete, but `Contact.jsx` still renders an old two-tab modal (free Calendly embed + a legacy paid flow). This task makes the modal paid-consulting-only and renders `BookingFlow` directly.

**Files:**
- Modify: `src/components/Contact.jsx`

**Global constraints that bind this task:**
- Paid-only: the modal must NOT contain a free-call path or any Calendly embed/URL.
- Keep existing architecture: do not restructure `BookingFlow.jsx`, `api/_bookings.mjs`, `vite.config.js`, or `bookingConfig`.
- Copy rule: success/copy must say "pending verification" — never "booked". CTA copy: "Prefer talking? Book a paid consulting session."
- No test framework in this repo — verify with `npm run build` (exit 0) plus grep checks.
- No git repo — do not run git commands; do not commit.
- Mirror Contact.jsx's existing header-comment style; do not add stray inline comments elsewhere.

## Steps

### Step 1: Trim the React and lucide imports

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

### Step 2: Trim data/ui imports and add BookingFlow

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

### Step 3: Update the file's header comment

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

### Step 4: Delete `CALENDLY_URL` + `CalendlyEmbed`

Delete everything from the `const CALENDLY_URL = 'https://calendly.com/zuhaibmahar234/30min';` line through the closing brace of the `CalendlyEmbed` function (currently lines 17–92), i.e. up to and including the line `}` that closes `CalendlyEmbed` and the blank line after it. The `inputCls` constant above it **stays** — the general contact form still uses it.

### Step 5: Delete the old `PaidSessionFlow`

Delete everything from the `/* ---...` comment block that begins "PAID path — deliberately does NOT touch Calendly." (currently lines 94–101) through the closing brace of the `PaidSessionFlow` function and the blank line before `export default function Contact()` (currently lines 102–365).

After this step, the file's first `export default function Contact() {` is immediately preceded only by the trimmed imports, the header comment, `inputCls`, and a blank line.

### Step 6: Remove the `bookTab` state

Inside `Contact()` delete the line:

```jsx
  const [bookTab, setBookTab] = useState('free'); // 'free' | 'paid'
```

Keep `const [bookOpen, setBookOpen] = useState(false);`.

### Step 7: Update the CTA copy

Replace:

```jsx
            <p className="text-sm text-muted">Prefer talking? Book a free intro call — or a paid consulting session.</p>
```

with:

```jsx
            <p className="text-sm text-muted">Prefer talking? Book a paid consulting session.</p>
```

### Step 8: Replace the two-path modal block with the single-path modal

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

### Step 9: Verify build

Run: `npm run build`
Expected: exit 0, no import/syntax errors.

### Step 10: Verify no stale references remain

Run in `src/`:
`grep -rn "CalendlyEmbed\|PaidSessionFlow\|CALENDLY_URL\|bookTab\|paymentDetails\|CopyValueButton" src/components/Contact.jsx`
Expected: no matches in `Contact.jsx`.

## Verification evidence to report

Report the exact `npm run build` tail (last ~5 lines) and the grep result (no matches), plus any concerns. Note: the line numbers above are as of the file at plan-writing time; re-locate by content if the file changed.