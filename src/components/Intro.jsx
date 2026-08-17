import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Page-load intro (~1.1s total): monogram pops in, name reveals, then the whole
 * overlay slides up like a curtain. Click anywhere to skip.
 * Skipped entirely for reduced-motion users.
 */
export default function Intro() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(!reduced);
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) return undefined;
    // Hide the overlay after 1.1s (AnimatePresence then plays the exit curtain)
    const t = setTimeout(() => setShow(false), 1100);
    // Hard fallback: if animations are throttled (e.g. background tab / guest
    // webview where rAF never fires), force-unmount so the overlay can never
    // trap the page behind it.
    const hard = setTimeout(() => setDone(true), 2600);
    return () => {
      clearTimeout(t);
      clearTimeout(hard);
    };
  }, [reduced]);

  if (done) return null;

  return (
    <AnimatePresence onExitComplete={() => setDone(true)}>
      {show && (
        <motion.div
          // Click / key / tap skips straight to the site
          onClick={() => setShow(false)}
          initial={{ opacity: 1 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-base"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-4 overflow-hidden">
            {/* Monogram scale/fade in */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-accent-diag font-display text-xl font-bold text-white shadow-glow"
            >
              ZA
            </motion.div>
            {/* Name slides up from behind an overflow mask */}
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '-110%' }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-sm font-semibold uppercase tracking-[0.45em] text-muted"
              >
                Zuhaib Ahmed
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
