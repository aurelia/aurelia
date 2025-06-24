import { RouterConfiguration as RouterDirectConfiguration } from '@aurelia/router-direct';
import { RouterConfiguration } from '@aurelia/router';
import Aurelia from 'aurelia';
import { P1 } from './p-1';
import { P2 } from './p-2';
import { RouterDirectApp } from './router-direct-app';
import { RouterApp } from './router-app';

const query = new URLSearchParams(location.search);
const useDirectRouter = query.has('use-router-direct');

if (useDirectRouter) {
  Aurelia
    .register(RouterDirectConfiguration)
    .app(RouterDirectApp)
    .start();
} else {
  Aurelia
    .register(RouterConfiguration, P1, P2)
    .app(RouterApp)
    .start();
}
