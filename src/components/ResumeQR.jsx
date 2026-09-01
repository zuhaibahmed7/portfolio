import { motion, useReducedMotion } from 'framer-motion';

/* -------------------------------------------------------------------
   ResumeQR — displays a real scannable QR code that links to the
   resume PDF download. Uses the free qrserver.com API to generate
   a real QR code image (no heavy library needed).
------------------------------------------------------------------- */

const RESUME_URL = 'https://zuhaibahmed7.github.io/portfolio/resume.pdf';

export default function ResumeQR() {
  const reduced = useReducedMotion();
  // Real QR code API — generates a proper scannable QR code
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(RESUME_URL)}&color=0A0A0F&bgcolor=FFFFFF&margin=10`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
      className="inline-flex flex-col items-center gap-3"
    >
      <a
        href={RESUME_URL}
        download="Zuhaib-Ahmed-Resume.pdf"
        className="group rounded-xl border border-white/10 bg-white p-2 transition-all duration-300 hover:shadow-glow hover:scale-105"
        aria-label="Download resume PDF"
      >
        <img
          src={qrApiUrl}
          alt="QR code to download Zuhaib Ahmed's resume"
          width={180}
          height={180}
          className="block"
          loading="lazy"
        />
      </a>
      <p className="font-mono text-[11px] text-muted">
        Scan to download resume
      </p>
    </motion.div>
  );
}
