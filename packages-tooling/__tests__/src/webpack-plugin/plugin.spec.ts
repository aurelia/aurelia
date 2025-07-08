import { IFileUnit, IOptionalPreprocessOptions } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';
import { loader } from '@aurelia/webpack-plugin';

function preprocess(unit: IFileUnit, options: IOptionalPreprocessOptions) {
  if (unit.path.endsWith('.css')) return;
  const { defaultShadowOptions, stringModuleWrap } = options;
  const shadowOptionsString = defaultShadowOptions ? (`${JSON.stringify(defaultShadowOptions)} `) : '';
  const stringModuleWrapString = defaultShadowOptions && stringModuleWrap ? stringModuleWrap(unit.path) : unit.path;
  return {
    code: `processed ${shadowOptionsString}${stringModuleWrapString} ${unit.contents}`,
    map: { version: 3 }
  };
}

describe('webpack-plugin', function () {
  it('transforms html file', function (done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.html content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      getOptions: () => ({}),
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('transforms html file in shadowDOM mode', function (done) {
    const content = 'content';
    const expected = 'processed {"mode":"open"} src/foo-bar.html content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      query: { defaultShadowOptions: { mode: 'open' } },
      getOptions: function () { return this.query; },
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('transforms html file in CSSModule mode', function (done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.html content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      query: { useCSSModule: true },
      getOptions: function () { return this.query; },
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('transforms html file in shadowDOM mode ignoring CSSModule mode', function (done) {
    const content = 'content';
    const expected = 'processed {"mode":"open"} src/foo-bar.html content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      query: { defaultShadowOptions: { mode: 'open' }, useCSSModule: true },
      getOptions: function () { return this.query; },
      resourcePath: 'src/foo-bar.html'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('transforms js file', function (done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.js content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      getOptions: () => ({}),
      resourcePath: 'src/foo-bar.js'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('transforms ts file', function (done) {
    const content = 'content';
    const expected = 'processed src/foo-bar.ts content';
    let i = 0;

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, expected);
        assert.equal(map.version, 3);
        done();
      },
      getOptions: () => ({}),
      resourcePath: 'src/foo-bar.ts'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

  it('bypass other file', function (done) {
    const content = 'content';
    let i = 0;
    // const notExpected = 'processed src/foo-bar.css content';

    const context = {
      async: () => function (err, code, map) {
        i++;
        if (err) {
          done(err);
          return;
        }
        assert.equal(code, content);
        assert.equal(map, undefined);
        done();
      },
      getOptions: () => ({}),
      resourcePath: 'src/foo-bar.css'
    };

    loader.call(context, content, preprocess);
    assert.strictEqual(i, 1);
  });

    describe('CommonJS compatibility', function () {
    it('should export main function directly for require() usage', function () {
      // Test that the main export can be used directly without .default
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const pluginExport = require('@aurelia/webpack-plugin');

      assert.strictEqual(typeof pluginExport, 'function', 'Main export should be a function');

      // Test that calling it as a plugin returns a webpack plugin instance
      const pluginInstance = pluginExport();
      assert.strictEqual(typeof pluginInstance, 'object', 'Plugin instance should be an object');
      assert.strictEqual(typeof pluginInstance.apply, 'function', 'Plugin instance should have apply method');
    });

    it('should export loader function for require() usage', function () {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { loader: loaderExport } = require('@aurelia/webpack-plugin');

      assert.strictEqual(typeof loaderExport, 'function', 'Loader export should be a function');
    });

    it('should export plugin function for require() usage', function () {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { plugin: pluginFn } = require('@aurelia/webpack-plugin');

      assert.strictEqual(typeof pluginFn, 'function', 'Plugin function export should be a function');

      // Test that calling it returns a webpack plugin instance
      const pluginInstance = pluginFn();
      assert.strictEqual(typeof pluginInstance, 'object', 'Plugin instance should be an object');
      assert.strictEqual(typeof pluginInstance.apply, 'function', 'Plugin instance should have apply method');
    });

    it('should maintain backward compatibility with .default', function () {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const pluginExport = require('@aurelia/webpack-plugin');

      assert.strictEqual(typeof pluginExport.default, 'function', 'Should still have .default for backward compatibility');
      assert.strictEqual(pluginExport, pluginExport.default, 'Main export should be the same as .default');
    });
  });

  describe('Type checking support', function () {
    it('passes experimentalTemplateTypeCheck option to preprocess', function (done) {
      const content = 'export class MyApp {}';
      let i = 0;
      let capturedOptions: any;

      // Mock preprocess function that captures the options
      function mockPreprocess(unit: IFileUnit, options: IOptionalPreprocessOptions) {
        capturedOptions = options;
        return {
          code: `type-checked ${unit.contents}`,
          map: { version: 3 }
        };
      }

      const context = {
        async: () => function (err, code, map) {
          i++;
          if (err) {
            done(err);
            return;
          }
          assert.equal(code, `type-checked ${content}`);
          assert.equal(map.version, 3);
          assert.equal(capturedOptions.experimentalTemplateTypeCheck, true);
          done();
        },
        getOptions: () => ({ experimentalTemplateTypeCheck: true }),
        resourcePath: 'src/my-app.ts'
      };

      loader.call(context, content, mockPreprocess);
      assert.strictEqual(i, 1);
    });

    it('defaults experimentalTemplateTypeCheck to false when not specified', function (done) {
      const content = 'export class MyApp {}';
      let i = 0;
      let capturedOptions: any;

      // Mock preprocess function that captures the options
      function mockPreprocess(unit: IFileUnit, options: IOptionalPreprocessOptions) {
        capturedOptions = options;
        return {
          code: `processed ${unit.contents}`,
          map: { version: 3 }
        };
      }

      const context = {
        async: () => function (err, code, map) {
          i++;
          if (err) {
            done(err);
            return;
          }
          assert.equal(code, `processed ${content}`);
          assert.equal(map.version, 3);
          assert.equal(capturedOptions.experimentalTemplateTypeCheck, false);
          done();
        },
        getOptions: () => ({}),
        resourcePath: 'src/my-app.ts'
      };

      loader.call(context, content, mockPreprocess);
      assert.strictEqual(i, 1);
    });
  });
});
