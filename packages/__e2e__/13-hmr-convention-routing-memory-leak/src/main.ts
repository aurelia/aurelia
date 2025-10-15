import { RouterConfiguration } from '@aurelia/router';
import Aurelia from 'aurelia';
import { P1 } from './p-1';
import { P2 } from './p-2';
import { RouterApp } from './router-app';

Aurelia
  .register(RouterConfiguration, P1, P2)
  .app(RouterApp)
  .start();
