import { type ModifyCodeResult } from 'modify-code';
import { IFileUnit, IPreprocessOptions } from './options';
export interface ClassMetadata {
    name: string;
    members: string[];
}
export declare function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult;
//# sourceMappingURL=preprocess-resource.d.ts.map