import * as de from '../locales/de/translation.json';
import * as en from '../locales/en/translation.json';

export const resources = {
  en: { translation: en['default'] },
  de: { translation: de['default'] },
};

export type Locale = keyof typeof resources;
