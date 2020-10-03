import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';
import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { MyApp } from './my-app';

Aurelia.register(
  RouterConfiguration.customize({}),
  LoggerConfiguration.create({ $console: console, level: LogLevel.trace })
).app(MyApp).start();
