import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from './ui.jsx';

/* -------------------------------------------------------------------
   Activity Heatmap — a GitHub-contribution-style grid showing
   coding activity over the past ~3 months. Uses a seeded pseudo-
   random generator so the pattern is consistent across renders.
   Cells animate in on scroll.
------------------------------------------------------------------- */

// Simple seeded PRNG (mulberry32) for consistent "activity" data
function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate 12 weeks (84 days) of fake activity
function generateActivity() {
  const rand = mulberry32(42);
  const days = [];
  for (let i = 0; i < 84; i++) {
    const r = rand();
    // Weight toward some activity — most days have at least a little
    if (r < 0.15) days.push(0);
    else if (r < 0.35) days.push(1);
    else if (r < 0.55) days.push(2);
    else if (r < 0.8) days.push(3);
    else days.push(4);
  }
  return days;
}

const ACTIVITY = generateActivity();
const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const LEVELS = [
  'bg-white/[0.04]',
  'bg-accent-violet/20',
  'bg-accent-violet/40',
  'bg-accent-violet/65',
  'bg-accent-violet',
];

export default function ActivityHeatmap() {
  const reduced = useReducedMotion();

  return (
    <Reveal className="mx-auto max-w-xl">
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          Recent activity
        </p>
        <div className="flex gap-[3px]">
          {Array.from({ length: WEEKS }).map((_, week) => (
            <div key={week} className="flex flex-col gap-[3px]">
              {Array.from({ length: DAYS_PER_WEEK }).map((_, day) => {
                const idx = week * DAYS_PER_WEEK + day;
                const level = ACTIVITY[idx] ?? 0;
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { delay: week * 0.02 + day * 0.01, duration: 0.2, ease: 'easeOut' }
                    }
                    className={`h-3 w-3 rounded-[3px] transition-colors duration-200 hover:ring-1 hover:ring-accent-cyan/50 ${LEVELS[level]}`}
                    title={`${level === 0 ? 'No' : level < 3 ? 'Some' : 'Lots of'} activity`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-muted">Less</span>
          {LEVELS.map((cls, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
          ))}
          <span className="text-[10px] text-muted">More</span>
        </div>
      </div>
    </Reveal>
  );
}
