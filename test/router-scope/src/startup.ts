import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { App } from './app';

Aurelia.register(RouterConfiguration).app(App).start();
