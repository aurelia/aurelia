import { type ValueConverterStaticAuDefinition } from '@aurelia/runtime-html';
import { I18N } from '../i18n';
import { Signals, ValueConverters, valueConverterTypeName } from '../utils';

export class NumberFormatValueConverter {
  public static readonly $au: ValueConverterStaticAuDefinition = {
    type: valueConverterTypeName,
    name: ValueConverters.numberFormatValueConverterName,
  };

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
