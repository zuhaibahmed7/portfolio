import { Quote } from 'lucide-react';
import { testimonials } from '../data/content.js';
import { Reveal, SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   Testimonials / Endorsements (Feature #6).
   ⚠️ The quotes currently rendered come from content.js with FICTIONAL
   placeholder names — TODO: swap them for real endorsements before
   publishing. See the warning comment at `testimonials` in content.js.
--------------------------------------------------------------------------- */

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-28 print:hidden" aria-label="Testimonials">
      <div className="aura right-0 top-1/4 h-[320px] w-[420px] bg-accent-pink/40" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={9}
          eyebrow="Testimonials"
          title="What people say"
          lead="Short endorsements from people Zuhaib has built, studied and shipped with."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <figure className="glass-card flex h-full flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-pink/30 hover:shadow-glow-pink">
                <Quote size={20} className="text-accent-pink/70" />
                <blockquote className="flex-1 text-sm leading-relaxed text-muted">{t.quote}</blockquote>
                <figcaption className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-accent-diag/25 font-display text-xs font-bold text-accent-cyan">
                    {t.avatar ? <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" /> : t.initials}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
