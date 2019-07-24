(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "stream", "@aurelia/plugin-conventions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const stream_1 = require("stream");
    const plugin_conventions_1 = require("@aurelia/plugin-conventions");
    function default_1(opts = {}) {
        const ts = !!opts.ts;
        return plugin(ts);
    }
    exports.default = default_1;
    function plugin(ts = false, _preprocess = plugin_conventions_1.preprocess // for testing
    ) {
        return new stream_1.Transform({
            objectMode: true,
            transform: function (file, enc, cb) {
                if (file.isStream()) {
                    this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
                }
                else if (file.isBuffer()) {
                    const { extname } = file;
                    if (extname === '.html' || extname === '.js' || extname === '.ts') {
                        // Rewrite foo.html to foo.html.js
                        const result = _preprocess(file.relative, file.contents.toString(), ts);
                        if (extname === '.html') {
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
});
//# sourceMappingURL=index.js.map