import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { getOptions } from 'loader-utils';
import * as webpack from 'webpack';

export default function(
  this: webpack.loader.LoaderContext,
  contents: string,
  sourceMap?: object, // ignore existing source map for now
) {
  return loader.call(this, contents);
}

export function loader(
  this: webpack.loader.LoaderContext,
  contents: string,
  _preprocess = preprocess // for testing
) {
  // eslint-disable-next-line no-unused-expressions, @typescript-eslint/strict-boolean-expressions
  this.cacheable && this.cacheable();
  const cb = this.async() as webpack.loader.loaderCallback;
  const options = getOptions(this) as IOptionalPreprocessOptions;

  const filePath = this.resourcePath;

  try {
    const result = _preprocess(
      { path: filePath, contents },
      preprocessOptions({ ...options, stringModuleWrap })
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

function stringModuleWrap(id: string) {
  return `!!raw-loader!${id}`;
}
