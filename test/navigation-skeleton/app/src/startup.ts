import { DebugConfiguration } from '@aurelia/debug';
import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { RouterConfiguration } from '@aurelia/router';
import { Aurelia } from '@aurelia/runtime';
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
      RuntimeHtmlBrowserConfiguration,
      RouterConfiguration,
      DebugConfiguration,
    )
    .app({
      host: document.querySelector('app'),
      component: App,
    });

  await au.start();
})().catch(console.error);
