# Zuhaib Ahmed â€” Portfolio

A single-page, animation-heavy developer portfolio with an embedded **"Ask Zuhaib's AI"** chatbot and a recruiter-focused feature pack (Quick/Detailed views, live GitHub feed, embedded demos, case study, and more).

**Stack:** React 19 Â· Vite 6 Â· Tailwind CSS 3 Â· Framer Motion Â· GSAP ScrollTrigger Â· Three.js (`@react-three/fiber` + `@react-three/drei`) Â· lucide-react â€” zero runtime dependencies beyond these.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (includes the /api/chat middleware)
```

## Production build

```bash
npm run build      # static site â†’ dist/
npm run preview    # serves dist/ + /api/chat locally on :4173
```

## Deploy

The site is a static build â€” deploy `dist/` to Vercel / Netlify / Hugging Face Spaces.

- **Vercel (recommended):** import the repo and deploy; the chatbot API works out of the box via `api/chat.js` (serverless function). Set the env vars below in *Project â†’ Settings â†’ Environment Variables*.
- **Netlify / HF Spaces:** deploy `dist/` as a static site and either port `api/_llm.mjs` to their function format, or rely on the chatbot's built-in local knowledge brain (works with zero backend).

## Chatbot backend (LLM) configuration

The chatbot calls `POST /api/chat` with the conversation history; the server
prepends the system prompt from `src/chatbot/knowledge.js` (single file to
update when Zuhaib adds projects/certs) and forwards everything to an
**OpenAI-compatible** `/chat/completions` endpoint. The API key never reaches
the browser.

Copy `.env.example` â†’ `.env` (local) or set them in your host's dashboard:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `LLM_API_KEY` | âœ… | â€” | Any OpenAI-compatible provider key |
| `LLM_BASE_URL` | â€” | `https://api.openai.com/v1` | e.g. `https://open.bigmodel.cn/api/paas/v4` (GLM), `https://dashscope.aliyuncs.com/compatible-mode/v1` (Qwen) |
| `LLM_MODEL` | â€” | `gpt-4o-mini` | e.g. `glm-4-flash`, `qwen-plus` |

**No key configured?** The chatbot still answers from an on-device knowledge
brain (`src/chatbot/localBrain.js`) that pattern-matches against the same data
as the site â€” including recruiter questions (graduation 2028, availability,
strongest area) and multi-turn follow-ups. Unanswered/failed questions are
logged client-side to `localStorage["za-chat-unanswered"]` so the knowledge
base can grow over time.

## Feature highlights

- **Quick View / Detailed View toggle** (hero) â€” condenses the whole site to a
  60-second recruiter scan; choice persists in localStorage
- **Live GitHub feed** â€” public-API stats, activity strip and recent repos,
  fetched only when scrolled into view; graceful rate-limit fallback
- **ResearchPilot**: embedded live demo (lazy iframe), full case-study modal,
  animated 4-agent architecture diagram with the self-critique loop
- **AgroVision**: animated radial accuracy gauges (98% / 88%) + linear pipeline diagram
- **"Now" card**, YouTube channel section, collapsible Notes/Writing section,
  Book a Call modal, testimonials grid
- Page-load intro, 3D particle hero (lazy, reduced-motion aware), magnetic
  buttons, custom cursor accent, GSAP timeline â€” all respecting `prefers-reduced-motion`

## âš ï¸ TODO before publishing (search the code for "TODO")

| Where | What |
|---|---|
| `src/data/content.js` â†’ `testimonials` | Replace the **fictional placeholder names/quotes** with real endorsements (the warning comment explains why) |
| `src/data/content.js` â†’ `nowUpdated` | Update the "Last updated" date whenever the "now" items change |
| Chatbot | Optionally set `LLM_API_KEY` for real LLM answers (local brain works without it) |

## Security posture

