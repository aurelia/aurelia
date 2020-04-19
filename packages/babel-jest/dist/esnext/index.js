import { preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { canInstrument as babelCanInstrument, getCacheKey as babelGetCacheKey, process as babelProcess } from 'babel-jest';
function _createTransformer(conventionsOptions = {}, 
// for testing
_preprocess = preprocess, _babelProcess = babelProcess) {
    const au2Options = preprocessOptions(conventionsOptions);
    function getCacheKey(fileData, filePath, configStr, options) {
        const babelKey = babelGetCacheKey(fileData, filePath, configStr, options);
        return `${babelKey}:${JSON.stringify(au2Options)}`;
    }
    // Wrap babel-jest process
    function process(sourceText, sourcePath, config, transformOptions) {
        const result = _preprocess({ path: sourcePath, contents: sourceText }, au2Options);
        if (result !== undefined) {
            return _babelProcess(result.code, sourcePath, config, transformOptions);
        }
        return _babelProcess(sourceText, sourcePath, config, transformOptions);
    }
    return {
        canInstrument: babelCanInstrument,
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