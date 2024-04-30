import de from '../../public/locales/de/translation.json';
import en from '../../public/locales/en/translation.json';

export const resources = {
  en: { translation: en },
  de: { translation: de },
};

export type Locale = keyof typeof resources;
