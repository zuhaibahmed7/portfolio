import { useEffect, useState } from 'react';

/* ---------------------------------------------------------------------------
   Light/Dark theme — persisted in localStorage, defaults to the visitor's
   OS-level prefers-color-scheme on first visit. Applied by toggling a
   `light` class on <html>; the overrides live in index.css.
--------------------------------------------------------------------------- */
const STORAGE_KEY = 'za-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return { theme, isLight: theme === 'light', toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) };
}
