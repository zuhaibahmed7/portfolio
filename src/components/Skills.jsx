import { motion } from 'framer-motion';
import { Bot, BrainCircuit, Code2, Container, Database, PenTool, Server } from 'lucide-react';
import { learningByCategory, skillCategories } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { useTranslations } from '../hooks/useTranslations.js';
import { Pill, Reveal, SectionHeading } from './ui.jsx';
import TechLogo from './TechLogo.jsx';

// Icon mapping per skill category
const ICONS = {
  code: Code2,
  bot: Bot,
  brain: BrainCircuit,
  server: Server,
  container: Container,
  database: Database,
  design: PenTool,
};

export default function Skills() {
  const { isQuick, view } = useView();
  const t = useTranslations();

  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-32" aria-label="Skills">
      <div className="aura -right-40 top-24 h-[420px] w-[420px] bg-accent-cyan/70" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={2}
          eyebrow="Skills"
          title={isQuick ? 'The essentials' : (t.skillsTitle || 'A full-stack AI toolkit')}
          lead={
            isQuick
              ? 'Top three skills per area — flip to Detailed View for the complete toolkit.'
              : 'From multi-agent LLM pipelines and ML model training to backend APIs, containers and design — the stack I use to take ideas from notebook to deployment.'
          }
        />

        {/* Keyed by view so the quick/detailed swap crossfades */}
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {skillCategories.map((cat, ci) => {
              const Icon = ICONS[cat.icon] ?? Code2;
              // Quick View: only the top 3 skills per category (Feature #5)
              const skills = isQuick ? cat.skills.slice(0, 3) : cat.skills;
              const learning = isQuick ? [] : (learningByCategory[cat.name] ?? []);
              const wide = !isQuick && (ci === 1 || ci === 2); // long categories get a 2-col slot on lg
              return (
                <Reveal key={cat.name} delay={Math.min(ci * 0.07, 0.5)} className={wide ? 'lg:col-span-2' : ''}>
                  <div className="glass-card group h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-violet/40 hover:shadow-glow">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-accent-diag/20 text-accent-cyan transition-transform duration-300 group-hover:scale-110">
                        <Icon size={19} strokeWidth={1.8} />
                      </span>
                      <h3 className="font-display text-base font-semibold text-ink">{cat.name}</h3>
                    </div>

                    {/* Two tiers: core skills (solid pills) + actively-learning
                        skills (◌ dot + "learning" tag, dashed border) —
                        deliberately understated, no percentage bars. */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {skills.map((skill, si) => (
                        <Pill key={skill} index={si}>
                          <TechLogo name={skill} className="mr-1.5" />
                          {skill}
                        </Pill>
                      ))}
                      {learning.map((skill, si) => (
                        <Pill key={`learning-${skill}`} index={skills.length + si}>
                          <span
                            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full border border-accent-cyan/80 align-[1px]"
                            aria-hidden="true"
                          />
                          {skill}
                          <span className="ml-1.5 text-[9px] font-medium uppercase tracking-wider text-accent-cyan/80">
                            learning
                          </span>
                        </Pill>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Tier legend — one line, easy to miss unless you're looking */}
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="mx-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan/80 align-[1px]" aria-hidden="true" /> core
            <span className="mx-2">·</span>
            <span className="mx-1 inline-block h-1.5 w-1.5 rounded-full border border-accent-cyan/80 align-[1px]" aria-hidden="true" /> actively learning
          </p>
        </motion.div>
      </div>
    </section>
  );
}
