import { getOptions } from 'loader-utils';
import * as webpack from 'webpack';
import { preprocess } from '@aurelia/plugin-conventions';
import * as path from 'path';

export default function(
  this: webpack.loader.LoaderContext,
  contents: string,
  sourceMap?: any, // ignore existing source map for now
) {
  return loader.call(this, contents);
}

export function loader(
  this: webpack.loader.LoaderContext,
  contents: string,
  _preprocess = preprocess // for testing
) {
  // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
  this.cacheable && this.cacheable();
  const cb = this.async() as webpack.loader.loaderCallback;
  const options = getOptions(this);
  let shadowOptions;
  if (options && options.defaultShadowOptions) {
    shadowOptions = options.defaultShadowOptions as { mode: 'open' | 'closed' };
  }
  const filePath = this.resourcePath;
  const ext = path.extname(filePath);

  try {
    if (ext === '.html' || ext === '.js' || ext === '.ts') {
      const result = _preprocess(filePath, contents, '', shadowOptions, stringModuleWrap);

      // webpack uses source-map 0.6.1 typings for RawSourceMap which
      // contains typing error version: string (should be number).
      // use result.map as any to bypass the typing issue.
      cb(null, result.code, result.map as any);
      return;
    }

    // bypass
    cb(null, contents);
  } catch (e) {
    cb(e);
  }
}

function stringModuleWrap(id: string) {
  return 'raw-loader!' + id;
}
