import Aurelia from 'aurelia';
import { App } from './app';
import { DialogDefaultConfiguration } from '@aurelia/dialog';

Aurelia
  .register(DialogDefaultConfiguration)
  .app({ component: App, host: document.querySelector('#app') })
  .start();
