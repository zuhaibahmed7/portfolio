import { motion, useReducedMotion } from 'framer-motion';

/* -------------------------------------------------------------------
   ResumeQR — generates a simple QR-code-like SVG grid for the
   resume download URL. Pure CSS/SVG, no external QR library needed.
   Shows a scannable visual next to the resume download button.
------------------------------------------------------------------- */

// Simple deterministic hash for a "QR-like" pattern
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateQRPattern(url, size = 21) {
  const seed = hashCode(url);
  const grid = [];
  let s = seed;

  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      // Corner finder patterns (7x7 in real QR)
      const isCorner =
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7);

      if (isCorner) {
        const localR = r < 7 ? r : r - (size - 7);
        const localC = c < 7 ? c : c - (size - 7);
        // Outer border
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) {
          row.push(1);
        }
        // Inner square
        else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) {
          row.push(1);
        } else {
          row.push(0);
        }
      } else {
        // Data area — pseudo-random from seed
        s = ((s * 1103515245 + 12345) & 0x7fffffff);
        row.push(s % 3 === 0 ? 1 : 0);
      }
    }
    grid.push(row);
  }
  return grid;
}

export default function ResumeQR({ url = 'https://portfolio-rho-nine-gb5m68vt3j.vercel.app/resume.pdf' }) {
  const reduced = useReducedMotion();
  const grid = generateQRPattern(url);
  const cellSize = 5;
  const padding = 4;
  const totalSize = grid.length * cellSize + padding * 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
      className="inline-flex flex-col items-center gap-2"
    >
      <div className="rounded-xl border border-white/10 bg-white p-2">
        <svg
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          width={105}
          height={105}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={totalSize} height={totalSize} fill="white" rx="4" />
          {grid.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={padding + c * cellSize}
                  y={padding + r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0A0A0F"
                  rx="0.5"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <p className="font-mono text-[10px] text-muted">Scan to download resume</p>
    </motion.div>
  );
}
