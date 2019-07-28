import { DI } from '@aurelia/kernel';
import { ILifecycleTask, PromiseTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';

export interface I18nKeyEvaluationResult {
  value: string;
  attributes: string[];
}

export const I18N = DI.createInterface<I18nService>('I18nService').noDefault();
/**
 * Translation service class.
 * @export
 */
export class I18nService {

  public i18next: i18nextCore.i18n;
  private options!: I18nConfigurationOptions;
  private task: ILifecycleTask;

  constructor(
    @I18nWrapper i18nextWrapper: I18nextWrapper,
    @I18nConfigurationOptions options: I18nConfigurationOptions) {
    this.i18next = i18nextWrapper.i18next;
    this.task = new PromiseTask(this.initializeI18next(options), null, this);
  }

  public evaluate(keyExpr: string): I18nKeyEvaluationResult[] {
    const parts = keyExpr.split(';');
    const result: I18nKeyEvaluationResult[] = [];
    for (const part of parts) {
      const { attributes, key } = this.extractAttributesFromKey(part);
      result.push({ attributes, value: this.tr(key) });
    }
    return result;
  }

  public tr(key: string | string[], options?: i18nextCore.TOptions<object>) {
    return this.i18next.t(key, options);
  }

  private extractAttributesFromKey(key: string) {
    const re = /\[([a-z\-, ]*)\]/ig;
    let attributes: string[] = [];

    // check if a attribute was specified in the key
    const matches = re.exec(key);
    if (matches) {
      key = key.replace(matches[0], '');
      attributes = matches[1].split(',');
    }

    return { attributes, key };
  }

  private async initializeI18next(options: I18nConfigurationOptions) {
    const defaultOptions: I18nConfigurationOptions = {
      lng: 'en',
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      attributes: ['t', 'i18n'],
      skipTranslationOnMissingKey: false,
    };
    this.options = { ...defaultOptions, ...options };
    for (const plugin of this.options.plugins!) {
      this.i18next.use(plugin);
    }
    await this.i18next.init(this.options);
  }
}
