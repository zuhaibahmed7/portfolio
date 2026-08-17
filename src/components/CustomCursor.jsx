import { useEffect, useRef, useState } from 'react';

/**
 * Custom cursor accent: a small gradient dot glued to the pointer plus a larger
 * lagging ring that "eases" behind it (linear interpolation in a rAF loop).
 * The ring scales up over interactive elements (a / button / [data-hover]).
 * Only enabled for fine pointers (desktop) without reduced-motion preference;
 * the native cursor is intentionally kept visible for usability.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;
    setEnabled(true);

    // Mutable target/current positions shared by the rAF loop
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let hovering = false;
    let raf;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x - 4}px, ${target.y - 4}px, 0)`;
      }
    };

    // Grow the ring when entering links/buttons via event delegation
    const onOver = (e) => {
      hovering = !!e.target.closest('a, button, [data-hover]');
      if (ringRef.current) {
        ringRef.current.style.width = hovering ? '56px' : '36px';
        ringRef.current.style.height = hovering ? '56px' : '36px';
        ringRef.current.style.borderColor = hovering
          ? 'rgba(34,211,238,0.9)'
          : 'rgba(124,58,237,0.55)';
      }
    };

    const loop = () => {
      // Lerp factor 0.16 → the ring trails the dot with a smooth ease
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      if (ringRef.current) {
        const size = ringRef.current.offsetWidth / 2;
        ringRef.current.style.transform = `translate3d(${ring.x - size}px, ${ring.y - size}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 rounded-full border transition-[width,height,border-color] duration-200 print:hidden"
        style={{ borderColor: 'rgba(124,58,237,0.55)' }}
      />
      {/* Center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-2 w-2 rounded-full bg-gradient-accent print:hidden"
      />
    </>
  );
}
