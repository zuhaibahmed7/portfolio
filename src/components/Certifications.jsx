import { Award, BadgeCheck } from 'lucide-react';
import { awards, certifications } from '../data/content.js';
import { Reveal, SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   Certifications & Awards — the SEEF scholarship leads the grid (scholarships
   outweigh course certificates), then the certifications follow. All cards
   share the same glass style and scroll-reveal animation.
--------------------------------------------------------------------------- */

export default function Certifications() {
  // Awards first, then certifications — one merged card list
  const items = [
    ...awards.map((a) => ({ ...a, isAward: true })),
    ...certifications.map((c) => ({ ...c, isAward: false })),
  ];

  return (
    <section id="certifications" className="relative overflow-hidden py-28 sm:py-32" aria-label="Certifications and awards">
      <div className="aura left-1/3 top-0 h-[320px] w-[520px] bg-accent-pink/50" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={10}
          eyebrow="Certifications & Awards"
          title="Credentials & recognition"
          lead="Continuous learning across generative AI, machine learning and data — plus recognition along the way."
        />

        {/* 6 cards → even 3-col grid (2 rows) on desktop, no span hacks needed */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i * 0.08, 0.5)}>
              <div
                className={`glass-card group flex h-full items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 ${
                  item.isAward ? 'hover:border-accent-pink/40 hover:shadow-glow-pink' : 'hover:border-accent-cyan/40 hover:shadow-glow-cyan'
                }`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                    item.isAward
                      ? 'bg-gradient-accent-diag/25 text-accent-pink'
                      : 'bg-gradient-accent-diag/20 text-accent-cyan'
                  }`}
                >
                  {item.isAward ? (
                    <Award size={20} strokeWidth={1.8} />
                  ) : (
                    <BadgeCheck size={20} strokeWidth={1.8} />
                  )}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {item.issuer}{item.date ? ` · ${item.date}` : ''}
                  </p>
                  {/* Award type tag / credential ID — same slot, same sizing */}
                  {item.isAward ? (
                    <p className="mt-1.5 text-[11px] font-medium text-accent-pink">{item.tag}</p>
                  ) : (
                    item.credentialId && (
                      <p className="mt-1.5 truncate font-mono text-[10px] text-accent-cyan/80" title={item.credentialId}>
                        ID: {item.credentialId}
                      </p>
                    )
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
