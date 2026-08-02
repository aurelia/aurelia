'use strict';

const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { preprocessOptions, preprocessResource } = require('@aurelia/plugin-conventions');

const appTypeScript = require('typescript');
const pluginRequire = createRequire(require.resolve('@aurelia/plugin-conventions'));
const toolingTypeScript = pluginRequire('@typescript/typescript6');

assert.match(appTypeScript.version, /^7\.0\./);
assert.match(toolingTypeScript.version, /^6\./);

const result = preprocessResource(
  {
    path: 'src/app.ts',
    contents: 'export class App {}\n',
    filePair: 'app.html',
  },
  preprocessOptions({ hmr: false }),
);

assert.match(result.code, /@customElement\(__au2ViewDef\)/);
