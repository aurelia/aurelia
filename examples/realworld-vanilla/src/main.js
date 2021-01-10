
import { Aurelia, LoggerConfiguration, LogLevel, RouterConfiguration } from './aurelia.js';

import { AppRoot } from './app-root.js';
import * as GlobalResources from './_shared/index.js';

const au = new Aurelia();

au.register(
  LoggerConfiguration.create({
    $console: console,
    level: LogLevel.debug,
  }),
  RouterConfiguration.customize({
    useUrlFragmentHash: false,
    swapStrategy: 'sequential-remove-first',
  }),
  GlobalResources,
);

au.app({
  component: AppRoot,
  host: document.querySelector('app-root'),
});

au.start();
