import { AttrSyntax } from './ast';
export declare class DotSeparatedAttributePattern {
    ['PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class RefAttributePattern {
    ['ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class ColonPrefixedBindAttributePattern {
    [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class AtPrefixedTriggerAttributePattern {
    ['@PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
//# sourceMappingURL=attribute-patterns.d.ts.map