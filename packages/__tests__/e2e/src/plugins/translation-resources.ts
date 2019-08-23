import * as de from '../locales/de/translations.json';
import * as en from '../locales/en/translations.json';

export const resources = {
  en: { translation: en['default'] },
  de: { translation: de['default'] },
};

export type Locale = keyof typeof resources;
