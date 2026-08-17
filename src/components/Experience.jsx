import { useEffect, useRef } from 'react';
import { GraduationCap, Rocket } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { education } from '../data/content.js';
import { SectionHeading } from './ui.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const wrapRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion: gsap.matchMedia scopes the animation so
    // it simply never registers for users who opted out of motion.
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // The vertical timeline "draws" itself as you scroll past it:
      // scaleY animates 0 → 1, scrubbed to the section's scroll progress.
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top 72%',
            end: 'bottom 45%',
            scrub: 0.6,
          },
        }
      );

      // Each timeline item slides/fades in when it enters the viewport
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          x: -36,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 82%' },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="experience" className="relative overflow-hidden py-28 sm:py-32" aria-label="Experience and education">
      <div className="aura -left-40 top-1/3 h-[420px] w-[420px] bg-accent-pink/60" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={3}
          eyebrow="Experience"
          title="Education & journey"
          lead="Where I'm studying, and what I'm sharpening right now."
        />

        <div ref={wrapRef} className="relative mx-auto mt-16 max-w-3xl pl-10 sm:pl-14">
          {/* Vertical line — origin-top so the draw animation grows downward */}
          <div className="absolute bottom-2 left-[9px] top-2 w-px bg-white/10 sm:left-[13px]" aria-hidden="true">
            <div
              ref={lineRef}
              className="h-full w-full origin-top bg-gradient-to-b from-accent-violet via-accent-cyan to-accent-pink"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>

          {/* --- Timeline node 1: Education --- */}
          <div className="timeline-item relative pb-12">
            <span className="absolute -left-10 top-1 grid h-[19px] w-[19px] place-items-center sm:-left-14 sm:h-[27px] sm:w-[27px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-violet/50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-violet shadow-glow sm:h-3 sm:w-3" />
            </span>

            <div className="glass-card--border-gradient glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow sm:p-7">
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
                <span className="pill whitespace-nowrap !text-accent-cyan">{education.period}</span>
              </div>
            </div>
          </div>

          {/* --- Timeline node 2: Current focus (from bio) --- */}
          <div className="timeline-item relative pb-2">
            <span className="absolute -left-10 top-1 grid h-[19px] w-[19px] place-items-center sm:-left-14 sm:h-[27px] sm:w-[27px]">
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-cyan shadow-glow-cyan sm:h-3 sm:w-3" />
            </span>

            <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-cyan/40 hover:shadow-glow-cyan sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-pink">
                  <Rocket size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">Now</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{education.now}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
