import Aurelia, { LoggerConfiguration, LogLevel, RouterConfiguration } from 'aurelia';
import { AppShell } from './components/app-shell';

void Aurelia.register(
  LoggerConfiguration.create({ $console: console, level: LogLevel.debug }),
  RouterConfiguration.customize({ useUrlFragmentHash: true }),
).app(AppShell).start();
