import { preprocess } from '@aurelia/plugin-conventions';
import type { Config } from '@jest/types';
import type { TransformOptions, TransformedSource } from '@jest/transform';
declare function _createTransformer(conventionsOptions?: {}, _preprocess?: typeof preprocess, _tsProcess?: (fileContent: string, filePath: string, transformOptions: import("ts-jest/dist/types").TransformOptionsTsJest) => TransformedSource): {
    canInstrument: boolean;
    getCacheKey: (fileData: string, filePath: Config.Path, options: TransformOptions) => string;
    process: (sourceText: string, sourcePath: Config.Path, transformOptions: TransformOptions) => TransformedSource | string;
};
declare function createTransformer(conventionsOptions?: {}): {
    canInstrument: boolean;
    getCacheKey: (fileData: string, filePath: string, options: TransformOptions<unknown>) => string;
    process: (sourceText: string, sourcePath: string, transformOptions: TransformOptions<unknown>) => TransformedSource;
};
declare const _default: {
    canInstrument: boolean;
    getCacheKey: (fileData: string, filePath: string, options: TransformOptions<unknown>) => string;
    process: (sourceText: string, sourcePath: string, transformOptions: TransformOptions<unknown>) => TransformedSource;
    createTransformer: typeof createTransformer;
    _createTransformer: typeof _createTransformer;
};
export default _default;
//# sourceMappingURL=index.d.ts.map