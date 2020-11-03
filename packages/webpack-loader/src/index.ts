import { preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { getOptions } from 'loader-utils';

export default function (
  this: any, // TODO: used to be webpack.loader.LoaderContext but that type no longer exist. API still seems to exist though. Figure out the correct type here and in loader()
  contents: string,
  sourceMap?: object, // ignore existing source map for now
) {
  return loader.call(this, contents);
}

export function loader(
  this: any,
  contents: string,
  _preprocess = preprocess // for testing
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/strict-boolean-expressions
  this.cacheable && this.cacheable();
  const cb = this.async();
  const options = getOptions(this);

  const filePath = this.resourcePath;

  try {
    const result = _preprocess(
      { path: filePath, contents },
      preprocessOptions(options || {})
    );
    // webpack uses source-map 0.6.1 typings for RawSourceMap which
    // contains typing error version: string (should be number).
    // use result.map as any to bypass the typing issue.
    if (result) {
      cb(null, result.code, result.map as any);
      return;
    }

    // bypassed
    cb(null, contents);
  } catch (e) {
    cb(e);
  }
}
