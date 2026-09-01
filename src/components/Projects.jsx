import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, ChevronDown, Github, Play, Sparkles } from 'lucide-react';
import { projects, socials } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { useTranslations } from '../hooks/useTranslations.js';
import { Pill, Reveal, SectionHeading } from './ui.jsx';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';
import RadialStat from './RadialStat.jsx';
import Modal from './Modal.jsx';
import CaseStudyModal from './CaseStudyModal.jsx';
import CardTilt from './CardTilt.jsx';
import { track } from '../analytics.js';

/* Mini diagram of the ResearchPilot pipeline shown in the featured card's
   visual panel (kept compact — the full animated diagram is in the
   "How it works" expander / case study). */
function AgentPipeline() {
  const agents = [
    { name: 'Planner', color: 'text-accent-violet border-accent-violet/50' },
    { name: 'Researcher', color: 'text-accent-cyan border-accent-cyan/50' },
    { name: 'Critic', color: 'text-accent-pink border-accent-pink/50' },
    { name: 'Synthesizer', color: 'text-ink border-white/30' },
  ];
  return (
    <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-base/60 p-8">
      <div className="aura left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-accent-violet/50" aria-hidden="true" />
      <p className="relative font-mono text-[10px] uppercase tracking-[0.3em] text-muted">4-Agent Pipeline</p>
      <div className="relative flex flex-col items-center gap-2.5">
        {agents.map((a, i) => (
          <div key={a.name} className="flex flex-col items-center gap-2.5">
            {i > 0 && <span className="h-4 w-px bg-gradient-to-b from-accent-violet/60 to-accent-cyan/60" aria-hidden="true" />}
            <span className={`rounded-full border bg-white/[0.04] px-5 py-1.5 font-display text-xs font-semibold backdrop-blur ${a.color}`}>
              {a.name}
            </span>
          </div>
        ))}
      </div>
      <p className="relative mt-2 max-w-[240px] text-center font-mono text-[10px] leading-relaxed text-muted">
        <span className="text-accent-pink">↺ loop:</span> Critic detects gaps → triggers re-research below confidence threshold
      </p>
    </div>
  );
}

/* Expandable "How it works" — animated architecture diagram (Feature #2) */
function HowItWorks({ variant, open, onToggle }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-cyan transition-colors hover:text-ink"
      >
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex">
          <ChevronDown size={14} />
        </motion.span>
        {open ? 'Hide architecture' : 'How it works'}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ArchitectureDiagram variant={variant} className="pt-5 pb-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Featured hero card — links now open the embedded demo + case study modals */
function FeaturedProject({ project, onDemo, onCase, howOpen, toggleHow }) {
  return (
    <Reveal>
      <CardTilt intensity={8}>
      <article className="glass-card--border-gradient glass-card overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow">
        <div className="grid lg:grid-cols-2">
          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white shadow-glow">
                <Sparkles size={12} />
                Featured
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Microsoft Agents League · Reasoning Agents track
              </span>
            </div>

            <h3 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">
              {project.title} <span className="text-gradient">— {project.subtitle}</span>
            </h3>

            <ul className="mt-6 space-y-3.5">
              {project.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-accent" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>

            {/* Animated architecture diagram expander (Feature #2) */}
            <div className="mt-6">
              <HowItWorks variant="researchpilot" open={howOpen} onToggle={toggleHow} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t, i) => (
                <Pill key={t} index={i}>
                  {t}
                </Pill>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {/* Embedded live demo modal (Feature #3) */}
              <button type="button" onClick={onDemo} className="btn-primary !px-6 !py-2.5">
                <Play size={15} strokeWidth={2.2} />
                Try it live
              </button>
              {/* Case study modal (Feature #7) */}
              <button type="button" onClick={onCase} className="btn-ghost !px-6 !py-2.5">
                <BookOpen size={15} strokeWidth={2} />
                Read full case study
              </button>
              <a
                href={socials.github.href}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost !px-5 !py-2.5"
                aria-label={`${project.title} on GitHub`}
              >
                <Github size={15} strokeWidth={2} />
              </a>
            </div>
          </div>

          <div className="relative p-3 sm:p-4 lg:p-5">
            <AgentPipeline />
          </div>
        </div>
      </article>
    </CardTilt>
    </Reveal>
  );
}

/* AgroVision's animated metrics dashboard (Feature #8) — replaces the plain
   accuracy bullet with two counting radial gauges + a caption. */
function MetricsDashboard() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-base/50 p-4">
      <RadialStat value={98} label="Training Accuracy" color="#7C3AED" />
      <RadialStat value={88} label="Validation Accuracy" color="#22D3EE" delay={0.15} />
      <p className="col-span-2 text-center text-[11px] text-muted">
        Trained on 54,000+ images across 38 disease classes
      </p>
    </div>
  );
}

