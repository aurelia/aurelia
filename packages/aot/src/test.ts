/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { Realm } from './vm/realm';
import { DI, LoggerConfiguration, LogLevel, ColorOptions, Registration } from '@aurelia/kernel';
import { IFileSystem } from './system/interfaces';
import { NodeFileSystem } from './system/file-system';

(async function () {
  DebugConfiguration.register();

  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');

  const container = DI.createContainer();
  container.register(
    LoggerConfiguration.create(console, LogLevel.debug, ColorOptions.colors),
    Registration.singleton(IFileSystem, NodeFileSystem),
  );

  const realm = Realm.Create(container);
  const file = await realm.loadEntryFile({ rootDir: root });
  file.Instantiate();

})().catch(err => {
  console.error(err);
  process.exit(1);
});
