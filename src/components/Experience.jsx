import { useEffect, useRef } from 'react';
import { GraduationCap, Rocket } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { education } from '../data/content.js';
import { SectionHeading } from './ui.jsx';

gsap.registerPlugin(ScrollTrigger);

/* Stacked-card deck: each card pins (sticky) while the next slides over it;
   the covered card scales down slightly for depth. bg-surface/95 keeps the
   top card legible while the deck overlaps. */
export default function Experience() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.stack-card', wrapRef.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.75,
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top top+=160',
            scrub: 0.5,
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="experience" className="relative overflow-clip py-28 sm:py-32" aria-label="Experience and education">
      <div className="aura -left-40 top-1/3 h-[420px] w-[420px] bg-accent-pink/60" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={5}
          eyebrow="Experience"
          title="Education & journey"
          lead="Where I'm studying, and what I'm sharpening right now."
        />

        <div ref={wrapRef} className="relative mx-auto mt-16 max-w-3xl pb-8">
          <div className="stack-card sticky top-[104px] z-[1]">
            <article className="glass-card--border-gradient glass-card rounded-2xl bg-surface/95 p-6 shadow-glow sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-cyan">
                    <GraduationCap size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{education.school}</h3>
                    <p className="mt-0.5 text-sm text-muted">{education.degree}</p>
                    <p className="mt-1 font-mono text-xs text-accent-cyan">{education.location}</p>
                  </div>
                </div>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-violet/50 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-violet shadow-glow" />
                  </span>
                  <span className="pill whitespace-nowrap !text-accent-cyan">{education.period}</span>
                </span>
              </div>
            </article>
          </div>

          <div className="stack-card sticky top-[128px] z-[2] mt-6">
            <article className="glass-card rounded-2xl bg-surface/95 p-6 shadow-glow-cyan sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-pink">
                  <Rocket size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Now</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{education.now}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
