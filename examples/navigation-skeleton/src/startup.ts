import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { RouterConfiguration } from 'aurelia-direct-router';
import { ChildRouter } from './child-router';

import { App } from './app';

import { State } from './state';
import { Users } from './users';
import { UpperValueConverter, Welcome } from './welcome';

(async function () {
  const au = new Aurelia()
    .register(
      State,
      Welcome,
      Users,
      ChildRouter,
      UpperValueConverter,
      StandardConfiguration,
      RouterConfiguration,
    )
    .app({
      host: document.querySelector('app'),
      component: App,
    });

  await au.start();
})().catch(console.error);
