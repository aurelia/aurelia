/* eslint-disable import/no-nodejs-modules */
import { DebugConfiguration } from '@aurelia/debug';
import { resolve } from 'path';
import { Workspace } from './workspace';

(async function () {
  DebugConfiguration.register();

  // Just for testing
  const root = resolve(__dirname, '..', '..', '..', '..');
  const ws = Workspace.create();
  const project = await ws.loadProject(root);

})().catch(err => {
  console.error(err);
  process.exit(1);
});
