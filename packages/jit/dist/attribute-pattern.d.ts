import { Class, IRegistry } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
export interface AttributePatternDefinition {
    pattern: string;
    symbols: string;
}
export declare class Interpretation {
    parts: readonly string[];
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
export declare const ISyntaxInterpreter: import("@aurelia/kernel").InterfaceSymbol<ISyntaxInterpreter>;
export interface IAttributePattern {
    $patternDefs: AttributePatternDefinition[];
}
export interface IAttributePatternHandler {
    [pattern: string]: (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax;
}
export declare const IAttributePattern: import("@aurelia/kernel").InterfaceSymbol<IAttributePattern>;
declare type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<IAttributePattern | IAttributePatternHandler>, TClass> & Partial<IRegistry>;
declare type DecoratedAttributePattern<TProto, TClass> = Class<TProto & IAttributePattern | IAttributePatternHandler, TClass> & IRegistry;
declare type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;
export declare function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator;
export {};
//# sourceMappingURL=attribute-pattern.d.ts.map