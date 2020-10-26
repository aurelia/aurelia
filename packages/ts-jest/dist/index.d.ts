import { preprocess } from '@aurelia/plugin-conventions';
import type { Config } from '@jest/types';
import type { TransformOptions, TransformedSource, CacheKeyOptions } from '@jest/transform';
declare function _createTransformer(conventionsOptions?: {}, _preprocess?: typeof preprocess, _tsProcess?: (input: string, filePath: string, jestConfig: Config.ProjectConfig, transformOptions?: TransformOptions | undefined) => TransformedSource): {
    canInstrument: boolean;
    getCacheKey: (fileData: string, filePath: Config.Path, configStr: string, options: CacheKeyOptions) => string;
    process: (sourceText: string, sourcePath: Config.Path, config: Config.ProjectConfig, transformOptions?: TransformOptions | undefined) => TransformedSource;
};
declare function createTransformer(conventionsOptions?: {}): {
    canInstrument: boolean;
    getCacheKey: (fileData: string, filePath: string, configStr: string, options: CacheKeyOptions) => string;
    process: (sourceText: string, sourcePath: string, config: Config.ProjectConfig, transformOptions?: TransformOptions | undefined) => TransformedSource;
};
declare const canInstrument: boolean, getCacheKey: (fileData: string, filePath: Config.Path, configStr: string, options: CacheKeyOptions) => string, process: (sourceText: string, sourcePath: Config.Path, config: Config.ProjectConfig, transformOptions?: TransformOptions | undefined) => TransformedSource;
export { canInstrument, getCacheKey, process, createTransformer, _createTransformer };
//# sourceMappingURL=index.d.ts.map