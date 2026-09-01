import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Facebook, Github, Globe, Instagram, Linkedin, Mail, Phone, Send, Twitter, Youtube } from 'lucide-react';
import { profile, socials } from '../data/content.js';
import { useView } from '../context/ViewContext.jsx';
import { useTranslations } from '../hooks/useTranslations.js';
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
  const t = useTranslations();
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
    { Icon: Instagram, label: 'Instagram', value: '@aiwithzuhaib', href: socials.instagram.href, glow: 'hover:shadow-glow-pink hover:border-accent-pink/60' },
    { Icon: Twitter, label: 'X (Twitter)', value: '@ZohaibAhmedMah2', href: socials.x.href, glow: 'hover:shadow-glow-cyan hover:border-accent-cyan/60' },
    { Icon: Facebook, label: 'Facebook', value: 'Zuhaib Ahmed', href: socials.facebook.href, glow: 'hover:shadow-glow hover:border-accent-violet/60' },
  ];

  const platformLinks = [
    { Icon: Globe, label: 'Kaggle', value: 'kaggle.com/zuhaib123', href: socials.kaggle.href, category: 'Data Science' },
    { Icon: Globe, label: 'HackerRank', value: 'hackerrank.com/shoaibmahar347', href: socials.hackerrank.href, category: 'Coding Challenges' },
    { Icon: Globe, label: 'LeetCode', value: 'leetcode.com/zuhaibahmed347', href: socials.leetcode.href, category: 'Coding Challenges' },
    { Icon: Globe, label: 'Replit', value: 'replit.com/@zuhaibmahar234', href: socials.replit.href, category: 'Development' },
    { Icon: Globe, label: 'Lovable', value: 'lovable.dev/@zulodro_z', href: socials.lovable.href, category: 'Development' },
    { Icon: Globe, label: 'Hugging Face', value: 'huggingface.co/zuhaibahmed7', href: socials.huggingface.href, category: 'AI / ML' },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-32" aria-label="Contact">
      <div className="aura left-1/2 top-1/2 h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 bg-accent-violet/60" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={14}
          eyebrow="Contact"
          title={t.contactTitle || "Let's build something together"}
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

        {/* Coding & Platform Profiles */}
        <Reveal delay={0.4}>
          <div className="mt-16">
            <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-muted">Find me elsewhere</p>
            {(() => {
              const categories = {};
              platformLinks.forEach((link) => {
                if (!categories[link.category]) categories[link.category] = [];
                categories[link.category].push(link);
              });
              return (
                <div className="flex flex-col items-center gap-6">
                  {Object.entries(categories).map(([cat, links]) => (
                    <div key={cat} className="text-center">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-cyan/70">{cat}</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {links.map(({ Icon, label, value, href }) => (
                          <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="glass-card group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/40 hover:shadow-glow"
                          >
                            <Icon size={16} strokeWidth={1.8} className="text-accent-cyan transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-medium text-ink">{label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Reveal>

        {/* Form hidden in Quick View — email CTA is enough for a 60s scan */}
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          {!isQuick && (
            <Reveal delay={0.35} className="mt-12 print:hidden">
              <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-5">
              {/* Character illustration — right side */}
              <div className="hidden lg:col-span-2 lg:flex lg:justify-center">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Glow behind character */}
                  <div className="absolute -inset-8 rounded-full bg-accent-violet/20 blur-3xl" />
                  <div className="absolute -inset-4 rounded-full bg-accent-cyan/10 blur-2xl" />
                  {/* Developer character SVG */}
                  <svg viewBox="0 0 400 450" className="relative w-[320px] xl:w-[380px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Bean bag chair */}
                    <ellipse cx="200" cy="380" rx="140" ry="55" fill="#1a1a2e" />
                    <ellipse cx="200" cy="370" rx="130" ry="50" fill="#16213e" />
                    <ellipse cx="200" cy="365" rx="120" ry="45" fill="#0f3460" />
                    {/* Body / hoodie */}
                    <path d="M155 280 C155 240 175 210 200 200 C225 210 245 240 245 280 L250 340 C250 355 230 365 200 365 C170 365 150 355 150 340 Z" fill="#e74c3c" />
                    {/* Hoodie details */}
                    <path d="M185 230 L200 215 L215 230" stroke="#c0392b" strokeWidth="2" fill="none" />
                    <line x1="200" y1="215" x2="200" y2="290" stroke="#c0392b" strokeWidth="1.5" opacity="0.5" />
                    {/* Hood */}
                    <path d="M160 240 C160 200 175 180 200 175 C225 180 240 200 240 240" stroke="#c0392b" strokeWidth="3" fill="none" opacity="0.6" />
                    {/* Arms */}
                    <path d="M155 290 C130 300 120 320 125 340" stroke="#e74c3c" strokeWidth="20" strokeLinecap="round" fill="none" />
                    <path d="M245 290 C270 300 280 320 275 340" stroke="#e74c3c" strokeWidth="20" strokeLinecap="round" fill="none" />
                    {/* Hands */}
                    <circle cx="125" cy="345" r="12" fill="#f5cba7" />
                    <circle cx="275" cy="345" r="12" fill="#f5cba7" />
                    {/* Laptop */}
                    <rect x="105" y="335" width="80" height="50" rx="4" fill="#2c3e50" />
                    <rect x="110" y="340" width="70" height="35" rx="2" fill="#34495e" />
                    {/* Screen code lines */}
                    <line x1="118" y1="350" x2="145" y2="350" stroke="#2ecc71" strokeWidth="2" opacity="0.8" />
                    <line x1="118" y1="356" x2="155" y2="356" stroke="#3498db" strokeWidth="2" opacity="0.8" />
                    <line x1="118" y1="362" x2="140" y2="362" stroke="#9b59b6" strokeWidth="2" opacity="0.8" />
                    <line x1="125" y1="368" x2="160" y2="368" stroke="#e67e22" strokeWidth="2" opacity="0.6" />
                    {/* Laptop keyboard hint */}
                    <rect x="100" y="385" width="90" height="5" rx="2" fill="#34495e" opacity="0.8" />
                    {/* Head */}
                    <circle cx="200" cy="165" r="50" fill="#f5cba7" />
                    {/* Hair */}
                    <path d="M150 155 C150 110 175 90 200 85 C225 90 250 110 250 155 C250 140 240 120 200 115 C160 120 150 140 150 155" fill="#2c1810" />
                    <path d="M155 150 C155 130 170 115 200 110 C230 115 245 130 245 150 C245 135 235 120 200 118 C165 120 155 135 155 150" fill="#3d2314" />
                    {/* Spiky hair top */}
                    <path d="M170 105 L175 80 L185 100" fill="#2c1810" />
                    <path d="M190 95 L195 70 L205 92" fill="#2c1810" />
                    <path d="M210 100 L218 78 L225 98" fill="#2c1810" />
                    {/* Eyes */}
                    <ellipse cx="183" cy="162" rx="8" ry="9" fill="white" />
                    <ellipse cx="217" cy="162" rx="8" ry="9" fill="white" />
                    <circle cx="185" cy="163" r="4" fill="#2c1810" />
                    <circle cx="219" cy="163" r="4" fill="#2c1810" />
                    <circle cx="186" cy="162" r="1.5" fill="white" />
                    <circle cx="220" cy="162" r="1.5" fill="white" />
                    {/* Eyebrows */}
                    <path d="M173 150 Q183 145 193 150" stroke="#2c1810" strokeWidth="2" fill="none" />
                    <path d="M207 150 Q217 145 227 150" stroke="#2c1810" strokeWidth="2" fill="none" />
                    {/* Smile */}
                    <path d="M188 178 Q200 188 212 178" stroke="#c0392b" strokeWidth="2" fill="none" />
                    {/* Phone in hand */}
                    <rect x="260" y="320" width="22" height="38" rx="3" fill="#2c3e50" />
                    <rect x="262" y="324" width="18" height="28" rx="1" fill="#3498db" opacity="0.3" />
                    {/* Small table with books */}
                    <rect x="290" y="310" width="50" height="5" rx="2" fill="#5d4e37" />
                    <rect x="300" y="295" width="30" height="15" rx="2" fill="#e74c3c" />
                    <rect x="305" y="282" width="25" height="13" rx="2" fill="#3498db" />
                    <rect x="310" y="270" width="20" height="12" rx="2" fill="#2ecc71" />
                    {/* Table leg */}
                    <line x1="315" y1="315" x2="315" y2="365" stroke="#5d4e37" strokeWidth="3" />
                    {/* Coffee mug */}
                    <rect x="295" y="260" width="15" height="14" rx="2" fill="#ecf0f1" />
                    <path d="M310 264 Q318 264 318 271 Q318 278 310 278" stroke="#bdc3c7" strokeWidth="1.5" fill="none" />
                    {/* Steam */}
                    <path d="M300 258 Q303 252 300 246" stroke="white" strokeWidth="1" opacity="0.3" />
                    <path d="M306 256 Q309 250 306 244" stroke="white" strokeWidth="1" opacity="0.3" />
                    {/* Backpack */}
                    <rect x="335" y="340" width="35" height="45" rx="5" fill="#2c3e50" />
                    <rect x="340" y="345" width="25" height="12" rx="2" fill="#34495e" />
                    <text x="347" y="354" fill="#e74c3c" fontSize="7" fontWeight="bold">{'<>'}</text>
                    {/* Plant */}
                    <rect x="320" y="252" width="12" height="10" rx="2" fill="#27ae60" opacity="0.7" />
                    <circle cx="326" cy="248" r="6" fill="#2ecc71" opacity="0.5" />
                    <circle cx="322" cy="245" r="5" fill="#27ae60" opacity="0.5" />
                    <circle cx="330" cy="246" r="5" fill="#2ecc71" opacity="0.5" />
                  </svg>
                </motion.div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3">
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
              </div>
              </div>
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
