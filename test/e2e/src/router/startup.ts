import { DI } from '@aurelia/kernel';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia } from '@aurelia/runtime';
import { RouterView, IRouter } from '@aurelia/router';
import { App } from './app';

const container = DI.createContainer();
container.register(BasicConfiguration, <any>RouterView);
const router = container.get<IRouter>(IRouter);
window['au'] = new Aurelia(container)
  .app({ host: document.querySelector('app'), component: new App(router) })
  .start();

