import { valueConverter } from '@aurelia/runtime';
import i18next from 'i18next';
import { I18N } from '../i18n';
import { Signals, ValueConverters } from '../utils';

@valueConverter(ValueConverters.translationValueConverterName)
export class TranslationValueConverter {
  public readonly signals: string[] = [Signals.I18N_SIGNAL];

  public constructor(
    @I18N private readonly i18n: I18N,
  ) {}

  public toView(value: string, options?: i18next.TOptions) {
    return this.i18n.tr(value, options);
  }
}
