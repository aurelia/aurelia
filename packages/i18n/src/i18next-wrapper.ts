import i18next from 'i18next';

/**
 * A wrapper class over i18next to facilitate the easy testing and DI.
 * @export
 */
export class I18nextWrapper {
  public i18next: i18next.i18n = i18next;
}
