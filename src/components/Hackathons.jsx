import { ArrowUpRight, Github, Sparkles, Trophy, Youtube } from 'lucide-react';
import { hackathons } from '../data/content.js';
import { Pill, Reveal, SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   Hackathons — three submitted builds (ResearchPilot keeps this card light
   since the full case study lives in Projects above). Status is honestly
   "Submitted" everywhere; awards are phrased as "targeting".
--------------------------------------------------------------------------- */

function HackathonCard({ h, delay = 0 }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent-violet/40 hover:shadow-glow sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-pink transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Trophy size={20} strokeWidth={1.8} />
          </span>
          <span className="pill whitespace-nowrap !text-emerald-400">{h.status}</span>
        </div>

        <h3 className="mt-4 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-accent-cyan">
          {h.title}
        </h3>
        <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-accent-cyan/80">
          {h.event} · {h.track}
        </p>

        <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted">{h.description}</p>

        {/* MediAssist health disclaimer */}
        {h.note && (
          <p className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] italic leading-relaxed text-muted">
            {h.note}
          </p>
        )}

        {/* Awards are targeted, not won — keep the phrasing honest */}
        {h.targeting && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-accent-pink">
            <Sparkles size={12} className="mt-0.5 shrink-0" />
            {h.targeting}
          </p>
        )}

        {/* Point readers to the full case study instead of repeating it */}
        {h.seeProjects && (
          <a href="#projects" className="mt-3 text-[11px] font-semibold text-accent-cyan underline decoration-accent-cyan/40 underline-offset-4 transition-colors hover:text-ink">
            See the full case study in Projects ↑
          </a>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {h.tech.map((t) => (
            <span key={t} className="pill !px-2.5 !py-0.5 !text-[11px]">
              {t}
            </span>
          ))}
        </div>

        {/* Links: live demo + video + GitHub */}
        <div className="mt-5 flex items-center gap-2">
          <a
            href={h.links.demo}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary !px-4 !py-2 !text-xs"
          >
            Live Demo
            <ArrowUpRight size={13} strokeWidth={2.2} />
          </a>
          {h.links.video && (
            <a
              href={h.links.video}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${h.title} demo video`}
              className="glass-card grid h-9 w-9 place-items-center rounded-lg text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-accent-pink"
            >
              <Youtube size={15} strokeWidth={1.8} />
            </a>
          )}
          <a
            href={h.links.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${h.title} on GitHub`}
            className="glass-card grid h-9 w-9 place-items-center rounded-lg text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-ink"
          >
            <Github size={15} strokeWidth={1.8} />
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export default function Hackathons() {
  return (
    <section id="hackathons" className="relative overflow-hidden py-28 sm:py-32" aria-label="Hackathons">
      <div className="aura -right-40 top-1/4 h-[400px] w-[400px] bg-accent-pink/50" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={8}
          eyebrow="Hackathons"
          title="Built under pressure"
          lead="Three hackathon submissions — multi-agent research, persistent-memory health AI, and bilingual vision tools."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((h, i) => (
            <HackathonCard key={h.id} h={h} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
