import { getOptions } from 'loader-utils';
import { preprocessResource, preprocessHtmlTemplate } from '@aurelia/plugin-conventions';
import * as fs from 'fs';
export default function (contents, sourceMap) {
    return loader.call(this, contents);
}
export function loader(contents, _fileExists = fileExists // for testing
) {
    // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
    this.cacheable && this.cacheable();
    const cb = this.async();
    const options = getOptions(this);
    const ts = options && options.ts;
    const filePath = this.resourcePath;
    const ext = extname(filePath);
    let result;
    try {
        if (ext === '.html') {
            result = preprocessHtmlTemplate(filePath, contents, ts);
        }
        else {
            const htmlFilePath = filePath.slice(0, -ext.length) + '.html';
            const hasHtmlPair = _fileExists(htmlFilePath);
            result = preprocessResource(filePath, contents, hasHtmlPair);
        }
    }
    catch (e) {
        cb(e);
        return;
    }
    // webpack uses source-map 0.6.1 typings for RawSourceMap which
    // contains typing error version: string (should be number).
    // use result.map as any to bypass the typing issue.
    cb(null, result.code, result.map);
}
function extname(filePath) {
    const idx = filePath.lastIndexOf('.');
    if (idx !== -1)
        return filePath.slice(idx);
    return '';
}
function fileExists(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=index.js.map