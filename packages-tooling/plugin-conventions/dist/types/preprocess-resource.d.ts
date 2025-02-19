import { type ModifyCodeResult } from 'modify-code';
import { IFileUnit, IPreprocessOptions } from './options';
type AccessModifier = 'public' | 'protected' | 'private';
type MemberType = 'property' | 'method' | 'accessor';
export interface MethodArgument {
    name: string;
    type: string;
    isOptional: boolean;
    isSpread: boolean;
}
export interface ClassMember {
    accessModifier: AccessModifier;
    memberType: MemberType;
    name: string;
    dataType: string;
    methodArguments: MethodArgument[] | null;
}
export interface ClassMetadata {
    name: string;
    members: ClassMember[];
}
export declare function preprocessResource(unit: IFileUnit, options: IPreprocessOptions): ModifyCodeResult;
export {};
//# sourceMappingURL=preprocess-resource.d.ts.map