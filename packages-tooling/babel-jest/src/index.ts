import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import babelTransformer from 'babel-jest';
import { TransformOptions } from '@babel/core';
import type { Config } from '@jest/types';
import type { TransformOptions as TransformOptionsJest, TransformedSource } from '@jest/transform';

function _createTransformer(
  conventionsOptions = {},
  // for testing
  _preprocess = preprocess,
  _babelProcess = babelTransformer.process.bind(babelTransformer)
) {
  const au2Options = preprocessOptions(conventionsOptions as IOptionalPreprocessOptions);

  function getCacheKey(
    fileData: string,
    filePath: Config.Path,
    options: TransformOptionsJest<TransformOptions>
  ): string {
    const babelKey = babelTransformer.getCacheKey!(fileData, filePath, options);
    return `${babelKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap babel-jest process
  function process(
    sourceText: string,
    sourcePath: Config.Path,
    transformOptions: TransformOptionsJest<TransformOptions>
  ): TransformedSource | string {
    const result = _preprocess(
      { path: sourcePath, contents: sourceText },
      au2Options
    );
    if (result !== undefined) {
      return _babelProcess(result.code, sourcePath, transformOptions);
    }
    return _babelProcess(sourceText, sourcePath, transformOptions);
  }

  return {
    canInstrument: babelTransformer.canInstrument,
    getCacheKey,
    process
  };
}

function createTransformer(conventionsOptions = {}) {
  return _createTransformer(conventionsOptions);
}

const { canInstrument, getCacheKey, process } = createTransformer();
export default { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
