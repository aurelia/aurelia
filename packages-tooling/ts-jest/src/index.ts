import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import tsJest, { TsJestTransformerOptions } from 'ts-jest';
import * as TsJest from 'ts-jest';
import type { TransformOptions, TransformedSource } from '@jest/transform';
import * as path from 'path';

// eslint-disable-next-line
const tsJestCreateTransformer = (TsJest as any).createTransformer;
// making both esm and cjs work without any issues
const $createTransformer = (typeof tsJestCreateTransformer === 'function'
  ? tsJestCreateTransformer
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  : typeof tsJestCreateTransformer.default?.createTransformer === 'function'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ? tsJestCreateTransformer.default.createTransformer
    : typeof tsJest.createTransformer === 'function'
      ? tsJest.createTransformer
      : (() => { throw new Error('Unable to import createTransformer from "ts-jest"'); })
) as typeof tsJest.createTransformer;

const tsTransformer = $createTransformer();

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
    options: TransformOptions<TsJestTransformerOptions>
  ): string {
    const tsKey = tsTransformer.getCacheKey(fileData, filePath, options);
    return `${tsKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap ts-jest process
  function process(
    sourceText: string,
    sourcePath: string,
    transformOptions:  TransformOptions<TsJestTransformerOptions>
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
