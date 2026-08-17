import { motion, useReducedMotion } from 'framer-motion';
import {
  BadgeCheck,
  Brain,
  FileText,
  Gauge,
  ListChecks,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
   Architecture diagrams (Feature #2) — animated "How it works" flows.
   Nodes stagger in + connectors draw (scaleX) as the diagram scrolls into
   view; the connector dashes also "march" continuously (see .connector in
   index.css, disabled under prefers-reduced-motion).
--------------------------------------------------------------------------- */

const NODES = {
  // ResearchPilot: Query → Planner → Researcher → Critic (loop) → Synthesizer → Report
  researchpilot: [
    { icon: MessageSquare, label: 'Query', caption: 'research question in' },
    { icon: ListChecks, label: 'Planner', caption: 'decomposes the question' },
    { icon: Search, label: 'Researcher', caption: 'retrieves sourced evidence' },
    { icon: Gauge, label: 'Critic', caption: 'confidence & gap check' },
    { icon: Sparkles, label: 'Synthesizer', caption: 'structured cited report' },
    { icon: FileText, label: 'Report', caption: 'final output' },
  ],
  // AgroVision: Image Upload → Preprocessing → CNN Model → Prediction
  agrovision: [
    { icon: Upload, label: 'Image Upload', caption: 'leaf photo' },
    { icon: SlidersHorizontal, label: 'Preprocessing', caption: 'resize 224×224 · normalize' },
    { icon: Brain, label: 'CNN Model', caption: '38 disease classes' },
    { icon: BadgeCheck, label: 'Prediction', caption: 'instant result' },
  ],
};

/* Single stage node: icon + label + one-line caption */
function Node({ icon: Icon, label, caption, index }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduced ? { duration: 0 } : { delay: index * 0.12, type: 'spring', stiffness: 260, damping: 20 }}
      className="glass-card z-10 flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center sm:w-28"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-accent-diag/25 text-accent-cyan">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <p className="font-display text-[11px] font-semibold leading-tight text-ink">{label}</p>
      <p className="text-[9px] leading-tight text-muted">{caption}</p>
    </motion.div>
  );
}

/* Animated dashed connector — scaleX draws in, CSS keeps dashes marching */
function Connector({ index }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduced ? { duration: 0 } : { delay: index * 0.12 + 0.08, duration: 0.35, ease: 'easeOut' }}
      className="connector h-[2px] min-w-3 flex-1 origin-left"
      aria-hidden="true"
    />
  );
}

export default function ArchitectureDiagram({ variant = 'researchpilot', className = '' }) {
  const nodes = NODES[variant];
  const reduced = useReducedMotion();

  return (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div className="relative min-w-[560px] px-1 pt-1">
        {/* Node row */}
        <div className="flex items-stretch gap-0">
          {nodes.map((n, i) => (
            <div key={n.label} className="contents">
              <Node {...n} index={i} />
              {i < nodes.length - 1 && <div className="flex items-center"><Connector index={i} /></div>}
            </div>
          ))}
        </div>

        {/* Self-critique loop (ResearchPilot only): dashed bracket from the
            Critic back to the Researcher, labeled with the trigger condition.
            Positioned by percentage across the equal-width node row. */}
        {variant === 'researchpilot' && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={reduced ? { duration: 0 } : { delay: nodes.length * 0.12 + 0.3, duration: 0.5 }}
            className="absolute left-[41.6%] right-[41.6%] top-full"
            aria-hidden="true"
          >
            <div className="connector-vertical mx-auto h-6 w-full" />
            <p className="pt-1 text-center font-mono text-[9px] text-accent-pink">
              ↺ low confidence → re-research loop
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
