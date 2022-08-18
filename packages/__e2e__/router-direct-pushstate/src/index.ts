import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { App } from './app';

Aurelia
  .register(
    RouterConfiguration.customize({
      useUrlFragmentHash: false
    }),
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
