import { IOptionalPreprocessOptions, preprocess, preprocessAsync, preprocessOptions } from '@aurelia/plugin-conventions';
import { nodeFileUnitHost, nodeFileUnitHostAsync } from '@aurelia/plugin-conventions/node';
import tsJest, { TsJestTransformerOptions } from 'ts-jest';
import * as TsJest from 'ts-jest';
import type { TransformOptions, TransformedSource } from '@jest/transform';
import * as path from 'path';
import { env } from 'process';

// eslint-disable-next-line
const tsJestCreateTransformer = (TsJest as any).createTransformer;
// making both esm and cjs work without any issues
const $createTransformer = (typeof tsJest.createTransformer === 'function'
  ? tsJest.createTransformer
  // eslint-disable-next-line
  : typeof (tsJest as any).default?.createTransformer === 'function'
    // eslint-disable-next-line
    ? (tsJest as any).default.createTransformer
    : (() => { throw new Error('Unable to import createTransformer from "ts-jest"'); })
) as typeof tsJest.createTransformer;

const tsTransformer = $createTransformer({ isolatedModules: true });

function _createTransformer(
  conventionsOptions?: {},
  _preprocess?: typeof preprocess,
  _tsProcess?: (
    sourceText: string,
    sourcePath: string,
    transformOptions: TsJest.TsJestTransformOptions
  ) => TransformedSource,
): {
  canInstrument: boolean;
  getCacheKey: (fileData: string, filePath: string, options: TransformOptions<TsJestTransformerOptions>) => string;
  process: (sourceText: string, sourcePath: string, transformOptions: TransformOptions<TsJestTransformerOptions>) => TransformedSource;
  processAsync: (sourceText: string, sourcePath: string, transformOptions: TransformOptions<TsJestTransformerOptions>) => Promise<TransformedSource>;
};
function _createTransformer(
  conventionsOptions = {},
  // for testing
  _preprocess = preprocess,
  _tsProcess = tsTransformer.process.bind(tsTransformer),
  _preprocessAsync = preprocessAsync,
  _tsProcessAsync = tsTransformer.processAsync?.bind(tsTransformer)
) {
  const au2Options = preprocessOptions({
    isDev: env.NODE_ENV !== 'production',
    ...conventionsOptions as IOptionalPreprocessOptions,
  });

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
      au2Options,
      nodeFileUnitHost
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

  async function processAsync(
    sourceText: string,
    sourcePath: string,
    transformOptions:  TransformOptions<TsJestTransformerOptions>
  ): Promise<TransformedSource> {
    const result = await _preprocessAsync(
      { path: sourcePath, contents: sourceText },
      au2Options,
      nodeFileUnitHostAsync
    );
    let newSourcePath = sourcePath;
    if (result !== undefined) {
      let newCode = result.code;
      if (au2Options.templateExtensions.includes(path.extname(sourcePath))) {
        newSourcePath += '.ts';
        newCode = `// @ts-nocheck\n${newCode}`;
      }
      return _tsProcessAsync != null
        ? _tsProcessAsync(newCode, newSourcePath, transformOptions)
        : Promise.resolve(_tsProcess(newCode, newSourcePath, transformOptions));
    }
    return _tsProcessAsync != null
      ? _tsProcessAsync(sourceText, sourcePath, transformOptions)
      : Promise.resolve(_tsProcess(sourceText, sourcePath, transformOptions));
  }

  return {
    canInstrument: false,
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
