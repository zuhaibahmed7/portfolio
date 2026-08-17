import { useEffect, useState } from 'react';

/**
 * Typewriter effect: types each word, pauses, deletes it, moves to the next.
 * Falls back to a static first word when the user prefers reduced motion.
 */
export function useTypewriter(words, { typeMs = 75, deleteMs = 35, pauseMs = 1700 } = {}) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return undefined; // no animation — render static word

    const word = words[index % words.length];
    let timer;

    if (!deleting && sub === word) {
      // Full word typed → hold, then start deleting
      timer = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && sub === '') {
      // Word fully deleted → advance to the next word
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      // Type one char forward or delete one char back
      timer = setTimeout(
        () => setSub(deleting ? word.slice(0, sub.length - 1) : word.slice(0, sub.length + 1)),
        deleting ? deleteMs : typeMs
      );
    }
    return () => clearTimeout(timer);
  }, [sub, deleting, index, words, typeMs, deleteMs, pauseMs, reduced]);

  return reduced ? words[0] : sub;
}
