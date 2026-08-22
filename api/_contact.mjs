// ---------------------------------------------------------------------------
// Shared contact-form backend used by BOTH:
//   • api/contact.js   → Vercel serverless function (production)
//   • vite.config.js   → dev/preview middleware (local)
//
// Validates server-side, traps bots with a honeypot, rate-limits per IP, and
// delivers to Zuhaib's inbox via the Resend API. The RESEND_API_KEY lives
// server-side only — never in the client bundle.
//
// Env vars (see .env.example):
//   RESEND_API_KEY  (required for delivery)  e.g. re_...
//   RESEND_FROM     (optional)  default: onboarding@resend.dev (Resend's
//                               test sender — replace with your verified domain)
//   CONTACT_TO      (optional)  default: zuhaibmahar234@gmail.com
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @returns {{ok: boolean, error?: string} | {ok: true} } */
function validate(p) {
  const name = typeof p?.name === 'string' ? p.name.trim() : '';
  const email = typeof p?.email === 'string' ? p.email.trim() : '';
  const message = typeof p?.message === 'string' ? p.message.trim() : '';
  const honeypot = typeof p?.company === 'string' ? p.company : '';

  // Honeypot filled → almost certainly a bot. Pretend success so bots
  // don't learn to drop the field; never send their payload.
  if (honeypot) return { ok: true, bot: true };

  if (!name || name.length > 100) return { ok: false, error: 'name' };
  if (!EMAIL_RE.test(email) || email.length > 150) return { ok: false, error: 'email' };
  if (!message || message.length > 2000) return { ok: false, error: 'message' };
  return { ok: true, name, email, message };
}

/** Provide user-friendly resolution hints for contact form errors */
function getResolutionHint(error) {
  switch (error) {
    case 'name':
      return 'Enter your name (1-100 characters).';
    case 'email':
      return 'Enter a valid email address (1-150 characters).';
    case 'message':
      return 'Enter a message (1-2000 characters).';
    default:
      return 'Please check the form and try again.';
  }
}

/**
 * @returns {Promise<{status: number, ok: boolean, error: string, resolution_hint: string}>}
 */
export async function submitContact(payload) {
  const v = validate(payload);
  if (!v.ok) return { status: 422, ok: false, error: v.error, resolution_hint: getResolutionHint(v.error) };
  if (v.bot) return { status: 200, ok: true, error: null, resolution_hint: null };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured — client falls back to the mailto: flow
    return { status: 503, ok: false, error: 'not_configured', resolution_hint: 'Contact form temporarily unavailable. Email service not configured. Use the mailto: link below.' };
  }

  const to = process.env.CONTACT_TO || 'zuhaibmahar234@gmail.com';
  const from = process.env.RESEND_FROM || 'Zuhaib Ahmed — Portfolio <onboarding@resend.dev>';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: v.email,
        subject: `${v.name} sent you a message via your portfolio`,
        text: [
          `Hi Zuhaib,`,
          ``,
          `${v.name} got in touch through your portfolio:`,
          ``,
          v.message,
          ``,
          `— ${v.name}`,
          v.email ? `Reply directly to this email to answer.` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { status: 502, ok: false, reason: 'upstream' };
    return { status: 200, ok: true };
  } catch {
    return { status: 502, ok: false, reason: 'network' };
  }
}
