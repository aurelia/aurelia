import { resolve } from '@aurelia/kernel';
import { ValueConverter } from '@aurelia/runtime-html';
import type * as i18next from 'i18next';
import { I18N } from '../i18n';
import { Signals, ValueConverters } from '../utils';

export class TranslationValueConverter {
  public readonly signals: string[] = [Signals.I18N_SIGNAL];

  private readonly i18n: I18N = resolve(I18N);

  public toView(value: string, options?: i18next.TOptions) {
    return this.i18n.tr(value, options);
  }
}
ValueConverter.define(ValueConverters.translationValueConverterName, TranslationValueConverter);
