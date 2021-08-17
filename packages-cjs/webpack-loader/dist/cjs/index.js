'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginConventions = require('@aurelia/plugin-conventions');
var loaderUtils = require('loader-utils');

function index (contents, sourceMap) {
    return loader.call(this, contents);
}
function loader(contents, _preprocess = pluginConventions.preprocess // for testing
) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/strict-boolean-expressions
    this.cacheable && this.cacheable();
    // @ts-ignore TODO: fix types
    const cb = this.async();
    const options = loaderUtils.getOptions(this);
    const filePath = this.resourcePath;
    try {
        const result = _preprocess({ path: filePath, contents }, pluginConventions.preprocessOptions(options || {}));
        // webpack uses source-map 0.6.1 typings for RawSourceMap which
        // contains typing error version: string (should be number).
        // use result.map as any to bypass the typing issue.
        if (result) {
            cb(null, result.code, result.map);
            return;
        }
        // bypassed
        cb(null, contents);
    }
    catch (e) {
        cb(e);
    }
}

exports['default'] = index;
exports.loader = loader;
//# sourceMappingURL=index.js.map
