import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useSpring } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useView } from '../context/ViewContext.jsx';
import { track } from '../analytics.js';

/* ---------------------------------------------------------------------------
   SectionHeading — eyebrow ("01 · About"), gradient title, optional lead text.
   Reveals with a fade/slide-up when scrolled into view.
--------------------------------------------------------------------------- */
export function SectionHeading({ index, eyebrow, title, lead, align = 'left' }) {
  const reduced = useReducedMotion();
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-3 ${alignCls}`}
    >
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-cyan/90">
        {String(index).padStart(2, '0')} · {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
        {title} <span className="text-gradient">.</span>
      </h2>
      {lead && <p className="max-w-2xl text-base leading-relaxed text-muted">{lead}</p>}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   Reveal — generic scroll-triggered fade/slide-up wrapper.
--------------------------------------------------------------------------- */
export function Reveal({ children, delay = 0, y = 32, className = '', as = 'div' }) {
  const reduced = useReducedMotion();
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/* ---------------------------------------------------------------------------
   Magnetic — wrapper that makes buttons subtly follow the cursor (spring pull),
   a signature "award-site" hover feel. Disabled for reduced motion / touch.
--------------------------------------------------------------------------- */
export function Magnetic({ children, strength = 0.28, className = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // Springy translation values — framer interpolates toward the raw offsets
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Cursor offset from the element center, scaled down by `strength`
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   Pill — small tech/skill tag with staggered pop-in on scroll.
--------------------------------------------------------------------------- */
export function Pill({ children, index = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 320,
              damping: 20,
              // Stagger each tag by its index for the pop-in cascade
              delay: Math.min(index * 0.045, 1.2),
            }
      }
      className="pill"
    >
      {children}
    </motion.span>
  );
}

/* ---------------------------------------------------------------------------
   CountUp — number that eases from 0 → `to` (easeOutCubic in a rAF loop)
   once the element scrolls into view. Used by the GitHub stats.
--------------------------------------------------------------------------- */
export function CountUp({ to, duration = 1.3, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInViewOnce(ref);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

/* Tiny wrapper around framer's useInView so callers don't repeat options */
function useInViewOnce(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '-40px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
}

/* ---------------------------------------------------------------------------
   SectionGate — hides a section in Quick View with a fade-out exit
   (part of the recruiter Quick/Detailed toggle, Feature #5).
--------------------------------------------------------------------------- */
export function SectionGate({ children }) {
  const { isQuick } = useView();
  return (
    <AnimatePresence initial={false}>
      {!isQuick && (
        <motion.div
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------------
   CopyValueButton — generic one-tap clipboard copy with a 1.5s icon swap
   (Copy -> animated Check). Falls back to a hidden-textarea execCommand copy
   for browsers without the async Clipboard API.
--------------------------------------------------------------------------- */
export function CopyValueButton({ value, label, title = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      // Legacy fallback: temporary off-screen textarea + execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      track('Copied to Clipboard');
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      title={title}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-muted backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/50 hover:text-accent-cyan ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Check size={15} strokeWidth={2.4} className="text-emerald-400" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Copy size={15} strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* Email-specific wrapper kept for the existing Hero/Contact/Footer usage */
export function CopyEmailButton({ value, className = '' }) {
  return (
    <CopyValueButton
      value={value}
      label={`Copy email address ${value}`}
      title="Copy email address"
      className={`!h-11 !w-11 rounded-xl ${className}`}
    />
  );
}
