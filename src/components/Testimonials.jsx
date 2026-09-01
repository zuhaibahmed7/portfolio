import { useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '../data/content.js';
import { SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   Testimonials with 3D Hyperbolic Sliding.
   Cards slide in from different angles with 3D rotations,
   creating a hyperbolic paraboloid (saddle) effect.
--------------------------------------------------------------------------- */

// Hyperbolic slide-in variants for each card position
const hyperbolicVariants = [
  {
    // Left card: slides from left-bottom, rotates inward
    hidden: { opacity: 0, x: -120, y: 60, rotateY: -35, rotateX: 15, scale: 0.85 },
    visible: { opacity: 1, x: 0, y: 0, rotateY: 0, rotateX: 0, scale: 1 },
  },
  {
    // Center card: slides from top, slight saddle curve
    hidden: { opacity: 0, x: 0, y: -80, rotateY: 0, rotateX: -20, scale: 0.9 },
    visible: { opacity: 1, x: 0, y: 0, rotateY: 0, rotateX: 0, scale: 1 },
  },
  {
    // Right card: slides from right-bottom, rotates inward
    hidden: { opacity: 0, x: 120, y: 60, rotateY: 35, rotateX: 15, scale: 0.85 },
    visible: { opacity: 1, x: 0, y: 0, rotateY: 0, rotateX: 0, scale: 1 },
  },
];

// Single card hyperbolic slide for mobile/stacked view
const singleCardVariants = [
  { hidden: { opacity: 0, x: -200, rotateY: -45, scale: 0.8 }, visible: { opacity: 1, x: 0, rotateY: 0, scale: 1 } },
  { hidden: { opacity: 0, y: -120, rotateX: -30, scale: 0.85 }, visible: { opacity: 1, y: 0, rotateX: 0, scale: 1 } },
  { hidden: { opacity: 0, x: 200, rotateY: 45, scale: 0.8 }, visible: { opacity: 1, x: 0, rotateY: 0, scale: 1 } },
];

function TestimonialCard({ testimonial, index, isActive }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);

  // Cursor-tracking glow
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const glowX = useTransform(x, [0, 1], [-20, 20]);
  const glowY = useTransform(y, [0, 1], [-20, 20]);

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const variant = index < 3 ? hyperbolicVariants[index] : singleCardVariants[index % 3];

  return (
    <motion.figure
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={onMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-full flex-col gap-4 rounded-2xl p-6"
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(236,72,153,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
        borderColor: isHovered ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Cursor-following glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: useTransform(
            [x, y],
            ([px, py]) => `radial-gradient(300px circle at ${px * 100}% ${py * 100}%, rgba(236,72,153,0.12), transparent 60%)`
          ),
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />

      {/* Edge glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          border: `1px solid ${isHovered ? 'rgba(236,72,153,0.4)' : 'transparent'}`,
          boxShadow: isHovered ? 'inset 0 0 20px rgba(236,72,153,0.1)' : 'none',
          transition: 'all 0.4s ease',
        }}
      />

      {/* Quote icon with glow */}
      <div className="relative">
        <Quote size={22} className="text-accent-pink/70" />
        <div className="absolute inset-0 blur-lg opacity-50">
          <Quote size={22} className="text-accent-pink/30" />
        </div>
      </div>

      {/* Quote text */}
      <blockquote className="relative flex-1 text-sm leading-relaxed text-muted">
        {testimonial.quote}
      </blockquote>

      {/* Author with glow border */}
      <figcaption className="relative flex items-center gap-3 border-t border-white/[0.06] pt-4">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full font-display text-xs font-bold text-accent-cyan" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(34,211,238,0.25))',
          boxShadow: '0 0 12px rgba(124,58,237,0.2)',
        }}>
          {testimonial.avatar ? (
            <img src={testimonial.avatar} alt={testimonial.name} className="h-full w-full object-cover" />
          ) : (
            testimonial.initials
          )}
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-ink">{testimonial.name}</p>
          <p className="text-xs text-muted">{testimonial.role}</p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  // Auto-advance carousel
  useState(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  });

  const navigate = (dir) => {
    setActiveIndex((prev) => {
      if (dir === 'next') return (prev + 1) % testimonials.length;
      return (prev - 1 + testimonials.length) % testimonials.length;
    });
  };

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-28 print:hidden" aria-label="Testimonials">
      {/* Background auras */}
      <div className="aura right-0 top-1/4 h-[320px] w-[420px] bg-accent-pink/40" aria-hidden="true" />
      <div className="aura -left-20 bottom-1/4 h-[280px] w-[280px] bg-accent-violet/30" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={9}
          eyebrow="Testimonials"
          title="What people say"
          lead="Short endorsements from people Zuhaib has built, studied and shipped with."
        />

        {/* 3D Carousel container */}
        <div
          ref={containerRef}
          className="mt-14 relative"
          style={{ perspective: 1200, minHeight: 400 }}
        >
          {/* Desktop: 3D hyperbolic layout */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-6" style={{ transformStyle: 'preserve-3d' }}>
            {testimonials.slice(0, 3).map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} isActive={i === activeIndex} />
            ))}
          </div>

          {/* Mobile: single card carousel with hyperbolic slide */}
          <div className="md:hidden relative" style={{ minHeight: 350 }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  x: (i - activeIndex) * 300,
                  opacity: Math.abs(i - activeIndex) === 0 ? 1 : 0,
                  rotateY: (i - activeIndex) * -25,
                  scale: Math.abs(i - activeIndex) === 0 ? 1 : 0.8,
                  z: Math.abs(i - activeIndex) === 0 ? 0 : -100,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="absolute inset-x-4"
                style={{
                  transformStyle: 'preserve-3d',
                  pointerEvents: Math.abs(i - activeIndex) === 0 ? 'auto' : 'none',
                }}
              >
                <TestimonialCard testimonial={t} index={i} isActive={i === activeIndex} />
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate('prev')}
              className="rounded-full border border-white/10 bg-[#0a0a0f]/80 p-3 backdrop-blur transition-all duration-300 hover:border-accent-pink/50 hover:shadow-glow-pink"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} className="text-muted" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'w-8 h-2 bg-gradient-to-r from-accent-pink to-accent-violet'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate('next')}
              className="rounded-full border border-white/10 bg-[#0a0a0f]/80 p-3 backdrop-blur transition-all duration-300 hover:border-accent-pink/50 hover:shadow-glow-pink"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} className="text-muted" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
