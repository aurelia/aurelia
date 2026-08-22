import { IOptionalPreprocessOptions, preprocess, preprocessAsync, preprocessOptions } from '@aurelia/plugin-conventions';
import { nodeFileUnitHost, nodeFileUnitHostAsync } from '@aurelia/plugin-conventions/node';
import * as babelJest from 'babel-jest';
import { TransformOptions } from '@babel/core';
import type { TransformOptions as TransformOptionsJest, SyncTransformer, TransformedSource } from '@jest/transform';
import { env } from 'process';

const babelTransformer = babelJest.createTransformer() as SyncTransformer<TransformOptions> & {
  processAsync?: (
    sourceText: string,
    sourcePath: string,
    transformOptions: TransformOptionsJest<TransformOptions>
  ) => Promise<TransformedSource>;
};
function _createTransformer(
  conventionsOptions?: {},
  _preprocess?: typeof preprocess,
  _babelProcess?: (
    sourceText: string,
    sourcePath: string,
    transformOptions: TransformOptionsJest<TransformOptions>
  ) => TransformedSource,
): {
  canInstrument: boolean | undefined;
  getCacheKey: (fileData: string, filePath: string, options: TransformOptionsJest<TransformOptions>) => string;
  process: (sourceText: string, sourcePath: string, transformOptions: TransformOptionsJest<TransformOptions>) => TransformedSource;
  processAsync: (sourceText: string, sourcePath: string, transformOptions: TransformOptionsJest<TransformOptions>) => Promise<TransformedSource>;
};
function _createTransformer(
  conventionsOptions = {},
  // for testing
  _preprocess = preprocess,
  _babelProcess = babelTransformer.process.bind(babelTransformer),
  _preprocessAsync = preprocessAsync,
  _babelProcessAsync = babelTransformer.processAsync?.bind(babelTransformer)
) {
  const au2Options = preprocessOptions({
    isDev: env.NODE_ENV !== 'production',
    ...conventionsOptions as IOptionalPreprocessOptions,
  });

  function getCacheKey(
    fileData: string,
    filePath: string,
    options: TransformOptionsJest<TransformOptions>
  ): string {
    const babelKey = babelTransformer.getCacheKey!(fileData, filePath, options);
    return `${babelKey}:${JSON.stringify(au2Options)}`;
  }

  // Wrap babel-jest process
  function process(
    sourceText: string,
    sourcePath: string,
    transformOptions: TransformOptionsJest<TransformOptions>
  ): TransformedSource {
    const result = _preprocess(
      { path: sourcePath, contents: sourceText },
      au2Options,
      nodeFileUnitHost
    );
    if (result !== undefined) {
      return _babelProcess(result.code, sourcePath, transformOptions);
    }
    return _babelProcess(sourceText, sourcePath, transformOptions);
  }

  async function processAsync(
    sourceText: string,
    sourcePath: string,
    transformOptions: TransformOptionsJest<TransformOptions>
  ): Promise<TransformedSource> {
    const result = await _preprocessAsync(
      { path: sourcePath, contents: sourceText },
      au2Options,
      nodeFileUnitHostAsync
    );
    if (result !== undefined) {
      return _babelProcessAsync != null
        ? _babelProcessAsync(result.code, sourcePath, transformOptions)
        : Promise.resolve(_babelProcess(result.code, sourcePath, transformOptions));
    }
    return _babelProcessAsync != null
      ? _babelProcessAsync(sourceText, sourcePath, transformOptions)
      : Promise.resolve(_babelProcess(sourceText, sourcePath, transformOptions));
  }

  return {
    canInstrument: babelTransformer.canInstrument,
    getCacheKey,
    process,
    processAsync
  };
}

function createTransformer(conventionsOptions = {}) {
  return _createTransformer(conventionsOptions);
}

const { canInstrument, getCacheKey, process } = createTransformer();
export default { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
