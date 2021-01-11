import Aurelia, { LoggerConfiguration, ConsoleSink, LogLevel, RouterConfiguration, StyleConfiguration } from 'aurelia';

import { AppRootCustomElement } from './app-root';
import * as GlobalResources from './_shared/index';
import './_assets/style.css';
import main from './main.css';

const au = new Aurelia();

au.register(
  LoggerConfiguration.create({
    level: LogLevel.debug,
    sinks: [ConsoleSink],
  }),
  RouterConfiguration.customize({
    useUrlFragmentHash: false,
    swapStrategy: 'sequential-remove-first',
    resolutionMode: 'static',
  }),
  StyleConfiguration.shadowDOM({
    sharedStyles: [
      main,
    ],
  }),
  GlobalResources,
);

au.app({
  component: AppRootCustomElement,
  host: document.querySelector('app-root'),
});

await au.start();
