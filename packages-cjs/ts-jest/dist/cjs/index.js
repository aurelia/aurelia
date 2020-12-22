"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._createTransformer = exports.createTransformer = exports.process = exports.getCacheKey = exports.canInstrument = void 0;
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const ts_jest_1 = require("ts-jest");
const path = require("path");
const tsTransformer = ts_jest_1.createTransformer();
function _createTransformer(conventionsOptions = {}, 
// for testing
_preprocess = plugin_conventions_1.preprocess, _tsProcess = tsTransformer.process.bind(tsTransformer)) {
    const au2Options = plugin_conventions_1.preprocessOptions(conventionsOptions);
    function getCacheKey(fileData, filePath, configStr, options) {
        const tsKey = tsTransformer.getCacheKey(fileData, filePath, configStr, options);
        return `${tsKey}:${JSON.stringify(au2Options)}`;
    }
    // Wrap ts-jest process
    function process(sourceText, sourcePath, config, transformOptions) {
        const result = _preprocess({ path: sourcePath, contents: sourceText }, au2Options);
        let newSourcePath = sourcePath;
        if (result !== undefined) {
            let newCode = result.code;
            if (au2Options.templateExtensions.includes(path.extname(sourcePath))) {
                // Rewrite foo.html to foo.html.ts, or foo.md to foo.md.ts
                newSourcePath += '.ts';
                newCode = `// @ts-nocheck\n${newCode}`;
            }
            return _tsProcess(newCode, newSourcePath, config, transformOptions);
        }
        return _tsProcess(sourceText, sourcePath, config, transformOptions);
    }
    return {
        canInstrument: false,
        getCacheKey,
        process
    };
}
exports._createTransformer = _createTransformer;
function createTransformer(conventionsOptions = {}) {
    return _createTransformer(conventionsOptions);
}
exports.createTransformer = createTransformer;
const { canInstrument, getCacheKey, process } = createTransformer();
exports.canInstrument = canInstrument;
exports.getCacheKey = getCacheKey;
exports.process = process;
//# sourceMappingURL=index.js.map