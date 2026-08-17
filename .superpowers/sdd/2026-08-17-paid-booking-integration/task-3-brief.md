# Task 3 Brief — Document the Supabase booking backend

**Project:** Zuhaib Ahmed portfolio. The paid booking backend (`api/_bookings.mjs`) already reads `SUPABASE_URL` + `SUPABASE_ANON_KEY` env vars, with an in-memory fallback when they're absent. This task documents that setup so the owner can enable cross-visitor conflict detection.

**Files:**
- Modify: `.env.example` (append a section)
- Modify: `README.md` (append a section after the "Security posture" section, before the "### Manual steps" heading)

**Global constraints that bind this task:**
- Documentation only — no code behavior change. Do not modify any source or API file.
- The env var names must match what `api/_bookings.mjs` reads exactly: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- The table column names must match what `api/_bookings.mjs` writes/reads exactly: `date`, `start_iso`, `duration_min`, `status`, `hold_expires`, `name`, `email`, `method`, `txn_id`, `notes`, `id`.
- No git repo — do not run git commands; do not commit.

## Steps

### Step 1: Append Supabase vars to `.env.example`

Append to the end of `.env.example` exactly:

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

### Step 2: Append a README section

In `README.md`, insert this block right after the "Security posture" section and before the "### Manual steps (outside the coding tool)" heading:

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

Note: the README already uses ``` fenced code blocks, so the inner SQL fence inside your inserted markdown must render correctly — the README section itself is not inside another fence, so plain nesting is fine.

### Step 3: Verify the README renders as intended

Run: `Select-String -Path README.md -Pattern "Custom booking|SUPABASE_URL|pending_verification" | Select-Object LineNumber,Line`
Expected: the new section heading and both env var names appear with line numbers.

## Verification evidence to report

Report the `Select-String` output and any concerns.