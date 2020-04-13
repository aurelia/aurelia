import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import { createTransformer as tsCreateTransformer } from 'ts-jest';

import { Config } from '@jest/types';
import { TransformOptions, TransformedSource, CacheKeyOptions } from '@jest/transform';
import * as path from 'path';

function createTransformer(conventionsOptions: any = {}) {
  const au2Options = preprocessOptions(conventionsOptions as IOptionalPreprocessOptions);
  const tsTransformer = tsCreateTransformer();

  function getCacheKey(
    fileData: string,
    filePath: Config.Path,
    configStr: string,
    options: CacheKeyOptions
  ): string {
    const tsKey = tsTransformer.getCacheKey(fileData, filePath, configStr, options);
    return `${tsKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap ts-jest process
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
      let newCode = result.code;
      if (au2Options.templateExtensions.includes(path.extname(sourcePath))) {
        // Rewrite foo.html to foo.html.ts, or foo.md to foo.md.ts
        newSourcePath += '.ts';
        newCode = '// @ts-nocheck\n' + newCode;
      }
      return tsTransformer.process(newCode, newSourcePath, config, transformOptions);
    }
    return tsTransformer.process(sourceText, sourcePath, config, transformOptions);
  }

  return {
    canInstrument: false,
    getCacheKey,
    process
  };
}

const { canInstrument, getCacheKey, process } = createTransformer();
export { canInstrument, getCacheKey, process, createTransformer };
