import assert from 'node:assert/strict';
import appTypeScript from 'typescript';
import { preprocessOptions, preprocessResource } from '@aurelia/plugin-conventions';

assert.match(appTypeScript.version, /^7\.0\./);

const result = preprocessResource(
  {
    path: 'src/app.ts',
    contents: 'export class App {}\n',
    filePair: 'app.html',
  },
  preprocessOptions({ hmr: false }),
);

assert.match(result.code, /@customElement\(__au2ViewDef\)/);
