import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from './ui.jsx';

/* -------------------------------------------------------------------
   Animated stat counter — ticks from 0 → target once scrolled into
   view. Uses the same easeOutCubic rAF pattern as the existing
   CountUp in ui.jsx, but wrapped in a glass card with label/suffix.
------------------------------------------------------------------- */
function StatCard({ value, suffix = '', label, icon, delay = 0 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '-40px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduced) { setDisplay(value); return undefined; }
    let raf;
    const start = performance.now();
    const dur = 1.4;
    const tick = (t) => {
      const p = Math.min((t - start) / (dur * 1000), 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced]);

  return (
    <Reveal delay={delay} className="h-full">
      <div
        ref={ref}
        className="glass-card group flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:border-accent-violet/40 hover:shadow-glow sm:p-8"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-cyan transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <p className="font-display text-4xl font-bold text-ink sm:text-5xl">
          {display}
          <span className="text-gradient">{suffix}</span>
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------------------
   Stats Counter section — sits between About and Skills as a quick
   credibility snapshot. Shows key numbers that tick up on scroll.
------------------------------------------------------------------- */
export default function StatsCounter() {
  const stats = [
    { value: 7, suffix: '+', label: 'Projects Shipped', icon: <span className="text-xl">🚀</span> },
    { value: 7, suffix: '+', label: 'Certifications', icon: <span className="text-xl">🏆</span> },
    { value: 54, suffix: 'K+', label: 'Images Trained On', icon: <span className="text-xl">🧠</span> },
    { value: 4, suffix: '', label: 'Hackathon Submissions', icon: <span className="text-xl">⚡</span> },
  ];

  return (
    <section id="stats" className="relative overflow-hidden py-20 sm:py-24" aria-label="Key stats">
      <div className="aura left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-accent-violet/40" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-cyan/90">
              Proficiency
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              Overview <span className="text-gradient">.</span>
            </h2>
            <p className="mt-2 max-w-lg mx-auto text-sm leading-relaxed text-muted">
              A quick snapshot of what I&apos;ve shipped, the certifications I&apos;ve earned, and the scale of data I&apos;ve worked with.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
