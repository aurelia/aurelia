import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { App } from './app';
import { IRouterEventLoggerService } from './router-event-logger-service';
import { FooBar } from './foo-bar';
import { startUrlNavigation } from './url-navigation';

// set the useUrlFragmentHash based on the query string of the same parameter
const params = new URLSearchParams(window.location.search);
const useUrlFragmentHash = params.get('useUrlFragmentHash') === 'true';

if (location.pathname.startsWith('/url-navigation/')) {
  void startUrlNavigation();
} else {
  Aurelia
    .register(
      RouterConfiguration.customize({ useUrlFragmentHash }),
      IRouterEventLoggerService,
      FooBar,
    )
    .app({
      host: document.body,
      component: App,
    })
    .start();
}
