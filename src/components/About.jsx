import { motion, useReducedMotion } from 'framer-motion';
import { Award, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { education, interests, nowItems, nowUpdated, profile, translations } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { useTranslations } from '../hooks/useTranslations.js';
import { Reveal, SectionHeading } from './ui.jsx';
import profilePhoto from '../assets/profile.png';

/* "What I'm doing now" card (Feature #9) �?" always visible (both views),
   pulsing live dot signals current momentum. Six items in a 2-column grid
   on desktop (single column on mobile), each staggering in on scroll. */
function NowCard() {
  const reduced = useReducedMotion();

  return (
    <div className="glass-card--border-gradient glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-display text-sm font-semibold text-ink">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          What I&apos;m doing now
        </p>
        <span className="font-mono text-[10px] text-muted">Updated {nowUpdated}</span>
      </div>

      {/* 2-column grid on sm+, single column on mobile */}
      <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
        {nowItems.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: Math.min(i * 0.08, 0.48), duration: 0.4, ease: 'easeOut' }
            }
            className="flex gap-2.5 text-[13px] leading-snug text-muted"
          >
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-cyan" aria-hidden="true" />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function About() {
  const reduced = useReducedMotion();
  const { isQuick, view } = useView();
  const t = useTranslations();

  const facts = [
    { Icon: MapPin, label: 'Location', value: profile.location },
    { Icon: GraduationCap, label: 'Education', value: `${education.school} - continue` },
    { Icon: Award, label: 'Award', value: 'SEEF Sindh Government Scholarship recipient' },
    { Icon: Sparkles, label: 'Focus', value: 'AI, Machine Learning & Full-Stack Development' },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-28 sm:py-32" aria-label="About">
      <div className="aura left-1/2 top-0 h-[360px] w-[600px] -translate-x-1/2 bg-accent-violet/70" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={1}
          eyebrow="About"
          title={t.aboutTitle || 'Engineering intelligence into products'}
          lead={t.aboutLead || 'AI builder from Sindh, Pakistan — training models, wiring up agents, and shipping them to real users.'}
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* ---------- Photo card with gradient frame ---------- */}
          <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
            <motion.div
              whileHover={reduced ? {} : { rotate: 0, scale: 1.02 }}
              initial={reduced ? {} : { rotate: -2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="group relative"
            >
              <div className="absolute -inset-[2px] rounded-3xl bg-gradient-accent-diag opacity-70 blur-[2px] transition-opacity duration-500 group-hover:opacity-100" />
              <div className="glass-card relative overflow-hidden rounded-3xl p-2">
                <img
                  src={profilePhoto}
                  alt={`Portrait of ${profile.name}`}
                  className="aspect-[4/5] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-b-2xl bg-gradient-to-t from-base/90 via-base/30 to-transparent p-5 pt-16">
                  <p className="font-display text-lg font-semibold text-ink">{profile.name}</p>
                  <p className="text-xs text-accent-cyan">{profile.title}</p>
                </div>
              </div>

              <motion.div
                animate={reduced ? {} : { y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-card--border-gradient glass-card absolute -right-4 -top-4 hidden rounded-2xl px-4 py-3 sm:block"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Class of</p>
                <p className="font-display text-xl font-bold text-gradient">2028</p>
              </motion.div>
            </motion.div>
          </Reveal>

          {/* ---------- Bio + quick facts (condensed in Quick View) ---------- */}
          {/* Keyed by view so toggling crossfades the content swap */}
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            {!isQuick && (
              <>
                <Reveal delay={0.1}>
                  <p className="text-lg leading-relaxed text-muted">
                    {profile.bio.split('real world.')[0]}
                    <span className="text-ink">real world.</span>
                  </p>
                </Reveal>

                <Reveal delay={0.4}>
                  <p className="mt-9 font-mono text-[10px] uppercase tracking-widest text-muted">Key interests</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {interests.map((item) => (
                      <span key={item} className="pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </>
            )}

            <div className="mt-9 space-y-4">
              {facts.map(({ Icon, label, value }, i) => (
                <Reveal key={label} delay={0.15 + i * 0.08}>
                  <div className="glass-card flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 hover:border-accent-violet/40 hover:shadow-glow">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-cyan">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Now card �?" current momentum */}
            <Reveal delay={0.4}>
              <NowCard />
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}