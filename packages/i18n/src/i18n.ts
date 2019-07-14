import { LogLevel, Reporter } from '@aurelia/kernel';
import { Aurelia, ContinuationTask, IController, IDOM, ILifecycleTask, LifecycleTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nConfigurationOptions } from './i18n-configuration-options';

// import {
//   DOM,
//   PLATFORM
// } from "aurelia-pal";
// import * as LogManager from "aurelia-logging";
// import { EventAggregator } from "aurelia-event-aggregator";
// import { BindingSignaler } from "aurelia-templating-resources";

// export interface AureliaEnhancedOptions extends i18next.InitOptions {
//   attributes?: string[];
//   skipTranslationOnMissingKey?: boolean;
// }

// export interface AureliaEnhancedI18Next extends i18next.i18n {
//   options: AureliaEnhancedOptions;
// }

// tslint:disable-next-line:interface-name
export interface I18NEventPayload {
  oldValue: string;
  newValue: string;
}

export const I18N_EA_SIGNAL = 'i18n:locale:changed';

export class I18N {

  // public static inject() { return [EventAggregator, BindingSignaler]; }

  private options!: I18nConfigurationOptions;
  private task: ILifecycleTask;
  // public Intl: typeof Intl;
  // private globalVars: { [key: string]: any } = {};

  constructor(public i18next: i18nextCore.i18n, options: I18nConfigurationOptions, private dom: IDOM) {
    // this.Intl = PLATFORM.global.Intl;

    this.task = LifecycleTask.done;
    this.initializeI18next(options);
  }
  // public i18nextReady() {
  //   return this.i18nextDeferred;
  // }

  // public setLocale(locale: string): Promise<i18next.TFunction> {
  //   return new Promise((resolve, reject) => {
  //     const oldLocale = this.getLocale();
  //     this.i18next.changeLanguage(locale, (err, tr) => {
  //       if (err) {
  //         reject(err);
  //       }

  //       this.ea.publish(I18N_EA_SIGNAL, { oldValue: oldLocale, newValue: locale });
  //       this.signaler.signal("aurelia-translation-signal");
  //       resolve(tr);
  //     });
  //   });
  // }

  // public getLocale() {
  //   return this.i18next.language;
  // }

  // public nf(options?: Intl.NumberFormatOptions, locales?: string | string[]) {
  //   return new this.Intl.NumberFormat(locales || this.getLocale(), options || {});
  // }

  // public uf(numberLike: string, locale?: string) {
  //   const nf = this.nf({}, locale || this.getLocale());
  //   const comparer = nf.format(10000 / 3);

  //   let thousandSeparator = comparer[1];
  //   const decimalSeparator = comparer[5];

  //   if (thousandSeparator === ".") {
  //     thousandSeparator = "\\.";
  //   }

  //   // remove all thousand seperators
  //   const result = numberLike.replace(new RegExp(thousandSeparator, "g"), "")
  //     // remove non-numeric signs except -> , .
  //     .replace(/[^\d.,-]/g, "")
  //     // replace original decimalSeparator with english one
  //     .replace(decimalSeparator, ".");

  //   // return real number
  //   return Number(result);
  // }

  // public df(options?: Intl.DateTimeFormatOptions, locales?: string | string[]) {
  //   return new this.Intl.DateTimeFormat(locales || this.getLocale(), options);
  // }

  public tr(key: string | string[], options?: i18nextCore.TOptions<object>) {
    // let fullOptions = this.globalVars;

    // if (options !== undefined) {
    //   fullOptions = Object.assign(Object.assign({}, this.globalVars), options);
    // }

    return this.i18next.t(key, options);
  }

  // public registerGlobalVariable(key: string, value: any) {
  //   this.globalVars[key] = value;
  // }

  // public unregisterGlobalVariable(key: string) {
  //   delete this.globalVars[key];
  // }

  /**
   * Scans an element for children that have a translation attribute and
   * updates their innerHTML with the current translation values.
   *
   * If an image is encountered the translated value will be applied to the src attribute.
   *
   * @param el    HTMLElement to search within
   */
  // public updateTranslations(el: HTMLElement) {
  //   if (!el || !el.querySelectorAll) {
  //     return;
  //   }

  //   let i;
  //   let l;

  //   // create a selector from the specified attributes to look for
  //   // var selector = [].concat(this.i18next.options.attributes);
  //   const attributes = this.i18next.options.attributes!;
  //   let selector = [].concat(attributes as any) as any;
  //   for (i = 0, l = selector.length; i < l; i++) { selector[i] = "[" + selector[i] + "]"; }
  //   selector = selector.join(",");

