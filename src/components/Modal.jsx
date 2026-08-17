import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

/* ---------------------------------------------------------------------------
   Shared modal shell (glass theme) used by: ResearchPilot live demo,
   case study, Book a Call, and Notes post viewer.
   Children are unmounted on close, so inner state (e.g. iframe loaded flags)
   resets automatically when reopened. Esc / backdrop click closes.
--------------------------------------------------------------------------- */
export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.25 }}
          className="fixed inset-0 z-[95] grid place-items-center p-4 sm:p-6 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop — click to close */}
          <div className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

          <motion.div
            initial={{ y: reduced ? 0 : 26, scale: reduced ? 1 : 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: reduced ? 0 : 26, scale: reduced ? 1 : 0.97, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 28 }}
            className={`glass-card glass-card--border-gradient relative flex max-h-[88vh] w-full flex-col overflow-hidden !rounded-3xl bg-surface/95 ${
              wide ? 'max-w-4xl' : 'max-w-xl'
            }`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-muted transition-colors hover:text-ink"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
