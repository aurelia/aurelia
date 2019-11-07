import { Class, Constructable, IContainer, ResourceDefinition, ResourceType } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
export interface AttributePatternDefinition {
    pattern: string;
    symbols: string;
}
export declare class Interpretation {
    parts: readonly string[];
    get pattern(): string | null;
    set pattern(value: string | null);
    private _pattern;
    private readonly currentRecord;
    private readonly partsRecord;
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
    [pattern: string]: (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax;
}
export declare const IAttributePattern: import("@aurelia/kernel").InterfaceSymbol<IAttributePattern>;
declare type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<{} | IAttributePattern>, TClass>;
declare type DecoratedAttributePattern<TProto, TClass> = Class<TProto & IAttributePattern, TClass>;
declare type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;
export interface AttributePattern {
    readonly name: string;
    readonly definitionAnnotationKey: string;
    define<TProto, TClass>(patternDefs: AttributePatternDefinition[], Type: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass>;
    getPatternDefinitions<TProto, TClass>(Type: DecoratedAttributePattern<TProto, TClass>): AttributePatternDefinition[];
}
export declare function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator;
export declare class AttributePatternResourceDefinition implements ResourceDefinition<Constructable, IAttributePattern> {
    Type: ResourceType<Constructable, Partial<IAttributePattern>>;
    name: string;
    constructor(Type: ResourceType<Constructable, Partial<IAttributePattern>>);
    register(container: IContainer): void;
}
export declare const AttributePattern: AttributePattern;
export {};
//# sourceMappingURL=attribute-pattern.d.ts.map