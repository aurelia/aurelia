import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-direct';
import { App } from './app';
import { Fallback } from './pages/fallback';

Aurelia
  .register(
    RouterConfiguration.customize({
      useUrlFragmentHash: false,
      fallback: () => Fallback,
    }),
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
