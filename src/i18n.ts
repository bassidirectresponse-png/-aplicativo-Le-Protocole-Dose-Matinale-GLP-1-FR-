import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt },
      es: { translation: es },
      de: { translation: de },
      it: { translation: it },
    },
    fallbackLng: 'fr',
    lng: 'fr',
    supportedLngs: ['fr', 'en', 'pt', 'es', 'de', 'it'],
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 1,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
