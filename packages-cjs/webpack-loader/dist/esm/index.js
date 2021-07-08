import { preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { getOptions } from 'loader-utils';

function index (contents, sourceMap) {
    return loader.call(this, contents);
}
function loader(contents, _preprocess = preprocess // for testing
) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/strict-boolean-expressions
    this.cacheable && this.cacheable();
    // @ts-ignore TODO: fix types
    const cb = this.async();
    const options = getOptions(this);
    const filePath = this.resourcePath;
    try {
        const result = _preprocess({ path: filePath, contents }, preprocessOptions(options || {}));
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

export default index;
export { loader };
//# sourceMappingURL=index.js.map
