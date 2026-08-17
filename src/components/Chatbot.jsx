import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { profile } from '../data/content.js';
import { track } from '../analytics.js';

/* ---------------------------------------------------------------------------
   Suggested starter questions shown when the chat is empty.
--------------------------------------------------------------------------- */
const STARTER_QUESTIONS = [
  'What projects has he built?',
  'What are his AI skills?',
  'How can I contact him?',
  'What is ResearchPilot?',
];

const WELCOME =
  "Hi! I'm Zuhaib's AI assistant 👋 Ask me anything about his projects, skills, education — or how to reach him.";

const FALLBACK_REPLY = `Hmm, I couldn't connect — try again in a moment. Meanwhile you can email Zuhaib directly at ${profile.email} 📩`;

/* Lightweight client-side log of unanswered/failed questions (no personal
   data) so Zuhaib can spot knowledge-base gaps. Kept in localStorage. */
function logUnanswered(question, reason) {
  try {
    const key = 'za-chat-unanswered';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ q: question.slice(0, 300), reason, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(log.slice(-50)));
  } catch {
    /* storage unavailable — ignore */
  }
}

/* One chat message bubble. User → gradient bubble on the right;
   bot → translucent glass bubble on the left. */
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-gradient-accent px-4 py-2.5 text-sm leading-relaxed text-white shadow-glow'
            : 'max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-ink backdrop-blur'
        }
      >
        {/* Preserve simple newlines from the model's formatting */}
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {line || '\u00A0'}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

/* Animated three-dot typing indicator while waiting for the LLM. */
function TypingDots() {
  const reduced = useReducedMotion();
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={reduced ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-accent-cyan"
          />
        ))}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // [{id, role, content, fallback?}]
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(0);

  // Keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Focus the input when the panel opens; Esc closes it
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), reduced ? 0 : 350);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, reduced]);

  const push = (msg) => setMessages((prev) => [...prev, { id: ++idRef.current, ...msg }]);

  /* Send a message through the server-side proxy. Multi-turn context: the
     full (non-fallback) history is sent with every request. */
  const send = async (rawText) => {
    const text = rawText.trim();
    if (!text || loading) return;

    push({ role: 'user', content: text });
    setInput('');
    setLoading(true);

    // Build the API history BEFORE the response arrives
    const history = [...messages.filter((m) => !m.fallback), { role: 'user', content: text }].map(
      ({ role, content }) => ({ role, content })
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = data?.reply;

      if (res.ok && typeof reply === 'string' && reply.trim()) {
        push({ role: 'assistant', content: reply });
        // Track knowledge gaps for future KB updates
        if (/don'?t have that information|don'?t have information/i.test(reply)) {
          logUnanswered(text, 'no_info');
        }
      } else {
        logUnanswered(text, `error_${res.status}`);
        push({ role: 'assistant', content: FALLBACK_REPLY, fallback: true });
      }
    } catch {
      logUnanswered(text, 'network');
      push({ role: 'assistant', content: FALLBACK_REPLY, fallback: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ---------------- Floating action button ---------------- */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => { if (!v) track('Chatbot Opened'); return !v; })}
        aria-label={open ? 'Close chat' : "Chat with Zuhaib's AI"}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { delay: 2.2, type: 'spring', stiffness: 260, damping: 18 }}
        className="fixed bottom-6 right-6 z-[80] grid h-14 w-14 place-items-center rounded-full bg-gradient-accent-diag text-white shadow-glow transition-transform duration-300 hover:scale-110 print:hidden"
      >
        {/* Subtle pulsing glow ring (hidden while open / reduced motion) */}
        {!open && (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-accent-violet/40 motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {open ? <X size={22} strokeWidth={2.2} /> : <MessageCircle size={22} strokeWidth={2.2} />}
      </motion.button>

      {/* ---------------- Chat panel ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Ask Zuhaib's AI"
            initial={{ opacity: 0, y: reduced ? 0 : 26, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 26, scale: reduced ? 1 : 0.96 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass-card glass-card--border-gradient fixed z-[70] flex flex-col overflow-hidden !rounded-3xl bg-surface/90 left-3 right-3 top-16 bottom-3 sm:left-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(560px,calc(100dvh-7.5rem))] sm:w-[400px] print:hidden"
          >
            {/* ---- Header ---- */}
            <header className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-accent-diag font-display text-xs font-bold text-white shadow-glow">
                ZA
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink">Ask Zuhaib&apos;s AI</p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Online — answers from his portfolio
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-muted transition-colors hover:text-ink"
              >
                <X size={17} strokeWidth={2} />
              </button>
            </header>

            {/* ---- Messages / starters ---- */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto scroll-smooth px-5 py-4"
              aria-live="polite"
            >
              {messages.length === 0 && !loading ? (
                <div className="space-y-4">
                  <Bubble msg={{ role: 'assistant', content: WELCOME }} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {STARTER_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="pill inline-flex items-center gap-1.5 !py-1.5 hover:border-accent-cyan/60 hover:text-accent-cyan"
                      >
                        <Sparkles size={11} className="text-accent-cyan" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <Bubble key={m.id} msg={m} />
                  ))}
                  {loading && <TypingDots />}
                </>
              )}
            </div>

            {/* ---- Input ---- */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-white/[0.07] p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={500}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Zuhaib…"
                  aria-label="Your question"
                  className="h-11 w-full rounded-xl border border-white/10 px-4 text-sm outline-none backdrop-blur transition-all focus:border-accent-cyan/60 focus:shadow-glow-cyan"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-accent text-white shadow-glow transition-all duration-300 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} strokeWidth={2.2} />
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
