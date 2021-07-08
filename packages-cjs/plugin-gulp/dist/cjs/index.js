'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var stream = require('stream');
var pluginConventions = require('@aurelia/plugin-conventions');

function index (options = {}) {
    return plugin({
        ...options,
        useProcessedFilePairFilename: true,
        stringModuleWrap
    });
}
function plugin(options, _preprocess = pluginConventions.preprocess // for testing
) {
    const allOptions = pluginConventions.preprocessOptions(options);
    return new stream.Transform({
        objectMode: true,
        transform: function (file, enc, cb) {
            if (file.isStream()) {
                this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
            }
            else if (file.isBuffer()) {
                // Rewrite foo.html to foo.html.js
                const result = _preprocess({
                    path: file.relative,
                    contents: file.contents.toString(),
                    base: file.base
                }, allOptions);
                if (result) {
                    if (allOptions.templateExtensions.includes(file.extname)) {
                        // Rewrite foo.html to foo.html.js, or foo.md to foo.md.js
                        file.basename += '.js';
                    }
                    file.contents = Buffer.from(result.code);
                    if (file.sourceMap) {
                        // ignore existing source map for now
                        file.sourceMap = result.map;
                    }
                }
            }
            cb(undefined, file);
        }
    });
}
function stringModuleWrap(id) {
    return `text!${id}`;
}

exports.default = index;
exports.plugin = plugin;
//# sourceMappingURL=index.js.map
