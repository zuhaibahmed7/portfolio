import { ArrowLeft } from 'lucide-react';

/* ---------------------------------------------------------------------------
   Themed 404 — rendered client-side for any unknown path (hosts with SPA
   fallbacks serve index.html for everything; the router-less app detects a
   non-root pathname and shows this instead). Deliberately lightweight.
--------------------------------------------------------------------------- */
export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-base px-6" aria-label="Page not found">
      {/* Aura + grid keep it on-brand without heavy animation */}
      <div className="grid-overlay absolute inset-0" aria-hidden="true" />
      <div className="aura -left-32 top-1/4 h-[420px] w-[420px] bg-accent-violet" aria-hidden="true" />
      <div className="aura -right-32 bottom-1/4 h-[380px] w-[380px] bg-accent-cyan" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <p className="font-display text-[clamp(4rem,14vw,8rem)] font-bold leading-none text-gradient">404</p>
        <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">Page Not Found</h1>
        <p className="max-w-sm text-sm text-muted">Looks like this page wandered off — maybe it&apos;s out doing research somewhere.</p>
        <a href="/" className="btn-primary mt-2">
          <ArrowLeft size={15} strokeWidth={2.2} />
          Back to homepage
        </a>
      </div>
    </main>
  );
}
