import { DebugConfiguration } from '@aurelia/debug';
import { I18nConfiguration } from "@aurelia/i18n";
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { IRegistry } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

const au = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration,
    I18nConfiguration
      .customize(() => ({
        resources: {
          en: { translation: { whatever: "works" } }
        }
      })) as IRegistry
  );
console.log("registered");
try {
  au.app({ host: document.querySelector('app'), component: new App() });
  console.log("starting");
} catch (e) {
  console.log(e);
  throw e;
}
au.start();

  // window['au'] = au;
