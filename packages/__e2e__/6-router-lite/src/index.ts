import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';
import { App } from './app';
import { IRouterEventLoggerService } from './router-event-logger-service';
import { C1, C2, Promisified } from './pages/promisified';

Aurelia
  .register(
    RouterConfiguration,
    IRouterEventLoggerService,
    Promisified,
    C1,
    C2,
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
