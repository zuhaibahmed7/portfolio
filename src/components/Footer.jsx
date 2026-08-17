import { ArrowUp } from 'lucide-react';
import { profile, siteLastUpdated } from '../data/content.js';
import { CopyEmailButton } from './ui.jsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06] py-10">
      <div className="container-x flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold text-ink">
            {profile.name} <span className="text-gradient text-[19px] font-bold">© {year}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Built with <span className="text-accent-violet">React</span>,{' '}
            <span className="text-accent-cyan">Three.js</span> &{' '}
            <span className="text-accent-pink">Framer Motion</span>
          </p>
          {/* Active-maintenance badge (date is a manual constant in content.js) */}
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Actively maintained — last updated {siteLastUpdated}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          {/* Email + one-tap copy */}
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${profile.email}`}
              className="text-xs text-muted transition-colors hover:text-accent-cyan"
            >
              {profile.email}
            </a>
            <CopyEmailButton value={profile.email} className="!h-8 !w-8" />
          </div>

          {/* Back-to-top button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="glass-card group grid h-11 w-11 place-items-center rounded-xl text-muted transition-all duration-300 hover:-translate-y-1 hover:border-accent-cyan/50 hover:text-accent-cyan hover:shadow-glow-cyan print:hidden"
          >
            <ArrowUp size={18} strokeWidth={2} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
