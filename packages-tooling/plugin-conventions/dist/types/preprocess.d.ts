import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IOptionalPreprocessOptions } from './options';
import { fileExists, readFile } from './file-exists';
export declare function preprocess(unit: IFileUnit, options: IOptionalPreprocessOptions, _fileExists?: typeof fileExists, _readFile?: typeof readFile): ModifyCodeResult | undefined;
//# sourceMappingURL=preprocess.d.ts.map