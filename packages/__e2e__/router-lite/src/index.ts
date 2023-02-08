import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router-lite';
import { App } from './app';
import { IRouterEventLoggerService } from './router-event-logger-service';

Aurelia
  .register(
    RouterConfiguration,
    IRouterEventLoggerService,
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
