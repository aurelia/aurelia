import { RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { AppRootCustomElement as component } from './app-root';

(async function () {
  const host = document.querySelector<HTMLElement>('app');

  const au = new Aurelia()
    .register(
      StandardConfiguration,
      ValidationHtmlConfiguration,
      RouterConfiguration.customize({ useUrlFragmentHash: false }),
    );
  au.app({ host, component });

  await au.start();
})().catch(console.error);
