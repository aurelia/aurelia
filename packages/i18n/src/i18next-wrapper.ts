import { DI } from '@aurelia/kernel';
import i18next from 'i18next';

export const I18nWrapper = /*@__PURE__*/DI.createInterface<I18nextWrapper>('I18nextWrapper');

/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 */
export class I18nextWrapper {
  public i18next: i18next.i18n = i18next;
}
