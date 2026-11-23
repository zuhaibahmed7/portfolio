import { useEffect, useRef } from 'react';

/* ---------------------------------------------------------------------------
   CinematicBackground — full-page "Neural Drift" backdrop.

   A fixed, full-viewport <canvas> rendered behind every section: glowing
   nodes drift slowly and connect to nearby nodes with synapse-like lines
   whose opacity pulses. A faint mouse parallax shifts the whole field, and
   a gradient mask fades the canvas out toward the bottom so section content
   always stays readable.

   Performance optimizations:
   - Pre-rendered offscreen glow sprites replace per-node ctx.shadowBlur
     (eliminates ~90 GPU/CPU Gaussian blur passes every frame)
   - DPR capped at 1.5 and delta-time clamped for consistent smoothness
   - Animation pauses automatically when the tab is hidden
--------------------------------------------------------------------------- */
const HUES = ['124, 58, 237', '34, 211, 238', '236, 72, 153'];

function createGlowSprites() {
  const size = 24;
  const half = size / 2;
  return HUES.map((hue) => {
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    const g = octx.createRadialGradient(half, half, 0, half, half, half);
    g.addColorStop(0, `rgba(${hue}, 1)`);
    g.addColorStop(0.28, `rgba(${hue}, 0.75)`);
    g.addColorStop(0.6, `rgba(${hue}, 0.22)`);
    g.addColorStop(1, `rgba(${hue}, 0)`);
    octx.fillStyle = g;
    octx.fillRect(0, 0, size, size);
    return off;
  });
}

export default function CinematicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion — the CSS fallback layer covers this case
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const sprites = createGlowSprites();

    const isMobile = window.innerWidth < 768;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let lastNow = performance.now();
    let lightMode = document.documentElement.classList.contains('light');

    // Mouse parallax target (normalized -1..1) and eased current value
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    let nodes = [];

    const buildNodes = () => {
      const density = isMobile ? 28000 : 17000; // px² per node
      const count = Math.min(75, Math.floor((width * height) / density));
      nodes = Array.from({ length: count }, () => {
        const hueIdx = Math.floor(Math.random() * HUES.length);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          // Slow independent drift velocity (px/s)
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          r: 1 + Math.random() * 1.8,
          // Each node pulses on its own phase for organic shimmer
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.4 + Math.random() * 0.8,
          hueIdx,
          hue: HUES[hueIdx],
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth || 1;
      height = window.innerHeight || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    };

    const LINK_DIST = 130; // max px distance at which two nodes connect
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

    const draw = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      // Ease the parallax toward the pointer
      eased.x += (pointer.x - eased.x) * 0.03;
      eased.y += (pointer.y - eased.y) * 0.03;

      ctx.clearRect(0, 0, width, height);

      const t = now / 1000;
      const px = eased.x * 18; // parallax offset in px
      const py = eased.y * 18;

      // --- Update positions ---
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // --- Synapse links ---
      if (!lightMode) {
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          const ax = a.x + px;
          const ay = a.y + py;
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > LINK_DIST_SQ) continue;
            const d = Math.sqrt(d2);
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + (a.phase + b.phase));
            const alpha = (1 - d / LINK_DIST) * 0.14 * (0.6 + 0.4 * pulse);
            ctx.strokeStyle = `rgba(${a.hue}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(b.x + px, b.y + py);
            ctx.stroke();
          }
        }
      }

      // --- Nodes (pre-rendered sprite stamps in dark mode; crisp arcs in light mode) ---
      if (lightMode) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * n.pulseSpeed + n.phase));
          ctx.beginPath();
          ctx.arc(n.x + px, n.y + py, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(24, 24, 27, ${(0.1 * glow).toFixed(3)})`;
          ctx.fill();
        }
      } else {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * n.pulseSpeed + n.phase));
          const spriteSize = n.r * 5.5;
          const half = spriteSize * 0.5;
          ctx.globalAlpha = 0.65 * glow;
          ctx.drawImage(sprites[n.hueIdx], n.x + px - half, n.y + py - half, spriteSize, spriteSize);
        }
        ctx.globalAlpha = 1;
      }
    };

    const onPointer = (e) => {
      pointer.x = (e.clientX / width) * 2 - 1;
      pointer.y = (e.clientY / height) * 2 - 1;
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        lastNow = performance.now();
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    // Track theme flips (Navbar toggles the `light` class on <html>)
    const themeObserver = new MutationObserver(() => {
      lightMode = document.documentElement.classList.contains('light');
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    resize();
    window.addEventListener('resize', resize, { passive: true });
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
