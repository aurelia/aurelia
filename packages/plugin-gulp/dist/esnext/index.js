import { Transform } from 'stream';
import { preprocess } from '@aurelia/plugin-conventions';
export default function (opts = {}) {
    const ts = !!opts.ts;
    return plugin(ts);
}
export function plugin(ts = false, _preprocess = preprocess // for testing
) {
    return new Transform({
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
//# sourceMappingURL=index.js.map