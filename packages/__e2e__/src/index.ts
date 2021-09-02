import Aurelia, { RouterConfiguration } from 'aurelia';
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
