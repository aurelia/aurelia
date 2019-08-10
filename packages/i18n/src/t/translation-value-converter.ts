import { valueConverter } from '@aurelia/runtime';
import i18next from 'i18next';
import { I18N, I18N_SIGNAL, I18nService } from '../i18n';

@valueConverter('t')
export class TranslationValueConverter {
  public readonly signals: string[] = [I18N_SIGNAL];

  constructor(@I18N private readonly i18n: I18nService) { }

  public toView(value: string, options?: i18next.TOptions) {
    return this.i18n.tr(value, options);
  }
}