- **No secrets client-side** â€” the LLM API key lives only in `api/_llm.mjs` (server); the browser bundle contains zero keys/tokens
- **Rate limiting** â€” `/api/chat` allows 12 requests/min per IP (in-memory, per-runtime-instance)
- **Input caps** â€” chat 500 chars (client) / 1000 (server); contact form 100/150/2000 chars
- **XSS-safe** â€” all chat/API text renders as React text nodes; no `dangerouslySetInnerHTML` anywhere
- **iframe sandboxing** â€” HF demo and YouTube embeds run sandboxed without `allow-top-navigation`; all lazy-loaded
- **CSP + security headers** â€” `vercel.json` (or `netlify.toml`): strict `script-src 'self'`, frame-src allow-list, nosniff, DENY framing, Referrer-Policy, Permissions-Policy, HSTS
- **Error boundary** â€” a malformed GitHub API response can only degrade the feed card, never the page
- **Build hygiene** â€” `console`/`debugger` stripped from production; `npm audit` clean; lockfile committed

### Custom booking (paid calls)

The "Book a Call" modal is a paid-consulting-only custom flow: pick a slot
within Zuhaib's 10:00 PMâ€“1:00 AM PKT window, choose a duration, see a live
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

Without them, the API uses an in-memory store â€” fine locally, but only
enforces holds within a single warm serverless instance.

**Manual confirmation habit:** on submit the record becomes
`pending_verification` and Zuhaib gets an email with the transaction ID.
Verify it against your Payoneer/bank records, reply to confirm, then update
the record's `status` to `confirmed` in Supabase. The site never claims the
call is booked before that step.

### Manual steps (outside the coding tool)

1. **Domain:** `portfolio-rho-nine-gb5m68vt3j.vercel.app` is the live URL (canonical, og:url, og:image, robots.txt and sitemap.xml). If you later add a custom domain, update these references.
2. **Plausible Analytics:** âœ… snippet installed (`pa-7c4AyUE4RTcb1bqIGAjq.js`) with a CSP-safe event shim â€” after deploying, click "I've installed the script" in the Plausible dashboard to start seeing stats. Events tracked: Resume Downloaded, Chatbot Opened, Book Call Clicked, Project Demo Opened, Contact Form Submitted
3. **Resend (contact form):** âœ… live â€” key in the gitignored `.env` (local) and verified end-to-end. For production: add `RESEND_API_KEY` (and optionally `RESEND_FROM`, `CONTACT_TO`) in Vercel â†’ Settings â†’ Environment Variables. Note: the default sender is Resend's `onboarding@resend.dev`, which can only deliver to your account's own email â€” verify a domain you own in Resend and set `RESEND_FROM=Portfolio Contact <hello@yourdomain.com>` to deliver to any inbox
4. **After first deploy:** visit `https://yoursite.com/.env` and `/.git/config` â€” both must 404 (they will; verify anyway)
5. **Verify HTTPS** is enforced by your host (Vercel/Netlify do this by default)
6. In-memory rate limiting is per-serverless-instance â€” if you ever see real abuse, move the counter to a shared store (e.g. Upstash Redis)
7. Never commit `.env` â€” it's gitignored; if a key ever lands in git history, rotate it immediately
8. Optional: run a Lighthouse audit in Chrome DevTools (target â‰¥90 across the board)

### Discoverability assets

- `public/og-image.png` (1200Ã—630) â€” link-unfurl preview; regenerate with `powershell scripts/generate-brand-images.ps1`
- `public/favicon.ico` + `public/apple-touch-icon.png` â€” gradient ZA branding
- `public/robots.txt` + `public/sitemap.xml` â€” with `[YOUR-DOMAIN]` TODOs
- Themed client-side 404 (`src/components/NotFound.jsx`) for unknown paths

## Extras

- **`public/resume.pdf` is the real, manually-maintained resume** â€” served by the Navbar/Hero "Resume" buttons as-is. Edit the source document (Word/Canva/etc.) and re-export to update it.
- `npm run generate:resume` â€” builds a simple auto-generated fallback at `public/resume-generated.pdf` from `scripts/generate-resume.mjs` (never overwrites the real resume)
- All content lives in `src/data/content.js` â€” one file to edit for copy changes

