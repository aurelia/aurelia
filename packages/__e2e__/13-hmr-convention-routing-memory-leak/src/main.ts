import { RouterConfiguration } from '@aurelia/router';
import { RouterConfiguration as RouterLiteConfiguration } from '@aurelia/router-lite';
import Aurelia from 'aurelia';
import { P1 } from './p-1';
import { P2 } from './p-2';
import { RouterApp } from './router-app';
import { RouterLiteApp } from './router-lite-app';

const query = new URLSearchParams(location.search);
const useRouter = query.has('use-router');

if (useRouter) {
  Aurelia
    .register(RouterConfiguration)
    .app(RouterApp)
    .start();
} else {
  Aurelia
    .register(RouterLiteConfiguration, P1, P2)
    .app(RouterLiteApp)
    .start();
}
