import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { App } from './app';
import { IRouterEventLoggerService } from './router-event-logger-service';

// set the useUrlFragmentHash based on the query string of the same parameter
const params = new URLSearchParams(window.location.search);
const useUrlFragmentHash = params.get('useUrlFragmentHash') === 'true';

Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash }),
    IRouterEventLoggerService,
  )
  .app({
    host: document.body,
    component: App,
  })
  .start();
