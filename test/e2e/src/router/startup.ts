import { DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia } from '@aurelia/runtime';
import { RouterView, IRouter } from '@aurelia/router';
import { App } from './app';
import { Page1 } from './page1';
import { Page2 } from './page2';

const container = DI.createContainer();
container.register(BasicConfiguration, <any>RouterView, <any>Page1, <any>Page2);
const router = container.get<IRouter>(IRouter);
window['au'] = new Aurelia(container)
  .app({ host: document.querySelector('app'), component: new App(router) })
  .start();

