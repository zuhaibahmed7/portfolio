import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Download, Facebook, Github, Globe, Instagram, Layers, Linkedin, Mail, Twitter, X, Youtube, Zap } from 'lucide-react';
import { profile, roles, socials } from '../data/content.js';
import { useTranslations } from '../hooks/useTranslations.js';
import { useTypewriter } from '../hooks/useTypewriter.js';
import { useView } from '../context/ViewContext.jsx';
import { CopyEmailButton, Magnetic } from './ui.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { track } from '../analytics.js';

// The 3D scene is code-split so it never blocks the first paint of the text
const Scene3D = lazy(() => import('./Scene3D.jsx'));

/* Staggered letter-by-letter reveal for the hero name.
   Each letter starts translated 110% down inside an overflow-hidden mask. */
function AnimatedName() {
  const reduced = useReducedMotion();
  const words = [profile.firstName, profile.lastName];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.035, delayChildren: 1.25 } },
  };
  const letter = {
    hidden: { y: '115%', rotate: 6, opacity: reduced ? 1 : 0 },
    show: {
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="show"
      aria-label={profile.name}
      className="font-display text-[clamp(2.75rem,9vw,6.5rem)] font-bold leading-[1.04] tracking-tight text-ink"
    >
      {words.map((word, wi) => (
        <span key={word} className="inline-block whitespace-nowrap">
          {word.split('').map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span variants={letter} className={`inline-block ${wi === 1 ? 'text-gradient' : ''}`}>
                {ch}
              </motion.span>
            </span>
          ))}
          {wi === 0 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.h1>
  );
}

/* Quick/Detailed segmented control (Feature #5) */
function ViewToggle() {
  const { view, setView } = useView();
  const options = [
    { id: 'quick', label: 'Quick', Icon: Zap },
    { id: 'detailed', label: 'Detailed', Icon: Layers },
  ];
  return (
    <div role="group" aria-label="View mode" className="glass-card inline-flex items-center gap-1 rounded-full p-1">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setView(id)}
          aria-pressed={view === id}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
            view === id ? 'bg-gradient-accent text-white shadow-glow' : 'text-muted hover:text-ink'
          }`}
        >
          <Icon size={12} strokeWidth={2.2} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* One-time nudge toward Quick View for recruiters (dismissable).
   Hidden once the visitor is already in Quick View. */
function RecruiterNudge() {
  const { isQuick, setView } = useView();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('za-nudge-dismissed') === '1';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('za-nudge-dismissed', '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && !isQuick && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          className="inline-flex items-center overflow-hidden rounded-full border border-accent-cyan/30 bg-accent-cyan/[0.06] pl-3 pr-1 text-xs text-accent-cyan"
        >
          <button type="button" onClick={() => setView('quick')} className="py-1.5 pr-2 font-medium transition-colors hover:text-ink">
            ⚡ Recruiter? Try Quick View
          </button>
          <button type="button" onClick={dismiss} aria-label="Dismiss tip" className="rounded-full p-1 text-muted hover:text-ink">
            <X size={12} />
          </button>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const typed = useTypewriter(roles);
  const { isQuick } = useView();
  const t = useTranslations();
  const { isLight } = useTheme();
  const [mountScene, setMountScene] = useState(false);

  // Delay the (heavy) 3D canvas until after the intro + text have painted
  useEffect(() => {
    if (reduced || isLight) return undefined; // reduced motion / light mode → static aurora only
    const t = setTimeout(() => setMountScene(true), 350);
    return () => clearTimeout(t);
  }, [reduced, isLight]);

  const fade = (delay) => ({
    initial: { opacity: 0, y: reduced ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const socialItems = [
    { Icon: Github, href: socials.github.href, label: socials.github.label },
    { Icon: Linkedin, href: socials.linkedin.href, label: socials.linkedin.label },
    { Icon: Youtube, href: socials.youtube.href, label: socials.youtube.label },
    { Icon: Instagram, href: socials.instagram.href, label: socials.instagram.label },
    { Icon: Twitter, href: socials.x.href, label: socials.x.label },
    { Icon: Facebook, href: socials.facebook.href, label: socials.facebook.label },
    { Icon: Globe, href: socials.kaggle.href, label: socials.kaggle.label },
    { Icon: Globe, href: socials.hackerrank.href, label: socials.hackerrank.label },
    { Icon: Globe, href: socials.replit.href, label: socials.replit.label },
    { Icon: Globe, href: socials.lovable.href, label: socials.lovable.label },
    { Icon: Globe, href: socials.leetcode.href, label: socials.leetcode.label },
    { Icon: Mail, href: `mailto:${profile.email}`, label: 'Email' },
  ];

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden" aria-label="Intro">
      {/* ---------- Background layers ---------- */}
      <div className="grid-overlay absolute inset-0" aria-hidden="true" />
      <div className="aura -left-40 top-1/4 h-[480px] w-[480px] bg-accent-violet" aria-hidden="true" />
      <div className="aura -right-32 bottom-0 h-[420px] w-[420px] bg-accent-cyan" aria-hidden="true" />

      {mountScene && (
        <div className="absolute inset-0" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </div>
      )}

      <div
        className="hero-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.55)_78%,#0A0A0F_100%)]"
        aria-hidden="true"
      />

      {/* ---------- Content ---------- */}
      <div className="container-x relative z-10 pb-24 pt-36 sm:pt-40">
        <motion.p
          {...fade(1.1)}
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-xs text-muted backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
          </span>
          {t.heroStatus}
        </motion.p>

        <AnimatedName />

        {/* Typewriter role line */}
        <motion.div {...fade(1.55)} className="mt-5 flex h-9 items-center font-display text-xl font-bold sm:text-2xl">
          <span className="mr-3 text-muted">{'//'}</span>
          <span className="text-gradient">{typed}</span>
          <span className="type-caret h-6" aria-hidden="true" />
        </motion.div>

        {/* Long summary only in Detailed View — Quick keeps the scan tight */}
        {!isQuick && (
          <motion.p {...fade(1.7)} className="mt-6 max-w-2xl leading-relaxed text-muted">
            {t.heroSummary || profile.summary}
          </motion.p>
        )}

        {/* CTAs with magnetic hover — resume button included (Feature #4) */}
        <motion.div {...fade(1.85)} className="mt-10 flex flex-wrap items-center gap-4 print:hidden">
          <Magnetic>
            <a href="#projects" className="btn-primary">
              View Projects
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#contact" className="btn-ghost">
              <Mail size={16} strokeWidth={2} />
              Contact Me
            </a>
          </Magnetic>
          <Magnetic>
            <a href="/resume.pdf" download="Zuhaib-Ahmed-Resume.pdf" onClick={() => track('Resume Downloaded')} className="btn-ghost !px-6">
              <Download size={16} strokeWidth={2} />
              Resume
            </a>
          </Magnetic>
        </motion.div>

        {/* Quick/Detailed toggle + recruiter nudge (Feature #5) */}
        <motion.div {...fade(2)} className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
          <ViewToggle />
          <RecruiterNudge />
        </motion.div>

        {/* Social row */}
        <motion.div {...fade(2.1)} className="mt-8 flex items-center gap-2 print:hidden">
          {socialItems.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer noopener"
              aria-label={label}
              className="glass-card grid h-11 w-11 place-items-center rounded-xl text-muted transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/50 hover:text-accent-cyan hover:shadow-glow"
            >
              <Icon size={18} strokeWidth={1.8} />
            </a>
          ))}
          <CopyEmailButton value={profile.email} />
        </motion.div>
      </div>

      {/* Scroll hint — gently bounces (paused for reduced motion) */}
      <motion.a
        href="#about"
        aria-label="Scroll to About section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-muted transition-colors hover:text-accent-cyan print:hidden"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="block"
        >
          <ChevronDown size={26} strokeWidth={1.6} />
        </motion.span>
      </motion.a>
    </section>
  );
}
