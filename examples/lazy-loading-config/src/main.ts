import { RouterConfiguration } from 'aurelia-direct-router';
import Aurelia from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();
