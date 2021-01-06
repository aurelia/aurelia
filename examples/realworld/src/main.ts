import Aurelia, { LoggerConfiguration, LogLevel, RouterConfiguration } from 'aurelia';

import { AppRootCustomElement } from './app-root';
import * as GlobalResources from './_shared/index';
import './style.css';

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
  component: AppRootCustomElement,
  host: document.querySelector('app-root'),
});

await au.start();
