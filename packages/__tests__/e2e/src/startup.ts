import { DebugConfiguration } from '@aurelia/debug';
import { I18nConfiguration } from '@aurelia/i18n';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { IRegistration } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import * as intervalPlural from 'i18next-intervalplural-postprocessor';
import { App } from './app';
import * as de from './locales/de/translations.json';
import * as en from './locales/en/translations.json';
import { SutI18N } from './plugins/sut-i18n';

window['au'] = new Aurelia()
  .register(
    BasicConfiguration,
    DebugConfiguration,
    I18nConfiguration.customize((options) => {
      options.translationAttributeAliases = ['t', 'i18n'];
      options.initOptions = {
        plugins: [intervalPlural.default],
        resources: {
          en: { translation: en['default'] },
          de: { translation: de['default'] },
        }
      };
    })
  )
  .register(SutI18N as unknown as IRegistration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
