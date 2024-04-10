import { type ValueConverterStaticAuDefinition } from '@aurelia/runtime-html';
import { I18N } from '../i18n';
import { Signals, ValueConverters, valueConverterTypeName } from '../utils';

export class RelativeTimeValueConverter {
  public static readonly $au: ValueConverterStaticAuDefinition = {
    type: valueConverterTypeName,
    name: ValueConverters.relativeTimeValueConverterName,
  };

  public readonly signals: string[] = [Signals.I18N_SIGNAL, Signals.RT_SIGNAL];

  public constructor(
    @I18N private readonly i18n: I18N,
  ) {}

  public toView(value: unknown, options?: Intl.RelativeTimeFormatOptions, locale?: string) {

    if (!(value instanceof Date)) {
      return value;
    }

    return this.i18n.rt(value, options, locale);
  }
}
