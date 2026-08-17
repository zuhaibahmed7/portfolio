import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Github, Linkedin, Mail, Phone, Send, Youtube } from 'lucide-react';
import { profile, socials } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { CopyEmailButton, Magnetic, Reveal, SectionHeading } from './ui.jsx';
import Modal from './Modal.jsx';
import BookingFlow from './BookingFlow.jsx';
import { track } from '../analytics.js';

/* ---------------------------------------------------------------------------
   Contact section — glowing channels, single-path paid Book a Call modal
   (custom multi-step flow in BookingFlow: pick slot → duration → price →
   hold → payment confirmation), and the general contact form (Resend-backed
   with mailto fallback). General inquiries use email + the contact form.
--------------------------------------------------------------------------- */

/* Shared input styling — colors come from the global input rules in
   index.css (dark: #12121A bg + #F5F5F7 text; light: white bg + ink text)
   so every field on the site renders typed text consistently. */
const inputCls =
  'w-full rounded-xl border border-white/10 px-4 py-3 text-sm outline-none backdrop-blur transition-all duration-300 focus:border-accent-cyan/60 focus:shadow-glow-cyan';

export default function Contact() {
  const { isQuick, view } = useView();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // invisible to humans, catnip to bots
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | fallback
  const [bookOpen, setBookOpen] = useState(false);

  // Client-side validation — mirrored server-side in api/_contact.mjs
  const validate = () => {
    const next = {};
    if (!name.trim() || name.trim().length > 100) next.name = 'Please enter your name (≤100 chars).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!message.trim() || message.trim().length > 2000) next.message = 'Please enter a message (≤2000 chars).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Old fallback path — opens the visitor's email app pre-filled
  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio contact — ${name || 'Hello Zuhaib'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus('fallback');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        track('Contact Form Submitted');
        setStatus('sent');
      } else if (res.status === 429) {
        setErrors({ message: "You're sending a bit fast — try again in a minute." });
        setStatus('idle');
      } else {
        // Not configured (503) / upstream error → never dead-end: use mailto
        mailtoFallback();
      }
    } catch {
      mailtoFallback();
    }
  };

  const channels = [
    { Icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}`, glow: 'hover:shadow-glow hover:border-accent-violet/60' },
    { Icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}`, glow: 'hover:shadow-glow-cyan hover:border-accent-cyan/60' },
    { Icon: Github, label: 'GitHub', value: socials.github.href.replace('https://', ''), href: socials.github.href, glow: 'hover:shadow-glow hover:border-accent-violet/60' },
    { Icon: Linkedin, label: 'LinkedIn', value: socials.linkedin.href.replace('https://www.', ''), href: socials.linkedin.href, glow: 'hover:shadow-glow-cyan hover:border-accent-cyan/60' },
    { Icon: Youtube, label: 'YouTube', value: '@aiwithzuhaib', href: socials.youtube.href, glow: 'hover:shadow-glow-pink hover:border-accent-pink/60' },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-32" aria-label="Contact">
      <div className="aura left-1/2 top-1/2 h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 bg-accent-violet/60" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={11}
          eyebrow="Contact"
          title="Let's build something together"
          lead="Have an AI project, a data problem, or just want to talk shop? My inbox is open."
          align="center"
        />

        {/* Glowing channel buttons — email gets a one-tap copy beside it */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {channels.map(({ Icon, label, value, href, glow }, i) => (
            <Reveal key={label} delay={i * 0.07}>
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                aria-label={`${label}: ${value}`}
                className={`glass-card group flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-300 hover:-translate-y-1.5 ${glow}`}
              >
                <Icon size={19} strokeWidth={1.8} className="text-accent-cyan transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden text-sm font-medium text-ink sm:block">{value}</span>
                <span className="text-sm font-medium text-ink sm:hidden">{label}</span>
              </a>
            </Reveal>
          ))}
          <CopyEmailButton value={profile.email} />
        </div>

        {/* Book a Call — opens the paid consulting booking modal */}
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col items-center gap-3 print:hidden">
            <p className="text-sm text-muted">Prefer talking? Book a paid consulting session.</p>
            <Magnetic>
              <button type="button" onClick={() => { track('Book Call Clicked'); setBookOpen(true); }} className="btn-primary">
                <Calendar size={16} strokeWidth={2.2} />
                Book a Call
              </button>
            </Magnetic>
          </div>
        </Reveal>

        {/* Form hidden in Quick View — email CTA is enough for a 60s scan */}
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          {!isQuick && (
            <Reveal delay={0.35} className="mx-auto mt-12 max-w-xl print:hidden">
              <form onSubmit={onSubmit} className="glass-card--border-gradient glass-card rounded-3xl p-7 sm:p-8" noValidate>
                {status === 'sent' ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                      className="grid h-14 w-14 place-items-center rounded-full bg-gradient-accent shadow-glow"
                    >
                      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                        <motion.path
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
                        />
                      </svg>
                    </motion.span>
                    <p className="font-display text-lg font-semibold text-ink">Message sent!</p>
                    <p className="text-sm text-muted">Thanks for reaching out — Zuhaib will get back to you soon.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setName('');
                        setEmail('');
                        setMessage('');
                        setStatus('idle');
                      }}
                      className="btn-ghost mt-2 !px-6 !py-2.5 !text-xs"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Name</span>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          aria-invalid={!!errors.name}
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
                          }}
                          placeholder="Your name"
                          className={`${inputCls} ${errors.name ? '!border-accent-pink/70' : ''}`}
                        />
                        {errors.name && <span className="mt-1.5 block text-xs text-accent-pink">{errors.name}</span>}
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Email</span>
                        <input
                          type="email"
                          required
                          maxLength={150}
                          aria-invalid={!!errors.email}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                          }}
                          placeholder="you@example.com"
                          className={`${inputCls} ${errors.email ? '!border-accent-pink/70' : ''}`}
                        />
                        {errors.email && <span className="mt-1.5 block text-xs text-accent-pink">{errors.email}</span>}
                      </label>
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Message</span>
                      <textarea
                        required
                        rows={4}
                        maxLength={2000}
                        aria-invalid={!!errors.message}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) setErrors((er) => ({ ...er, message: undefined }));
                        }}
                        placeholder="Tell me about your project…"
                        className={`${inputCls} resize-none ${errors.message ? '!border-accent-pink/70' : ''}`}
                      />
                      {errors.message && <span className="mt-1.5 block text-xs text-accent-pink">{errors.message}</span>}
                    </label>

                    {/* Honeypot — hidden from humans (CSS + a11y), irresistible to bots.
                        Server silently swallows submissions that fill it. */}
                    <input
                      type="text"
                      name="company"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="absolute h-0 w-0 opacity-0"
                      style={{ position: 'absolute', left: '-9999px' }}
                    />

                    {status === 'fallback' && (
                      <p className="mt-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] px-4 py-3 text-xs text-accent-cyan">
                        Your email app should have opened with the message pre-filled — or write to {profile.email} directly.
                      </p>
                    )}

                    <Magnetic className="mt-6 block">
                      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
                        {status === 'sending' ? 'Sending…' : 'Send Message'}
                        <Send size={15} strokeWidth={2.2} />
                      </button>
                    </Magnetic>
                  </>
                )}
              </form>
            </Reveal>
          )}
        </motion.div>
      </div>

      {/* Paid consulting booking — custom multi-step flow (no free call path) */}
      <Modal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        title="Book a paid consulting call"
        subtitle="Pick a time slot, reserve it, and confirm after payment."
        wide
      >
        <BookingFlow />
      </Modal>
    </section>
  );
}
