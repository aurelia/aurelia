import { valueConverter } from '@aurelia/runtime';
import { I18N } from '../i18n.js';
import { Signals, ValueConverters } from '../utils.js';

@valueConverter(ValueConverters.numberFormatValueConverterName)
export class NumberFormatValueConverter {
  public readonly signals: string[] = [Signals.I18N_SIGNAL];

  public constructor(
    @I18N private readonly i18n: I18N,
  ) {}

  public toView(value: unknown, options?: Intl.NumberFormatOptions, locale?: string) {
    if (typeof value !== 'number') {
      return value;
    }

    return this.i18n.nf(value, options, locale);
  }
}
