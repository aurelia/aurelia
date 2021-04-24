import { I18nConfiguration, I18nInitOptions } from '@aurelia/i18n';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import Fetch from 'i18next-fetch-backend';
import * as intervalPlural from 'i18next-intervalplural-postprocessor';
import { App as component } from './app';
import { CustomMessage } from './plugins/custom-message';
import { SutI18N } from './plugins/sut-i18n';
import { resources } from './plugins/translation-resources';

// Intl.RelativeTimeFormat polyfill is needed as Cypress uses electron and does not seems to work with puppeteer
import RelativeTimeFormat from 'relative-time-format';
import * as deRt from 'relative-time-format/locale/de.json';
import * as enRt from 'relative-time-format/locale/en.json';
RelativeTimeFormat.addLocale(enRt['default']);
RelativeTimeFormat.addLocale(deRt['default']);
// @ts-ignore
Intl['RelativeTimeFormat'] = Intl['RelativeTimeFormat'] || RelativeTimeFormat;

(async function () {
  const host = document.querySelector<HTMLElement>('app');
  // const searchParams = new URL(location.href).searchParams;
  // const fetchResource = !!searchParams.get('fetchResource');

  const au = new Aurelia()
    .register(
      StandardConfiguration,
      // I18nConfiguration.customize((options) => {
      //   options.translationAttributeAliases = ['t', 'i18n'];
      //   const plugins = [intervalPlural.default];
      //   if (fetchResource) {
      //     plugins.push(Fetch);
      //   }
      //   // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      //   options.initOptions = {
      //     plugins,
      //     resources: !fetchResource ? resources : undefined,
      //     backend: fetchResource
      //       ? { loadPath: '/locales/{{lng}}/{{ns}}.json', }
      //       : undefined,
      //     skipTranslationOnMissingKey: !!searchParams.get('skipkey')
      //   } as I18nInitOptions;
      // }),
      // SutI18N,
      // CustomMessage,
    );
  au.app({ host, component });

  await au.start();
})().catch(console.error);
