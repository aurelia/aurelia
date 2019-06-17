import { Class, IRegistry } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
export interface AttributePatternDefinition {
    pattern: string;
    symbols: string;
}
export declare class Interpretation {
    parts: ReadonlyArray<string>;
    pattern: string | null;
    private _pattern;
    private readonly currentRecord;
    private readonly partsRecord;
    constructor();
    append(pattern: string, ch: string): void;
    next(pattern: string): void;
}
export interface ISyntaxInterpreter {
    add(def: AttributePatternDefinition): void;
    add(defs: AttributePatternDefinition[]): void;
    add(defOrDefs: AttributePatternDefinition | AttributePatternDefinition[]): void;
    interpret(value: string): Interpretation;
}
export declare const ISyntaxInterpreter: import("@aurelia/kernel/dist/di").InterfaceSymbol<ISyntaxInterpreter>;
export interface IAttributePattern {
    $patternDefs: AttributePatternDefinition[];
}
export interface IAttributePatternHandler {
    [pattern: string]: (rawName: string, rawValue: string, parts: ReadonlyArray<string>) => AttrSyntax;
}
export declare const IAttributePattern: import("@aurelia/kernel/dist/di").InterfaceSymbol<IAttributePattern>;
declare type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<IAttributePattern | IAttributePatternHandler>, TClass> & Partial<IRegistry>;
declare type DecoratedAttributePattern<TProto, TClass> = Class<TProto & IAttributePattern | IAttributePatternHandler, TClass> & IRegistry;
declare type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;
export declare function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator;
export interface DotSeparatedAttributePattern extends IAttributePattern {
}
export declare class DotSeparatedAttributePattern implements DotSeparatedAttributePattern {
    static register: IRegistry['register'];
    ['PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['PART.PART.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export interface RefAttributePattern extends IAttributePattern {
}
export declare class RefAttributePattern implements RefAttributePattern {
    static register: IRegistry['register'];
    ['ref'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    ['ref.PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export interface ColonPrefixedBindAttributePattern extends IAttributePattern {
}
export declare class ColonPrefixedBindAttributePattern implements ColonPrefixedBindAttributePattern {
    static register: IRegistry['register'];
    [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export interface AtPrefixedTriggerAttributePattern extends IAttributePattern {
}
export declare class AtPrefixedTriggerAttributePattern implements AtPrefixedTriggerAttributePattern {
    static register: IRegistry['register'];
    ['@PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export {};
//# sourceMappingURL=attribute-pattern.d.ts.map