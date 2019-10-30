/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { Host } from './vm/host';

(async function () {
  DebugConfiguration.register();

  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..');
  const host = new Host();
  const pkg = await host.loadEntryPackage({ rootDir: root });

})().catch(err => {
  console.error(err);
  process.exit(1);
});
