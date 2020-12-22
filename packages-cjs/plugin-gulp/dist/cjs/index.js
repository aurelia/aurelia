"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const stream_1 = require("stream");
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
function default_1(options = {}) {
    return plugin({
        ...options,
        useProcessedFilePairFilename: true,
        stringModuleWrap
    });
}
exports.default = default_1;
function plugin(options, _preprocess = plugin_conventions_1.preprocess // for testing
) {
    const allOptions = plugin_conventions_1.preprocessOptions(options);
    return new stream_1.Transform({
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
exports.plugin = plugin;
function stringModuleWrap(id) {
    return `text!${id}`;
}
//# sourceMappingURL=index.js.map