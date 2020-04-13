import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import {
  canInstrument as babelCanInstrument,
  getCacheKey as babelGetCacheKey,
  process as babelProcess
} from 'babel-jest';
import { Config } from '@jest/types';
import { TransformOptions, TransformedSource, CacheKeyOptions } from '@jest/transform';
import * as path from 'path';

function createTransformer(conventionsOptions = {}) {
  const au2Options = preprocessOptions(conventionsOptions);

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
    const result = preprocess(
      { path: sourcePath, contents: sourceText },
      au2Options
    );
    let newSourcePath = sourcePath;
    if (result !== undefined) {
      if (au2Options.templateExtensions.includes(path.extname(sourcePath))) {
        // Rewrite foo.html to foo.html.js, or foo.md to foo.md.js
        newSourcePath += '.js';
      }
      return babelProcess(result.code, newSourcePath, config, transformOptions);
    }
    return babelProcess(sourceText, sourcePath, config, transformOptions);
  }

  return {
    canInstrument: babelCanInstrument,
    getCacheKey,
    process
  };
}

const { canInstrument, getCacheKey, process } = createTransformer();
export { canInstrument, getCacheKey, process, createTransformer };
