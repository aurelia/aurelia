"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const babel_jest_1 = require("@aurelia/babel-jest");
const { _createTransformer } = babel_jest_1.default;
const testing_1 = require("@aurelia/testing");
const path = require("path");
const config_1 = require("../jest-test-utils/config");
function makePreprocess(_fileExists) {
    return function (unit, options) {
        return (0, plugin_conventions_1.preprocess)(unit, options, _fileExists);
    };
}
function babelProcess(sourceText, _sourcePath, _transformOptions) {
    return sourceText;
}
const options = {
    config: (0, config_1.makeProjectConfig)(),
    configString: JSON.stringify((0, config_1.makeProjectConfig)()),
    instrument: false,
    cacheFS: new Map(),
    transformerConfig: {},
    supportsDynamicImport: false,
    supportsTopLevelAwait: false,
    supportsExportNamespaceFrom: true,
    supportsStaticESM: true,
};
describe('babel-jest', function () {
    it('transforms html file', function () {
        const html = '<template></template>';
        const expected = `import { CustomElement } from '@aurelia/runtime-html';
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [  ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
        const t = _createTransformer({}, makePreprocess(() => false), babelProcess);
        const result = t.process(html, 'src/foo-bar.html', options);
        testing_1.assert.equal(result, expected);
    });
    it('transforms html file with shadowOptions', function () {
        const html = '<template></template>';
        const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { shadowCSS } from '@aurelia/runtime-html';
import d0 from "./foo-bar.less";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ shadowCSS(d0) ];
export const shadowOptions = { mode: 'open' };
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies, shadowOptions });
  }
  container.register(_e);
}
`;
        const t = _createTransformer({ defaultShadowOptions: { mode: 'open' } }, makePreprocess(p => p === path.join('src', 'foo-bar.less')), babelProcess);
        const result = t.process(html, 'src/foo-bar.html', options);
        testing_1.assert.equal(result, expected);
    });
    it('transforms html file with cssModules', function () {
        const html = '<template></template>';
        const expected = `import { CustomElement } from '@aurelia/runtime-html';
import { cssModules } from '@aurelia/runtime-html';
import d0 from "./foo-bar.scss";
export const name = "foo-bar";
export const template = "<template></template>";
export default template;
export const dependencies = [ cssModules(d0) ];
let _e;
export function register(container) {
  if (!_e) {
    _e = CustomElement.define({ name, template, dependencies });
  }
  container.register(_e);
}
`;
        const t = _createTransformer({ useCSSModule: true }, makePreprocess(p => p === path.join('src', 'foo-bar.scss')), babelProcess);
        const result = t.process(html, 'src/foo-bar.html', options);
        testing_1.assert.equal(result, expected);
    });
    it('transforms js file with html pair', function () {
        const js = 'export class FooBar {}\n';
        const expected = `import * as __au2ViewDef from './foo-bar.html';
import { customElement } from '@aurelia/runtime-html';
@customElement(__au2ViewDef)
export class FooBar {}
`;
        const t = _createTransformer({}, makePreprocess(p => p === path.join('src', 'foo-bar.html')), babelProcess);
        const result = t.process(js, 'src/foo-bar.js', options);
        testing_1.assert.equal(result, expected);
    });
    it('ignores js file without html pair', function () {
        const js = 'export class FooBar {}\n';
        const expected = `export class FooBar {}
`;
        const t = _createTransformer({}, makePreprocess(() => false), babelProcess);
        const result = t.process(js, 'src/foo-bar.js', options);
        testing_1.assert.equal(result, expected);
    });
});
//# sourceMappingURL=index.spec.js.map