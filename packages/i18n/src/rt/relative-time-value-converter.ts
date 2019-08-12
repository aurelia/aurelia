import { valueConverter } from '@aurelia/runtime';
import { I18N, I18N_SIGNAL, I18nService } from '../i18n';

export const relativeTimeValueConverterName = 'rt';
export const RT_SIGNAL: string = 'aurelia-relativetime-signal';

@valueConverter(relativeTimeValueConverterName)
export class RelativeTimeValueConverter {
  public readonly signals: string[] = [I18N_SIGNAL, RT_SIGNAL];

  constructor(@I18N private readonly i18n: I18nService) { }

  public toView(value: unknown, options?: Intl.RelativeTimeFormatOptions, locale?: string) {

    if (!(value instanceof Date)) {
      return value;
    }

    return this.i18n.rt(value, options, locale);
  }
}
