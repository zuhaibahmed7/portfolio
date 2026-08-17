/* ---------------------------------------------------------------------------
   Plausible Analytics wiring.

   The snippet in index.html loads the keyed script (pa-…js) asynchronously.
   Plausible's official install pairs it with an inline <script> queue shim
   so early events aren't dropped — but our CSP blocks inline scripts, so the
   shim lives here instead (bundled = self-hosted = CSP-safe). Their script
   drains window.plausible.q once it loads.
--------------------------------------------------------------------------- */

// CSP-safe replacement for Plausible's inline queue shim
if (typeof window !== 'undefined' && typeof window.plausible !== 'function') {
  window.plausible = function plausible(...args) {
    (window.plausible.q = window.plausible.q || []).push(args);
  };
}

/* Fire a custom event — safe no-op if analytics is blocked/unavailable */
export function track(eventName) {
  try {
    window.plausible?.(eventName);
  } catch {
    /* analytics must never break the site */
  }
}