  //   // get the nodes
  //   const nodes = el.querySelectorAll(selector);
  //   for (i = 0, l = nodes.length; i < l; i++) {
  //     const node = nodes[i];
  //     let keys;
  //     let params;
  //     // test every attribute and get the first one that has a value
  //     for (let i2 = 0, l2 = attributes.length; i2 < l2; i2++) {
  //       keys = node.getAttribute(attributes[i2]);
  //       const pname = attributes[i2] + "-params";

  //       if (pname && node.au && node.au[pname]) {
  //         params = node.au[pname].viewModel.value;
  //       }

  //       if (keys) { break; }
  //     }
  //     // skip if nothing was found
  //     if (!keys) { continue; }

  //     // split the keys into multiple keys separated by a ;
  //     this.updateValue(node, keys, params);
  //   }
  // }

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

      const attrs = attr.split(',');
      let j = attrs.length;

      while (j--) {
        attr = attrs[j].trim();

        if (!(node as any)._textContent) { (node as any)._textContent = node.textContent; }
        if (!(node as any)._innerHTML) { (node as any)._innerHTML = node.innerHTML; }

        // convert to camelCase
        // tslint:disable-next-line:only-arrow-functions
        const attrCC = attr.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        // const reservedNames = ['prepend', 'append', 'text', 'html'];
        // const i18nLogger = LogManager.getLogger('i18n');

        //       if (reservedNames.indexOf(attr) > -1 &&
        //         node.au &&
        //         node.au.controller &&
        //         node.au.controller.viewModel &&
        //         attrCC in node.au.controller.viewModel) {
        //         Reporter.write(LogLevel.warn, `Aurelia I18N reserved attribute name\n
        // [${reservedNames.join(', ')}]\n
        // Your custom element has a bindable named ${attr} which is a reserved word.\n
        // If you'd like Aurelia I18N to translate your bindable instead, please consider giving it another name.`);
        //       }

        if (this.options.skipTranslationOnMissingKey &&
          this.tr(key, params) === key) {
          Reporter.write(LogLevel.warn, `Couldn't find translation for key: ${key}`);
          return;
        }

        // handle various attributes
        // anything other than text,prepend,append or html will be added as an attribute on the element.
        switch (attr) {
          case 'text':
            const newChild = this.dom.createTextNode(this.tr(key, params));
            if ((node as any)._newChild && (node as any)._newChild.parentNode === node) {
              node.removeChild((node as any)._newChild);
            }

            (node as any)._newChild = newChild;
            while (node.firstChild) {
              node.removeChild(node.firstChild);
            }
            node.appendChild((node as any)._newChild);
            break;
          // case 'prepend':
          //   const prependParser = DOM.createElement('div');
          //   prependParser.innerHTML = this.tr(key, params);
          //   for (let ni = node.childNodes.length - 1; ni >= 0; ni--) {
          //     if ((node.childNodes[ni] as any)._prepended) {
          //       node.removeChild(node.childNodes[ni]);
          //     }
          //   }

          //   for (let pi = prependParser.childNodes.length - 1; pi >= 0; pi--) {
          //     (prependParser.childNodes[pi] as any)._prepended = true;
          //     if (node.firstChild) {
          //       node.insertBefore(prependParser.childNodes[pi], node.firstChild);
          //     } else {
          //       node.appendChild(prependParser.childNodes[pi]);
          //     }
          //   }
          //   break;
          // case 'append':
          //   const appendParser = DOM.createElement('div');
          //   appendParser.innerHTML = this.tr(key, params);
          //   for (let ni = node.childNodes.length - 1; ni >= 0; ni--) {
          //     if ((node.childNodes[ni] as any)._appended) {
          //       node.removeChild(node.childNodes[ni]);
          //     }
          //   }

          //   while (appendParser.firstChild) {
          //     (appendParser.firstChild as any)._appended = true;
          //     node.appendChild(appendParser.firstChild);
          //   }
          //   break;
          // case 'html':
          //   node.innerHTML = this.tr(key, params);
          //   break;
          default: // normal html attribute
            if (node.$au &&
              node.$controller &&
              node.$controller.viewModel &&
              attrCC in node.$controller.viewModel) {
              (node.$controller.viewModel as any)[attrCC] = this.tr(key, params);
            } else {
              node.setAttribute(attr, this.tr(key, params));
            }

            break;
        }
      }
    }
  }

  private initializeI18next(options: I18nConfigurationOptions) {
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
    this.task = new ContinuationTask(this.task, () => this.i18next.init(this.options), this);
  }
}
