import { DI } from '@aurelia/kernel';
import { ContinuationTask, IDOM, ILifecycleTask, PromiseTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';

export const I18N = DI.createInterface<I18nService>('I18nService').withDefault(x => x.singleton(I18nService));
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
    @I18nConfigurationOptions options: I18nConfigurationOptions,
    @IDOM private readonly dom: IDOM<Node>) {
    this.i18next = i18nextWrapper.i18next;
    this.task = new PromiseTask(this.initializeI18next(options), null, this);
  }

  public tr(key: string | string[], options?: i18nextCore.TOptions<object>) {
    return this.i18next.t(key, options);
  }

  public updateValue(node: Node, value: string, params?: i18nextCore.TOptions<object>) {
    if (this.task.done) {
      this.updateValueCore(node, value, params);
    } else {
      this.task = new ContinuationTask(this.task, this.updateValueCore, this, node, value, params);
    }
    return this.task;
  }

  private updateValueCore(node: Node, value: string, params?: i18nextCore.TOptions<object>) {
    if (!value) {
      return;
    }

    const keys = value.toString().split(';');
    let i = keys.length;

    while (i--) {
      const { attr, key } = this.extractAttributesFromKey(node, keys[i]);
      this.applyTranslations(node, attr.split(','), key, params);
    }
  }

  private extractAttributesFromKey(node: Node, key: string) {
    const re = /\[([a-z\-, ]*)\]/ig;
    // set default attribute to src if this is an image node
    let attr = node.nodeName === 'IMG' ? 'src' : 'text';

    // check if a attribute was specified in the key
    const matches = re.exec(key);
    if (matches) {
      key = key.replace(matches[0], '');
      attr = matches[1];
    }

    return { attr, key };
  }

  private applyTranslations(node: Node, attrs: string[], key: string, params?: i18nextCore.TOptions<object>) {
    let j = attrs.length;
    while (j--) {
      // handle various attributes
      // anything other than text,prepend,append or html will be added as an attribute on the element.
      switch (attrs[j].trim()) {
        case 'text':
          node.textContent = this.tr(key, params);
          break;
        default:
          break;
      }
    }
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
