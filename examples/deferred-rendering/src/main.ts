import Aurelia, { DeferConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(DeferConfiguration)
  .app(MyApp)
  .start();
