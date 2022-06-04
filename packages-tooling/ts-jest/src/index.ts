import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import tsJest from 'ts-jest';
import type { TransformOptions, TransformedSource } from '@jest/transform';
import * as path from 'path';

const tsTransformer = tsJest.createTransformer();

function _createTransformer(
  conventionsOptions = {},
  // for testing
  _preprocess = preprocess,
  _tsProcess = tsTransformer.process.bind(tsTransformer)
) {
  const au2Options = preprocessOptions(conventionsOptions as IOptionalPreprocessOptions);

  function getCacheKey(
    fileData: string,
    filePath: string,
    options: TransformOptions
  ): string {
    const tsKey = tsTransformer.getCacheKey!(fileData, filePath, options);
    return `${tsKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap ts-jest process
  function process(
    sourceText: string,
    sourcePath: string,
    transformOptions: TransformOptions
  ): TransformedSource {
    const result = _preprocess(
      { path: sourcePath, contents: sourceText },
      au2Options
    );
    let newSourcePath = sourcePath;
    if (result !== undefined) {
      let newCode = result.code;
      if (au2Options.templateExtensions.includes(path.extname(sourcePath))) {
        // Rewrite foo.html to foo.html.ts, or foo.md to foo.md.ts
        newSourcePath += '.ts';
        newCode = `// @ts-nocheck\n${newCode}`;
      }
      return _tsProcess(newCode, newSourcePath, transformOptions);
    }
    return _tsProcess(sourceText, sourcePath, transformOptions);
  }

  return {
    canInstrument: false,
    getCacheKey,
    process
  };
}

function createTransformer(conventionsOptions = {}) {
  return _createTransformer(conventionsOptions);
}

const { canInstrument, getCacheKey, process } = createTransformer();
export default { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
