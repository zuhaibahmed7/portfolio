# Task 3 Report — Document the Supabase booking backend

**Status:** DONE

## What was done

Documentation only. No source or API files were modified. No git commands were run, and no new files were created outside the mandated report.

### Step 1: `.env.example` (appended)

Appended the Supabase env-var section exactly as specified in the brief (including the leading blank line and the em dash in "detection (optional) — without these"):

- Added a comment block documenting the optional `SUPABASE_URL` / `SUPABASE_ANON_KEY` vars and the in-memory fallback behavior.
- `#SUPABASE_URL=https://<project-ref>.supabase.co`
- `#SUPABASE_ANON_KEY=eyJ...`

Resulting `.env.example` is 35 lines; the appended section occupies lines 26–35. The pre-existing 25 lines are unchanged.

### Step 2: `README.md` (inserted section)

Inserted the "### Custom booking (paid calls)" section between the end of the "Security posture" section and the "### Manual steps (outside the coding tool)" heading, exactly as specified:

- Section heading + description at lines 84–90.
- SQL `create table public.bookings (...)` fence at lines 95–110, with all columns matching what `api/_bookings.mjs` reads/writes: `id`, `date`, `start_iso`, `duration_min`, `status`, `hold_expires`, `name`, `email`, `method`, `txn_id`, `notes`.
- Env-var table (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) at lines 114–117.
- In-memory fallback note and the "Manual confirmation habit" block at lines 119–126.

All pre-existing README content is preserved verbatim; the insertion is bounded by line 82 (last "Security posture" bullet) and line 128 (`### Manual steps (outside the coding tool)`).

## Verification (Step 3)

Command (run from the project root):

```
Select-String -Path README.md -Pattern "Custom booking|SUPABASE_URL|pending_verification" | Select-Object LineNumber,Line
```

Output:

```
LineNumber Line
---------- ----
       84 ### Custom booking (paid calls)
      116 | `SUPABASE_URL` | for cross-visitor holds | Project URL, e.g. `https://<ref>.supabase.co` |
      123 `pending_verification` and Zuhaib gets an email with the transaction ID.
```

All three expected patterns present with line numbers: the new section heading (line 84) and both env var names — `SUPABASE_URL` at line 116 and `SUPABASE_ANON_KEY` at line 117 — plus the `pending_verification` manual-confirmation text at line 123.

Additional confirmation reads performed: `.env.example` tail (lines 23–35) and `README.md` insertion region (lines 80–139) both match the brief's target text verbatim (byte-for-byte content, em/en dashes and backticks included).

## Concerns

None.
