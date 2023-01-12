import { ConsoleSink } from '@aurelia/kernel';
import { RouterConfiguration } from '@aurelia/router-lite';
import Aurelia, { LoggerConfiguration, LogLevel } from 'aurelia';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { AppShell } from './components/app-shell';

void Aurelia.register(
  LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.debug }),
  RouterConfiguration.customize({ useUrlFragmentHash: false }),
  ValidationHtmlConfiguration,
).app(AppShell).start();
