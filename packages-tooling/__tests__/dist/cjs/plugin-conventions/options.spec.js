"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const testing_1 = require("@aurelia/testing");
describe('preprocessOptions', function () {
    it('returns default options', function () {
        testing_1.assert.deepEqual((0, plugin_conventions_1.preprocessOptions)(), {
            cssExtensions: ['.css', '.less', '.sass', '.scss', '.styl'],
            jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
            templateExtensions: ['.haml', '.html', '.jade', '.md', '.pug', '.slim', '.slm'],
            useCSSModule: false,
            hmr: true,
            enableConventions: true,
            experimentalTemplateTypeCheck: false,
            hmrModule: 'module'
        });
    });
    it('merges optional extensions', function () {
        testing_1.assert.deepEqual((0, plugin_conventions_1.preprocessOptions)({
            cssExtensions: ['.css', '.some'],
            jsExtensions: ['.mjs'],
            templateExtensions: ['.markdown']
        }), {
            cssExtensions: ['.css', '.less', '.sass', '.scss', '.some', '.styl'],
            jsExtensions: ['.coffee', '.js', '.jsx', '.mjs', '.ts', '.tsx'],
            templateExtensions: ['.haml', '.html', '.jade', '.markdown', '.md', '.pug', '.slim', '.slm'],
            useCSSModule: false,
            hmr: true,
            enableConventions: true,
            experimentalTemplateTypeCheck: false,
            hmrModule: 'module'
        });
    });
    it('merges optional options', function () {
        const wrap = (id) => `text!${id}`;
        testing_1.assert.deepEqual((0, plugin_conventions_1.preprocessOptions)({
            defaultShadowOptions: { mode: 'closed' },
            stringModuleWrap: wrap,
            templateExtensions: ['.markdown'],
            useProcessedFilePairFilename: true,
            useCSSModule: false
        }), {
            defaultShadowOptions: { mode: 'closed' },
            cssExtensions: ['.css', '.less', '.sass', '.scss', '.styl'],
            jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
            templateExtensions: ['.haml', '.html', '.jade', '.markdown', '.md', '.pug', '.slim', '.slm'],
            stringModuleWrap: wrap,
            useProcessedFilePairFilename: true,
            useCSSModule: false,
            hmr: true,
            enableConventions: true,
            experimentalTemplateTypeCheck: false,
            hmrModule: 'module'
        });
    });
    it('merges optional options with useCSSModule', function () {
        const wrap = (id) => `text!${id}`;
        testing_1.assert.deepEqual((0, plugin_conventions_1.preprocessOptions)({
            cssExtensions: ['.some'],
            defaultShadowOptions: { mode: 'open' },
            stringModuleWrap: wrap,
            useProcessedFilePairFilename: true,
            useCSSModule: true
        }), {
            defaultShadowOptions: { mode: 'open' },
            cssExtensions: ['.css', '.less', '.sass', '.scss', '.some', '.styl'],
            jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
            templateExtensions: ['.haml', '.html', '.jade', '.md', '.pug', '.slim', '.slm'],
            stringModuleWrap: wrap,
            useCSSModule: true,
            useProcessedFilePairFilename: true,
            hmr: true,
            enableConventions: true,
            experimentalTemplateTypeCheck: false,
            hmrModule: 'module'
        });
    });
});
//# sourceMappingURL=options.spec.js.map