/* Standard glass project card */
function ProjectCard({ project, delay = 0, howOpen, toggleHow }) {
  const isAgro = project.id === 'agrovision';
  // AgroVision's first bullet (the accuracy numbers) is replaced by the gauges
  const bullets = isAgro ? project.bullets.slice(1) : project.bullets;

  return (
    <Reveal delay={delay} className="h-full">
      <CardTilt intensity={6}>
      <article className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent-violet/40 hover:shadow-glow sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-accent-cyan">
              {project.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted">{project.subtitle}</p>
          </div>
          <a
            href={socials.github.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${project.title} on GitHub`}
            className="rounded-lg p-1.5 text-muted transition-all duration-300 hover:scale-110 hover:text-ink"
          >
            <Github size={17} strokeWidth={1.8} />
          </a>
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-cyan/70 transition-colors duration-300 group-hover:bg-accent-cyan"
                aria-hidden="true"
              />
              {b}
            </li>
          ))}
        </ul>

        {/* AgroVision: animated accuracy gauges + its linear architecture diagram */}
        {isAgro && (
          <div className="mt-1">
            <MetricsDashboard />
            <div className="mt-4">
              <HowItWorks variant="agrovision" open={howOpen} onToggle={toggleHow} />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="pill !px-2.5 !py-0.5 !text-[11px]">
              {t}
            </span>
          ))}
        </div>
      </article>
      </CardTilt>
    </Reveal>
  );
}

/* Quick View card — title / tech / one-liner only (Feature #5) */
function QuickCard({ project, delay = 0 }) {
  return (
    <Reveal delay={delay} className="h-full">
      <CardTilt intensity={6} className="h-full">
      <article className="glass-card group flex h-full flex-col gap-4 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent-violet/40 hover:shadow-glow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-accent-cyan">
              {project.title}
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-muted">{project.subtitle}</p>
          </div>
          <a
            href={socials.github.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${project.title} on GitHub`}
            className="rounded-lg p-1.5 text-muted transition-all duration-300 hover:scale-110 hover:text-ink"
          >
            <Github size={17} strokeWidth={1.8} />
          </a>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="pill !px-2.5 !py-0.5 !text-[11px]">
              {t}
            </span>
          ))}
        </div>
      </article>
      </CardTilt>
    </Reveal>
  );
}

/* Embedded live demo (Feature #3) — iframe mounts ONLY when the modal opens,
   with a loading skeleton and an "open in new tab" fallback. */
function LiveDemoModal({ open, onClose }) {
  const [loaded, setLoaded] = useState(false);

  // Reset the skeleton each time the modal is reopened
  useEffect(() => {
    if (open) setLoaded(false);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="ResearchPilot — Try it live" subtitle="Embedded from Hugging Face Spaces" wide>
      <div className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-base/60">
        {!loaded && (
          <div className="absolute inset-0 z-10 grid place-items-center">
            <div className="flex flex-col items-center gap-4">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-accent-violet border-t-accent-cyan motion-reduce:animate-none" />
              <p className="max-w-[260px] text-center text-xs text-muted">
                Waking up the Space — free Hugging Face deployments can take ~30s to restart if they were sleeping…
              </p>
            </div>
          </div>
        )}
        {/* Sandbox: Gradio needs scripts + same-origin + forms (API calls &
            uploads). No allow-top-navigation → the Space can never redirect
            this page; "Open in new tab" below is the escape hatch. */}
        <iframe
          src="https://huggingface.co/spaces/zuhaibahmed7/researchpilot/embed"
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          title="ResearchPilot live demo"
          allow="clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <a href={socials.huggingface.href} target="_blank" rel="noreferrer noopener" className="btn-ghost !px-5 !py-2 !text-xs">
          Embedding blocked? Open in a new tab
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </a>
      </div>
    </Modal>
  );
}

export default function Projects() {
  const { isQuick, view } = useView();
  const t = useTranslations();
  const [modal, setModal] = useState(null); // 'demo' | 'case' | null
  const [howOpen, setHowOpen] = useState({}); // per-project diagram expanders
  const toggleHow = (id) => setHowOpen((s) => ({ ...s, [id]: !s[id] }));

  const [featured, ...rest] = projects;

  return (
    <section id="projects" className="relative overflow-hidden py-28 sm:py-32" aria-label="Projects">
      <div className="aura -left-40 bottom-0 h-[420px] w-[420px] bg-accent-violet/70" aria-hidden="true" />
      <div className="aura -right-40 top-10 h-[360px] w-[360px] bg-accent-cyan/50" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={7}
          eyebrow="Projects"
          title={isQuick ? 'Top projects at a glance' : (t.projectsTitle || "Things I've built & shipped")}
          lead={
            isQuick
              ? 'The three that matter most — switch to Detailed View for everything, with full write-ups.'
              : 'Multi-agent reasoning systems, CNN-powered apps, full-stack web platforms — each one built end-to-end and deployed for real users.'
          }
        />

        {/* Keyed by view so the quick/detailed swap crossfades smoothly */}
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          {isQuick ? (
            /* Quick View: top 3, title + tech + one-liner */
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p, i) => (
                <QuickCard key={p.id} project={p} delay={i * 0.08} />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-14">
                <FeaturedProject
                  project={featured}
                  onDemo={() => { track('Project Demo Opened'); setModal('demo'); }}
                  onCase={() => setModal('case')}
                  howOpen={!!howOpen.researchpilot}
                  toggleHow={() => toggleHow('researchpilot')}
                />
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    delay={Math.min(i * 0.08, 0.4)}
                    howOpen={!!howOpen[p.id]}
                    toggleHow={() => toggleHow(p.id)}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <CaseStudyModal open={modal === 'case'} onClose={() => setModal(null)} />
      <LiveDemoModal open={modal === 'demo'} onClose={() => setModal(null)} />
    </section>
  );
}
