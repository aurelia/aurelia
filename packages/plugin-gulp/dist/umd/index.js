(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "stream", "fs", "@aurelia/plugin-conventions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const stream_1 = require("stream");
    const fs = require("fs");
    const plugin_conventions_1 = require("@aurelia/plugin-conventions");
    function default_1(opts = {}) {
        const ts = !!opts.ts;
        return plugin(ts);
    }
    exports.default = default_1;
    function plugin(ts = false, _fileExists = fileExists // for testing
    ) {
        return new stream_1.Transform({
            objectMode: true,
            transform: function (file, enc, cb) {
                if (file.isStream()) {
                    this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
                }
                else if (file.isBuffer()) {
                    const { extname } = file;
                    let result;
                    if (extname === '.html') {
                        // Rewrite foo.html to foo.html.js
                        result = plugin_conventions_1.preprocessHtmlTemplate(file.relative, file.contents.toString(), ts);
                        file.basename += '.js';
                    }
                    else if (extname === '.js' || extname === '.ts') {
                        const htmlFilePath = file.path.slice(0, -3) + '.html';
                        const hasHtmlPair = _fileExists(htmlFilePath);
                        result = plugin_conventions_1.preprocessResource(file.relative, file.contents.toString(), hasHtmlPair);
                    }
                    if (result) {
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
    function fileExists(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.isFile();
        }
        catch (e) {
            return false;
        }
    }
});
//# sourceMappingURL=index.js.map