import { type ValueConverterStaticAuDefinition, type ValueConverterInstance } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { I18N } from '../i18n';
import { Signals, ValueConverters, valueConverterTypeName } from '../utils';

export class RelativeTimeValueConverter implements ValueConverterInstance {
  public static readonly $au: ValueConverterStaticAuDefinition = {
    type: valueConverterTypeName,
    name: ValueConverters.relativeTimeValueConverterName,
  };

  public readonly signals: string[] = [Signals.I18N_SIGNAL, Signals.RT_SIGNAL];

  private readonly i18n: I18N = resolve(I18N);

  public toView(value: unknown, options?: Intl.RelativeTimeFormatOptions, locale?: string) {

    if (!(value instanceof Date)) {
      return value;
    }

    return this.i18n.rt(value, options, locale);
  }
}
