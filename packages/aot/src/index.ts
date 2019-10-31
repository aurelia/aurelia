/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { Host } from './vm/host';
import { FileKind } from './system/interfaces';

(async function () {
  DebugConfiguration.register();

  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');
  const host = new Host();
  const file = await host.loadEntryFile({ rootDir: root });
  file.InitializeEnvironment();

})().catch(err => {
  console.error(err);
  process.exit(1);
});
