import { DebugConfiguration } from '@aurelia/debug';
import { I18nConfiguration } from '@aurelia/i18n';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { IRegistration } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import * as intervalPlural from 'i18next-intervalplural-postprocessor';
import { App as component } from './app';
import * as de from './locales/de/translations.json';
import * as en from './locales/en/translations.json';
import { CustomMessage } from './plugins/custom-message';
import { SutI18N } from './plugins/sut-i18n';

// Intl.RelativeTimeFormat polyfill is needed as Cypress uses electron and does not seems to work with puppeteer
import RelativeTimeFormat from 'relative-time-format';
import * as deRt from 'relative-time-format/locale/de.json';
import * as enRt from 'relative-time-format/locale/en.json';
RelativeTimeFormat.addLocale(enRt['default']);
RelativeTimeFormat.addLocale(deRt['default']);
Intl['RelativeTimeFormat'] = Intl['RelativeTimeFormat'] || RelativeTimeFormat;

(async function () {
  const host = document.querySelector('app');

  const au = new Aurelia()
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
          },
          skipTranslationOnMissingKey: !!new URL(location.href).searchParams.get('skipkey')
        };
      })
    );
  au.container.register(SutI18N, CustomMessage);
  au.app({ host, component });

  await au.start().wait();
})().catch(console.error);
