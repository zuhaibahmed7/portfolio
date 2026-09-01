import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useView } from '../context/ViewContext.jsx';
import { smoothScrollTo } from '../lib/smoothScroll.js';

const SECTIONS = [
  { id: 'top', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'github', label: 'GitHub' },
  { id: 'projects', label: 'Projects' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'testimonials', label: 'Praise' },
  { id: 'certifications', label: 'Certs' },
  { id: 'notes', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
];

const sectionTop = (id) => {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
};

export default function ScrollRail() {
  const { view } = useView();
  const [present, setPresent] = useState(SECTIONS);
  const [active, setActive] = useState('top');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  // Recompute which sections exist after Quick/Detailed swaps finish
  // (SectionGate unmounts happen ~300ms into the exit animation)
  useEffect(() => {
    const t = setTimeout(() => {
      setPresent(SECTIONS.filter((s) => document.getElementById(s.id)));
    }, 350);
    return () => clearTimeout(t);
  }, [view]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = window.scrollY + window.innerHeight * 0.38;
      let current = 'top';
      for (const s of present) {
        if (sectionTop(s.id) <= probe) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [present]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-accent print:hidden"
      />
      <nav
        aria-label="Sections"
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block print:hidden"
      >
        <ul className="flex flex-col items-end gap-2.5">
          {present.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => smoothScrollTo(s.id === 'top' ? 0 : `#${s.id}`)}
                aria-label={`Go to ${s.label}`}
                aria-current={active === s.id ? 'true' : undefined}
                className="group flex items-center gap-2"
              >
                <span
                  className={`pointer-events-none font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    active === s.id ? 'text-accent-cyan opacity-100' : 'text-muted opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    active === s.id
                      ? 'h-2.5 w-2.5 bg-gradient-accent shadow-glow'
                      : 'h-1.5 w-1.5 bg-white/20 group-hover:bg-white/50'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
