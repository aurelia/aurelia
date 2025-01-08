import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite'
import { MyApp } from './my-app';
import { P1 } from './p-1';
import { P2 } from './p-2';

Aurelia
  .register(RouterConfiguration, P1, P2)
  .app(MyApp)
  .start();
