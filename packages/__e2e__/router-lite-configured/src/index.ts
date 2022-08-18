import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';
import { App } from './app';

Aurelia
  .register(
    RouterConfiguration
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
