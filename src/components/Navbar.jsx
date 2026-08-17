import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Youtube, Menu, X, Download, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';
import { socials } from '../data/content.js';
import { track } from '../analytics.js';

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'GitHub', href: '#github' },
  { label: 'Projects', href: '#projects' },
  { label: 'Hackathons', href: '#hackathons' },
  { label: 'Praise', href: '#testimonials' },
  { label: 'Certs', href: '#certifications' },
  { label: 'Notes', href: '#notes' },
  { label: 'Contact', href: '#contact' },
];

function SocialLinks({ className = '' }) {
  const items = [
    { Icon: Github, href: socials.github.href, label: socials.github.label },
    { Icon: Linkedin, href: socials.linkedin.href, label: socials.linkedin.label },
    { Icon: Youtube, href: socials.youtube.href, label: socials.youtube.label },
  ];
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {items.map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className="rounded-lg p-2 text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-accent-cyan"
        >
          <Icon size={18} strokeWidth={1.8} />
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const { isLight, toggle: toggleTheme } = useTheme();

  // Turn on the glassmorphic background once the page is scrolled a bit
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 print:hidden ${
        scrolled
          ? 'border-b border-white/[0.06] bg-base/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-[72px] items-center justify-between" aria-label="Primary">
        {/* Logo / initials */}
        <a
          href="#top"
          className="group flex items-center gap-2.5"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-accent-diag font-display text-sm font-bold text-white shadow-glow transition-transform duration-300 group-hover:scale-105">
            ZA
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-wide text-ink sm:block">
            Zuhaib<span className="text-accent-cyan">.</span>Ahmed
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-4 xl:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link !text-[13px]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <SocialLinks className="hidden 2xl:flex" />
          {/* Light/dark theme toggle — persisted, OS-preference default */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className="rounded-lg p-2 text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-accent-cyan"
          >
            {isLight ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
          </button>
          {/* Resume download */}
          <a href="/resume.pdf" download="Zuhaib-Ahmed-Resume.pdf" onClick={() => track('Resume Downloaded')} className="btn-primary !px-5 !py-2.5 hidden sm:inline-flex">
            <Download size={15} strokeWidth={2} />
            Resume
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-ink transition-colors hover:text-accent-cyan xl:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown panel — slides/fades in via AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-white/[0.06] bg-base/95 backdrop-blur-xl xl:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-display text-base font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <li className="mt-2 flex items-center justify-between px-3">
                <SocialLinks />
                <a href="/resume.pdf" download="Zuhaib-Ahmed-Resume.pdf" onClick={() => track('Resume Downloaded')} className="btn-primary !px-5 !py-2.5">
                  <Download size={15} strokeWidth={2} />
                  Resume
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
