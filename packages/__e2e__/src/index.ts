import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';
import { App } from './app';

Aurelia
  .register(
    RouterConfiguration.customize({
      // useUrlFragmentHash: true
    }),
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
