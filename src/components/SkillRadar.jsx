import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, SectionHeading } from './ui.jsx';

/* -------------------------------------------------------------------
   Skill Radar — an animated SVG spider/radar chart that shows
   relative proficiency across 6 skill axes. Draws itself when
   scrolled into view. Placed between Skills and the Timeline.
------------------------------------------------------------------- */

const AXES = [
  { label: 'AI / ML', value: 0.88 },
  { label: 'Backend', value: 0.78 },
  { label: 'Frontend', value: 0.72 },
  { label: 'DevOps', value: 0.65 },
  { label: 'Data Science', value: 0.82 },
  { label: 'System Design', value: 0.7 },
];

const CENTER = 150;
const MAX_R = 110;
const LEVELS = 5;

function polarToCart(cx, cy, r, angleDeg) {
  const rad = ((Math.PI * 2) / 360) * angleDeg - Math.PI / 2;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function polygonPoints(values, cx, cy, maxR) {
  const angleStep = 360 / values.length;
  return values
    .map((v, i) => {
      const p = polarToCart(cx, cy, maxR * v, angleStep * i);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

export default function SkillRadar() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const angleStep = 360 / AXES.length;

  useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '-60px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Animate from 0 to actual values
  const progress = reduced ? 1 : inView ? 1 : 0;
  const currentValues = AXES.map((a) => a.value * progress);

  return (
    <section className="relative overflow-hidden py-20 sm:py-24" aria-label="Skill radar">
      <div className="container-x relative">
        <Reveal>
          <div className="glass-card mx-auto max-w-2xl rounded-3xl p-8 sm:p-12">
            <div className="mb-6 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-cyan/90">
                03 &middot; Skill Radar
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Proficiency Overview <span className="text-gradient">.</span>
              </h2>
            </div>

            <div ref={ref} className="flex justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-w-[320px]">
                {/* Grid levels */}
                {Array.from({ length: LEVELS }).map((_, i) => {
                  const r = (MAX_R / LEVELS) * (i + 1);
                  return (
                    <polygon
                      key={i}
                      points={polygonPoints(AXES.map(() => 1), CENTER, CENTER, r)}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Axis lines */}
                {AXES.map((_, i) => {
                  const p = polarToCart(CENTER, CENTER, MAX_R, angleStep * i);
                  return (
                    <line
                      key={i}
                      x1={CENTER}
                      y1={CENTER}
                      x2={p.x}
                      y2={p.y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Data polygon */}
                <motion.polygon
                  points={polygonPoints(currentValues, CENTER, CENTER, MAX_R)}
                  fill="url(#radarGradient)"
                  fillOpacity="0.25"
                  stroke="url(#radarGradient)"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: inView ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                />

                {/* Data dots */}
                {AXES.map((a, i) => {
                  const p = polarToCart(CENTER, CENTER, MAX_R * a.value * progress, angleStep * i);
                  return (
                    <motion.circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#22D3EE"
                      stroke="#0A0A0F"
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: inView ? 1 : 0 }}
                      transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300 }}
                    />
                  );
                })}

                {/* Axis labels */}
                {AXES.map((a, i) => {
                  const p = polarToCart(CENTER, CENTER, MAX_R + 24, angleStep * i);
                  return (
                    <text
                      key={i}
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted font-mono text-[9px] uppercase tracking-wider"
                    >
                      {a.label}
                    </text>
                  );
                })}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="mt-6 text-center text-[11px] text-muted">
              Relative proficiency based on project depth and production use — not a ranking.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
