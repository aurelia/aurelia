import { ConsoleSink } from '@aurelia/kernel';
import Aurelia, { LoggerConfiguration, LogLevel, RouterConfiguration } from 'aurelia';
import { AppShell } from './components/app-shell';

void Aurelia.register(
  LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.debug }),
  RouterConfiguration.customize({ useUrlFragmentHash: false }),
).app(AppShell).start();
