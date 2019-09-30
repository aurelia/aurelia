import { PixiConfiguration } from '@aurelia/plugin-pixi';
import Aurelia from 'aurelia';
import { App } from './app';

Aurelia
  .register(PixiConfiguration)
  .app(App)
  .start();

