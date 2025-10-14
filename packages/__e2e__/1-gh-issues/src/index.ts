import Aurelia from 'aurelia';
import { App } from './app';
import { DialogConfigurationClassic } from '@aurelia/dialog';

Aurelia
  .register(DialogConfigurationClassic)
  .app({ component: App, host: document.querySelector('#app') })
  .start();
