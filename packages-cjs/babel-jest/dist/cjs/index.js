"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const babel_jest_1 = require("babel-jest");
function _createTransformer(conventionsOptions = {}, 
// for testing
_preprocess = plugin_conventions_1.preprocess, _babelProcess = babel_jest_1.default.process.bind(babel_jest_1.default)) {
    const au2Options = plugin_conventions_1.preprocessOptions(conventionsOptions);
    function getCacheKey(fileData, filePath, options) {
        const babelKey = babel_jest_1.default.getCacheKey(fileData, filePath, options);
        return `${babelKey}:${JSON.stringify(au2Options)}`;
    }
    // Wrap babel-jest process
    function process(sourceText, sourcePath, transformOptions) {
        const result = _preprocess({ path: sourcePath, contents: sourceText }, au2Options);
        if (result !== undefined) {
            return _babelProcess(result.code, sourcePath, transformOptions);
        }
        return _babelProcess(sourceText, sourcePath, transformOptions);
    }
    return {
        canInstrument: babel_jest_1.default.canInstrument,
        getCacheKey,
        process
    };
}
function createTransformer(conventionsOptions = {}) {
    return _createTransformer(conventionsOptions);
}
const { canInstrument, getCacheKey, process } = createTransformer();
exports.default = { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
//# sourceMappingURL=index.js.map