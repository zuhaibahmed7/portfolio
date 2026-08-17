import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronDown, Clock } from 'lucide-react';
import { notes } from '../data/content.js';
import { Reveal, SectionHeading } from './ui.jsx';
import Modal from './Modal.jsx';

/* ---------------------------------------------------------------------------
   Notes / Writing (Feature #11) — lightweight, collapsible so it stays out
   of the way while the placeholder posts wait for real content.
   Clicking a card opens the post in a modal (placeholder body included).
--------------------------------------------------------------------------- */

export default function NotesSection() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <section id="notes" className="relative py-24 sm:py-28 print:hidden" aria-label="Notes and writing">
      <div className="container-x relative">
        <SectionHeading
          index={10}
          eyebrow="Notes & Writing"
          title="Things I'm thinking about"
          lead="Short write-ups from building — lessons, decisions and debugging stories."
        />

        {/* Collapsible area — keeps the page calm while mostly placeholder */}
        <Reveal delay={0.1}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="glass-card mt-8 flex w-full items-center justify-between gap-3 rounded-2xl px-6 py-4 text-left transition-all duration-300 hover:border-accent-cyan/40"
          >
            <span className="flex items-center gap-3 font-display text-sm font-semibold text-ink">
              <BookOpen size={17} className="text-accent-cyan" />
              {open ? 'Hide notes' : `Show ${notes.length} notes`}
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={18} className="text-muted" />
            </motion.span>
          </button>
        </Reveal>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 pt-5 md:grid-cols-3">
                {notes.map((note, i) => (
                  <Reveal key={note.id} delay={i * 0.08}>
                    <button
                      type="button"
                      onClick={() => setActive(note)}
                      className="glass-card group flex h-full w-full flex-col gap-3 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-violet/40 hover:shadow-glow"
                    >
                      <span className="flex items-center gap-2 text-[11px] text-muted">
                        <Clock size={12} /> {note.readMin} min read
                      </span>
                      <h3 className="font-display text-base font-semibold leading-snug text-ink transition-colors group-hover:text-accent-cyan">
                        {note.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-muted">{note.excerpt}</p>
                    </button>
                  </Reveal>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post viewer — plain paragraphs with lightweight **bold** support */}
      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title ?? ''} wide>
        {active && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent-cyan">
              {active.readMin} min read
            </p>
            {active.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted">
                <RichText text={para} />
              </p>
            ))}
          </div>
        )}
      </Modal>
    </section>
  );
}

/* Renders "plain text with **bold** spans" — splits on the markdown-ish
   delimiters and wraps the matches in <strong> (no markdown lib needed). */
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
