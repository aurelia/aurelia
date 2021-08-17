import { preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import babelTransformer from 'babel-jest';

function _createTransformer(conventionsOptions = {}, 
// for testing
_preprocess = preprocess, _babelProcess = babelTransformer.process.bind(babelTransformer)) {
    const au2Options = preprocessOptions(conventionsOptions);
    function getCacheKey(fileData, filePath, options) {
        const babelKey = babelTransformer.getCacheKey(fileData, filePath, options);
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
        canInstrument: babelTransformer.canInstrument,
        getCacheKey,
        process
    };
}
function createTransformer(conventionsOptions = {}) {
    return _createTransformer(conventionsOptions);
}
const { canInstrument, getCacheKey, process } = createTransformer();
var index = { canInstrument, getCacheKey, process, createTransformer, _createTransformer };

export { index as default };
//# sourceMappingURL=index.js.map
