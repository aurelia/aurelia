import { DI } from '@aurelia/kernel';
import i18next, { i18n } from 'i18next';

export interface II18nextWrapper extends I18nextWrapper {}
export const II18nextWrapper = /*@__PURE__*/DI.createInterface<II18nextWrapper>('II18nextWrapper');

/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 */
export class I18nextWrapper {
  public i18next: i18n = i18next;
}
