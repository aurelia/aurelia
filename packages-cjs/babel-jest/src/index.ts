import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import {
  canInstrument as babelCanInstrument,
  getCacheKey as babelGetCacheKey,
  process as babelProcess
} from 'babel-jest';
import type { Config } from '@jest/types';
import type { TransformOptions, TransformedSource, CacheKeyOptions } from '@jest/transform';

function _createTransformer(
  conventionsOptions = {},
  // for testing
  _preprocess = preprocess,
  _babelProcess = babelProcess
) {
  const au2Options = preprocessOptions(conventionsOptions as IOptionalPreprocessOptions);

  function getCacheKey(
    fileData: string,
    filePath: Config.Path,
    configStr: string,
    options: CacheKeyOptions
  ): string {
    const babelKey = babelGetCacheKey!(fileData, filePath, configStr, options);
    return `${babelKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap babel-jest process
  function process(
    sourceText: string,
    sourcePath: Config.Path,
    config: Config.ProjectConfig,
    transformOptions?: TransformOptions
  ): TransformedSource {
    const result = _preprocess(
      { path: sourcePath, contents: sourceText },
      au2Options
    );
    if (result !== undefined) {
      return _babelProcess(result.code, sourcePath, config, transformOptions);
    }
    return _babelProcess(sourceText, sourcePath, config, transformOptions);
  }

  return {
    canInstrument: babelCanInstrument,
    getCacheKey,
    process
  };
}

function createTransformer(conventionsOptions = {}) {
  return _createTransformer(conventionsOptions);
}

const { canInstrument, getCacheKey, process } = createTransformer();
export { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
