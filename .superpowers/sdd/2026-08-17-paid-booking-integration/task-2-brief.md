# Task 2 Brief — Remove dead `paymentDetails.prices`

**Project:** Zuhaib Ahmed portfolio. Task 1 removed the legacy `PaidSessionFlow` from `Contact.jsx`, which was the only consumer of `paymentDetails.prices` in `src/data/content.js`. This task deletes that dead data.

**Files:**
- Modify: `src/data/content.js` (inside the `paymentDetails` export, around line 277)

**Global constraints that bind this task:**
- Keep existing architecture: do not touch `bookingConfig`, `paymentDetails.payoneer`, `paymentDetails.bank`, or `paymentDetails.disclaimer` — `BookingFlow.jsx` reads those.
- No test framework in this repo — verify with `npm run build` (exit 0) plus a grep check.
- No git repo — do not run git commands; do not commit.
- Do not add comments.

## Steps

### Step 1: Delete the `prices` array

In `src/data/content.js`, inside the `paymentDetails` object, remove the `prices:` array (currently lines 277–280):

```js
  prices: [
    { duration: '30 minutes', pkr: 'PKR 5,000', usd: '~$18' },
    { duration: '1 hour', pkr: 'PKR 10,000', usd: '~$36' },
  ],
```

so `paymentDetails` starts directly with `payoneer: {`. If the line numbers drifted, locate the block by its content.

### Step 2: Verify no references remain

Run: `grep -rn "paymentDetails\.prices" src/`
Expected: no matches.

### Step 3: Verify build

Run: `npm run build`
Expected: exit 0.

## Verification evidence to report

Report the grep result (no matches) and the `npm run build` tail (last ~5 lines), plus any concerns.