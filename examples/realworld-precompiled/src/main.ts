import Aurelia, { LoggerConfiguration, ConsoleSink, LogLevel, RouterConfiguration } from 'aurelia';

import { AppRootCustomElement } from './app-root';
import * as GlobalResources from './_shared/index';
import './style.css';

const au = new Aurelia();

au.register(
  LoggerConfiguration.create({
    level: LogLevel.debug,
    sinks: [ConsoleSink],
  }),
  RouterConfiguration.customize({
    useUrlFragmentHash: false,
  }),
  GlobalResources,
);

au.app({
  component: AppRootCustomElement,
  host: document.querySelector('app-root'),
});

await au.start();
