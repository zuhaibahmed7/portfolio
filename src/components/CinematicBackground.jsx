import { useEffect, useRef } from 'react';

/* ---------------------------------------------------------------------------
   CinematicBackground — full-page "Neural Drift" backdrop.

   A fixed, full-viewport <canvas> rendered behind every section: glowing
   nodes drift slowly and connect to nearby nodes with synapse-like lines
   whose opacity pulses. A faint mouse parallax shifts the whole field, and
   a gradient mask fades the canvas out toward the bottom so section content
   always stays readable.

   Behavior:
   - Skipped entirely for prefers-reduced-motion users (static CSS aurora
     fallback shows instead).
   - Node count scales down on small screens; animation pauses when the tab
     is hidden and on the `light` theme it renders as soft ink-colored dots.
--------------------------------------------------------------------------- */
export default function CinematicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion — the CSS fallback layer covers this case
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth < 768;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let lightMode = document.documentElement.classList.contains('light');

    // Mouse parallax target (normalized -1..1) and eased current value
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    let nodes = [];

    const buildNodes = () => {
      const density = isMobile ? 26000 : 15000; // px² per node
      const count = Math.min(90, Math.floor((width * height) / density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Slow independent drift velocity (px/s)
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        r: 1 + Math.random() * 1.8,
        // Each node pulses on its own phase for organic shimmer
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.4 + Math.random() * 0.8,
        // Palette: violet / cyan / pink accents, matching the site theme
        hue: ['124, 58, 237', '34, 211, 238', '236, 72, 153'][Math.floor(Math.random() * 3)],
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    };

    const LINK_DIST = 130; // max px distance at which two nodes connect

    const draw = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      // Ease the parallax toward the pointer
      eased.x += (pointer.x - eased.x) * 0.03;
      eased.y += (pointer.y - eased.y) * 0.03;

      ctx.clearRect(0, 0, width, height);

      const t = now / 1000;
      const px = eased.x * 18; // parallax offset in px
      const py = eased.y * 18;

      // --- Update + draw nodes ---
      for (const n of nodes) {
        n.x += n.vx * (1 / 60);
        n.y += n.vy * (1 / 60);
        // Wrap around edges for seamless infinite drift
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // --- Synapse links ---
      if (!lightMode) {
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > LINK_DIST * LINK_DIST) continue;
            const d = Math.sqrt(d2);
            // Line fades with distance; a traveling pulse brightens some links
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + (a.phase + b.phase));
            const alpha = (1 - d / LINK_DIST) * 0.14 * (0.6 + 0.4 * pulse);
            ctx.strokeStyle = `rgba(${a.hue}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x + px, a.y + py);
            ctx.lineTo(b.x + px, b.y + py);
            ctx.stroke();
          }
        }
      }

      // --- Nodes (glowing dots) ---
      for (const n of nodes) {
        const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * n.pulseSpeed + n.phase));
        const x = n.x + px;
        const y = n.y + py;

        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        if (lightMode) {
          ctx.fillStyle = `rgba(24, 24, 27, ${0.10 * glow})`;
        } else {
          ctx.fillStyle = `rgba(${n.hue}, ${0.55 * glow})`;
          // Soft halo
          ctx.shadowColor = `rgba(${n.hue}, 0.8)`;
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    // Track theme flips (Navbar toggles the `light` class on <html>)
    const themeObserver = new MutationObserver(() => {
      lightMode = document.documentElement.classList.contains('light');
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="cinematic-bg pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Static aurora fallback: visible in light mode & reduced motion */}
      <div className="cinematic-fallback absolute inset-0" />
    </div>
  );
}
