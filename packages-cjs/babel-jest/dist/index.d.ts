import { preprocess } from '@aurelia/plugin-conventions';
import { TransformOptions } from '@babel/core';
import type { Config } from '@jest/types';
import type { TransformOptions as TransformOptionsJest, TransformedSource } from '@jest/transform';
declare function _createTransformer(conventionsOptions?: {}, _preprocess?: typeof preprocess, _babelProcess?: (sourceText: string, sourcePath: string, options: TransformOptionsJest<TransformOptions>) => TransformedSource): {
    canInstrument: boolean | undefined;
    getCacheKey: (fileData: string, filePath: Config.Path, options: TransformOptionsJest<TransformOptions>) => string;
    process: (sourceText: string, sourcePath: Config.Path, transformOptions: TransformOptionsJest<TransformOptions>) => TransformedSource | string;
};
declare function createTransformer(conventionsOptions?: {}): {
    canInstrument: boolean | undefined;
    getCacheKey: (fileData: string, filePath: string, options: TransformOptionsJest<TransformOptions>) => string;
    process: (sourceText: string, sourcePath: string, transformOptions: TransformOptionsJest<TransformOptions>) => TransformedSource;
};
declare const _default: {
    canInstrument: boolean | undefined;
    getCacheKey: (fileData: string, filePath: string, options: TransformOptionsJest<TransformOptions>) => string;
    process: (sourceText: string, sourcePath: string, transformOptions: TransformOptionsJest<TransformOptions>) => TransformedSource;
    createTransformer: typeof createTransformer;
    _createTransformer: typeof _createTransformer;
};
export default _default;
//# sourceMappingURL=index.d.ts.map