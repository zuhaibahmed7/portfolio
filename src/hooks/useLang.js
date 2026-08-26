import { useEffect, useState } from 'react';

/* -------------------------------------------------------------------
   Language hook — persists EN/UR preference in localStorage.
   Toggles a `lang` attribute on <html> for CSS-based localization
   of text direction and font selection.
------------------------------------------------------------------- */
const STORAGE_KEY = 'za-lang';

export function useLang() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ur') return saved;
    } catch {
      /* ignore */
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  return {
    lang,
    isUr: lang === 'ur',
    toggle: () => setLang((l) => (l === 'en' ? 'ur' : 'en')),
  };
}
