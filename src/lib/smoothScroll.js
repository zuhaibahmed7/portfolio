import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Matches html { scroll-padding-top: 92px } so Lenis stops at the same spot
// as native anchor jumps.
const NAVBAR_OFFSET = -92;

let lenis = null;

export function initSmoothScroll() {
  if (lenis) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });

  // Keep GSAP ScrollTrigger in sync with Lenis-driven scrolling
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (e) => {
    if (!lenis || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.classList.contains('skip-link')) return;
    const href = anchor.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      lenis.scrollTo(0);
      return;
    }
    if (!document.querySelector(href)) return;
    e.preventDefault();
    lenis.scrollTo(href, { offset: NAVBAR_OFFSET, duration: 1.2 });
  });
}

export function smoothScrollTo(target) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: typeof target === 'number' ? 0 : NAVBAR_OFFSET,
      duration: 1.2,
    });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector(target);
  if (el) {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 92,
      behavior: 'smooth',
    });
  }
}
