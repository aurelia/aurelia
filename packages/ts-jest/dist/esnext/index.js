import { preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { createTransformer as tsCreateTransformer } from 'ts-jest';
import * as path from 'path';
const tsTransformer = tsCreateTransformer();
function _createTransformer(conventionsOptions = {}, 
// for testing
_preprocess = preprocess, _tsProcess = tsTransformer.process.bind(tsTransformer)) {
    const au2Options = preprocessOptions(conventionsOptions);
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
function createTransformer(conventionsOptions = {}) {
    return _createTransformer(conventionsOptions);
}
const { canInstrument, getCacheKey, process } = createTransformer();
export { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
//# sourceMappingURL=index.js.map