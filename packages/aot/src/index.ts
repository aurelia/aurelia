/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { Realm } from './vm/realm';

(async function () {
  DebugConfiguration.register();

  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');
  const realm = Realm.Create();
  const file = await realm.loadEntryFile({ rootDir: root });
  file.InitializeEnvironment();

})().catch(err => {
  console.error(err);
  process.exit(1);
});
