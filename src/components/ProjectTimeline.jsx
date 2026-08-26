import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, SectionHeading } from './ui.jsx';
import { GraduationCap, Code2, Cpu, Rocket, Sparkles } from 'lucide-react';

/* -------------------------------------------------------------------
   Project Timeline — vertical roadmap showing Zuhaib's growth from
   simple desktop apps → CNN-based ML → multi-agent AI systems.
   Each node is a glass card connected by a gradient line.
------------------------------------------------------------------- */

const TIMELINE = [
  {
    year: '2025',
    period: 'Early',
    title: 'Foundation Projects',
    desc: 'Desktop apps and web fundamentals — learning OOP, data structures, and UI/UX basics.',
    items: ['Task Manager (Tkinter)', 'Movie Discovery App', 'FitWise AI Fitness'],
    color: 'accent-cyan',
    icon: <Code2 size={18} strokeWidth={1.8} />,
  },
  {
    year: '2025',
    period: 'Mid',
    title: 'Full-Stack & Systems',
    desc: 'Real-world web systems with databases, role-based access, and proper architecture.',
    items: ['Canteen Token System (PHP/MySQL)', '3-Tier Architecture', 'Design Patterns (Singleton, Factory, Observer)'],
    color: 'accent-violet',
    icon: <GraduationCap size={18} strokeWidth={1.8} />,
  },
  {
    year: '2026',
    period: 'Early',
    title: 'AI & Machine Learning',
    desc: 'First deep learning projects — CNNs, model training, and containerized deployment.',
    items: ['AgroVision (54K images, 38 classes)', 'ScriptFlow AI', 'Docker containerization'],
    color: 'accent-pink',
    icon: <Cpu size={18} strokeWidth={1.8} />,
  },
  {
    year: '2026',
    period: 'Now',
    title: 'Agentic AI Systems',
    desc: 'Multi-agent LLM pipelines, hackathon wins, and production-grade AI products.',
    items: ['ResearchPilot (4-agent pipeline)', 'MediAssist (persistent memory)', 'Smart Photo Analyzer (bilingual)'],
    color: 'accent-cyan',
    icon: <Rocket size={18} strokeWidth={1.8} />,
  },
];

function TimelineNode({ item, index, isLast }) {
  const reduced = useReducedMotion();
  const isLeft = index % 2 === 0;

  return (
    <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_48px_1fr]">
      {/* Left content (even items) or empty space */}
      <div className={`${isLeft ? '' : 'hidden lg:block'}`}>
        {isLeft && (
          <Reveal delay={index * 0.12} className="lg:ml-auto lg:max-w-md">
            <TimelineCard item={item} align="right" />
          </Reveal>
        )}
      </div>

      {/* Center line + dot */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20, delay: index * 0.12 }}
          className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-${item.color}/50 bg-base`}
        >
          <span className={`text-${item.color}`}>{item.icon}</span>
        </motion.div>
        {/* Line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, delay: index * 0.12 + 0.2, ease: 'easeOut' }}
            className="w-px flex-1 origin-top bg-gradient-to-b from-accent-violet/60 to-accent-cyan/40"
          />
        )}
      </div>

      {/* Right content (odd items) or empty space */}
      <div className={`${isLeft ? 'hidden lg:block' : ''}`}>
        {!isLeft && (
          <Reveal delay={index * 0.12} className="lg:mr-auto lg:max-w-md">
            <TimelineCard item={item} align="left" />
          </Reveal>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ item, align }) {
  return (
    <div
      className={`glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/40 hover:shadow-glow ${
        align === 'right' ? 'lg:text-right' : ''
      }`}
    >
      <span className={`font-mono text-xs font-medium text-${item.color}`}>
        {item.year} · {item.period}
      </span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">{item.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.desc}</p>
      <ul className={`mt-3 space-y-1.5 ${align === 'right' ? 'lg:text-right' : ''}`}>
        {item.items.map((b) => (
          <li key={b} className="flex items-center gap-2 text-xs text-muted">
            {align === 'right' ? (
              <>
                <span>{b}</span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-accent-cyan/70" aria-hidden="true" />
              </>
            ) : (
              <>
                <span className="h-1 w-1 shrink-0 rounded-full bg-accent-cyan/70" aria-hidden="true" />
                <span>{b}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProjectTimeline() {
  return (
    <section id="timeline" className="relative overflow-hidden py-28 sm:py-32" aria-label="Growth timeline">
      <div className="aura -left-40 top-1/3 h-[360px] w-[360px] bg-accent-cyan/40" aria-hidden="true" />
      <div className="container-x relative">
        <SectionHeading
          index={4}
          eyebrow="Growth"
          title="From desktop apps to AI agents"
          lead="A visual timeline of how my projects evolved — each phase building on the last."
        />

        <div className="mt-14 space-y-0">
          {TIMELINE.map((item, i) => (
            <TimelineNode key={`${item.year}-${item.period}`} item={item} index={i} isLast={i === TIMELINE.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
