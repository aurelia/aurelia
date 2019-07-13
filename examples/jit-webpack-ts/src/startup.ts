import { DebugConfiguration } from '@aurelia/debug';
import { I18nConfiguration } from "@aurelia/i18n";
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { IRegistry } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration,
    I18nConfiguration
    .customize({
      resources: {
        en: { translations: { whatever: "works" } }
      }
    }) as IRegistry
    )
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
