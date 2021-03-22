import Aurelia, { LoggerConfiguration, ConsoleSink, LogLevel, CustomAttribute } from 'aurelia';
import { RouterConfiguration } from 'jwx-router';

import { AppRoot } from './app-root';
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
  // CustomAttribute.define('default-load', class DefaultLoadCustomAttribute {
  //   public value: unknown;
  //   public binding(): void {
  //     console.log('default-load CustomAttribute', this.value, this);
  //   }
  // }),
  // CustomAttribute.define('default', class DefaultCustomAttribute {
  //   public value: unknown;
  //   public binding(): void {
  //     console.log('default CustomAttribute', this.value, this);
  //   }
  // }),
);

au.app({
  component: AppRoot,
  host: document.querySelector('app-root'),
});

await au.start();
