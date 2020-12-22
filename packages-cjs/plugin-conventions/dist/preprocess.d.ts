import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IOptionalPreprocessOptions } from './options.js';
export declare function preprocess(unit: IFileUnit, options: IOptionalPreprocessOptions, _fileExists?: typeof fileExists): ModifyCodeResult | undefined;
declare function fileExists(p: string): boolean;
export {};
//# sourceMappingURL=preprocess.d.ts.map