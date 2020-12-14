import {
  resolve,
} from 'path';
import {
  DI,
  LoggerConfiguration,
  LogLevel,
  ColorOptions,
  Registration,
} from '@aurelia/kernel';
import {
  IFileSystem,
} from './system/interfaces.js';
import {
  NodeFileSystem,
} from './system/file-system.js';
import {
  ServiceHost,
} from './service-host.js';

(async function () {
  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');

  const container = DI.createContainer();
  container.register(
    LoggerConfiguration.create({ $console: console, level: LogLevel.debug, colorOptions: ColorOptions.colors }),
    Registration.singleton(IFileSystem, NodeFileSystem),
  );

  const host = new ServiceHost(container);

  await host.executeEntryFile(root);

})().catch(err => {
  console.error(err);
  process.exit(1);
});
