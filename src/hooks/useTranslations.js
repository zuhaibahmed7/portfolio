import { useLang } from './useLang.js';
import { translations } from '../data/content.js';

/* -------------------------------------------------------------------
   useTranslations — returns the correct translation set for the
   current language. Components destructure what they need:
     const t = useTranslations();
     <p>{t.heroStatus}</p>
------------------------------------------------------------------- */
export function useTranslations() {
  const { lang } = useLang();
  return translations[lang] ?? translations.en;
}
