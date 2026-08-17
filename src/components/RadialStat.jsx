import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/* ---------------------------------------------------------------------------
   RadialStat (Feature #8) — compact animated radial gauge used inside the
   AgroVision card. The ring draws from 0 → value% (strokeDashoffset) and the
   number counts up when the gauge scrolls into view.
--------------------------------------------------------------------------- */

/* rAF-driven eased count-up that runs once `inView` flips true */
function Counter({ value, inView, suffix = '' }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    const start = performance.now();
    const dur = 1300;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span className="font-display text-lg font-bold text-ink">
      {n}
      <span className="text-xs text-muted">{suffix}</span>
    </span>
  );
}

export default function RadialStat({ value, label, color = '#22D3EE', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();

  const R = 30;
  const C = 2 * Math.PI * R; // ring circumference
  const target = C * (1 - value / 100);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <div className="relative h-[86px] w-[86px]">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          {/* Background track */}
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          {/* Value arc — dash offset animates from full ring to the target % */}
          <motion.circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={inView ? { strokeDashoffset: target } : {}}
            transition={reduced ? { duration: 0 } : { duration: 1.4, delay, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <Counter value={value} inView={inView} suffix="%" />
        </div>
      </div>
      <p className="text-center text-[11px] font-medium text-muted">{label}</p>
    </div>
  );
}
