# SDD ledger — plan: docs/superpowers/plans/2026-08-17-paid-booking-integration.md

No git repo in this folder — adapted SDD: no commits, no worktrees. Ledger is the
recovery map. Implementer subagents edit files directly; reviewers read files
directly. Verification via `npm run build` + grep checks.

Task 1: complete — Contact.jsx wired to BookingFlow, Calendly + old flow removed, review clean after 1 fix round (stale comment, unused useEffect import, restored inputCls comment). Build exit 0.
Task 2: complete — paymentDetails.prices removed from content.js, payoneer/bank/disclaimer intact. Build exit 0.
Task 3: complete — .env.example + README Supabase setup documented. Verify via Select-String.

Final whole-change review: complete — Approve. Minor fixes applied post-review: README stale Calendly bullet removed; Calendly entries removed from CSP frame-src in vercel.json + netlify.toml (user-approved). Final build exit 0. No git repo — nothing to commit.