import { Key } from '@aurelia/kernel';
import { Aurelia, ContinuationTask, IController, IDOM, ILifecycleTask, PromiseTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nConfiguration } from './configuration';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper } from './i18next-wrapper';

export class I18N {
  public static readonly inject: readonly Key[] = [I18nextWrapper, I18nConfiguration, IDOM];

  public i18next: i18nextCore.i18n;
  private options!: I18nConfigurationOptions;
  private task: ILifecycleTask;

  constructor(i18nextWrapper: I18nextWrapper, options: I18nConfigurationOptions, private dom: IDOM<Node>) {
    this.i18next = i18nextWrapper.i18next;
    this.task = new PromiseTask(this.initializeI18next(options), null, this);
  }

  public tr(key: string | string[], options?: i18nextCore.TOptions<object>) {
    return this.i18next.t(key, options);
  }

  public updateValue(node: Element & { $au: Aurelia; $controller: IController }, value: string, params: any) {
    if (this.task.done) {
      this.updateValueCore(node, value, params);
    } else {
      this.task = new ContinuationTask(this.task, this.updateValueCore, this, node, value, params);
    }
  }

  private updateValueCore(node: Element & { $au: Aurelia; $controller: IController }, value: string, params: any) {
    if (value === null || value === undefined) {
      return;
    }

    const keys = value.toString().split(';');
    let i = keys.length;

    while (i--) {
      let key = keys[i];
      // remove the optional attribute
      const re = /\[([a-z\-, ]*)\]/ig;

      let m;
      let attr = 'text';
      // set default attribute to src if this is an image node
      if (node.nodeName === 'IMG') { attr = 'src'; }

      // check if a attribute was specified in the key
      // tslint:disable-next-line:no-conditional-assignment
      while ((m = re.exec(key)) !== null) {
        if (m.index === re.lastIndex) {
          re.lastIndex++;
        }
        if (!!m) {
          key = key.replace(m[0], '');
          attr = m[1];
        }
      }

      this.applyTranslations(attr.split(','), key, params, node);
    }
  }

  private applyTranslations(attrs: string[], key: string, params: any, node: Element) {
    let j = attrs.length;
    while (j--) {
      // handle various attributes
      // anything other than text,prepend,append or html will be added as an attribute on the element.
      switch (attrs[j].trim()) {
        case 'text':
          const newChild = this.dom.createTextNode(this.tr(key, params));
          while (node.firstChild) {
            node.removeChild(node.firstChild);
          }
          node.appendChild(newChild);
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
