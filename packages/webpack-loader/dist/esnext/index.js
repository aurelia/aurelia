import { getOptions } from 'loader-utils';
import { preprocess } from '@aurelia/plugin-conventions';
import * as path from 'path';
export default function (contents, sourceMap) {
    return loader.call(this, contents);
}
export function loader(contents, _preprocess = preprocess // for testing
) {
    // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
    this.cacheable && this.cacheable();
    const cb = this.async();
    const options = getOptions(this);
    const ts = options && options.ts;
    const filePath = this.resourcePath;
    const ext = path.extname(filePath);
    try {
        if (ext === '.html' || ext === '.js' || ext === '.ts') {
            const result = _preprocess(filePath, contents, ts);
            // webpack uses source-map 0.6.1 typings for RawSourceMap which
            // contains typing error version: string (should be number).
            // use result.map as any to bypass the typing issue.
            cb(null, result.code, result.map);
            return;
        }
        // bypass
        cb(null, contents);
    }
    catch (e) {
        cb(e);
    }
}
//# sourceMappingURL=index.js.map