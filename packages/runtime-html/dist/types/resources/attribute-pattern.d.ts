import type { Class, Constructable, IContainer, ResourceDefinition, ResourceType } from '@aurelia/kernel';
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
export interface ISyntaxInterpreter extends SyntaxInterpreter {
}
export declare const ISyntaxInterpreter: import("@aurelia/kernel").InterfaceSymbol<ISyntaxInterpreter>;
export declare class SyntaxInterpreter {
    rootState: State;
    private readonly initialStates;
    add(def: AttributePatternDefinition): void;
    add(defs: AttributePatternDefinition[]): void;
    interpret(name: string): Interpretation;
    getNextStates(states: State[], ch: string, interpretation: Interpretation): State[];
    private parse;
}
export declare class AttrSyntax {
    rawName: string;
    rawValue: string;
    target: string;
    command: string | null;
    constructor(rawName: string, rawValue: string, target: string, command: string | null);
}
export interface IAttributePattern {
    [pattern: string]: (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax;
}
export declare const IAttributePattern: import("@aurelia/kernel").InterfaceSymbol<IAttributePattern>;
export interface IAttributeParser extends AttributeParser {
}
export declare const IAttributeParser: import("@aurelia/kernel").InterfaceSymbol<IAttributeParser>;
export declare class AttributeParser {
    private readonly interpreter;
    private readonly cache;
    private readonly patterns;
    constructor(interpreter: ISyntaxInterpreter, attrPatterns: IAttributePattern[]);
    parse(name: string, value: string): AttrSyntax;
}
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
export declare class DotSeparatedAttributePattern {
    'PART.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    'PART.PART.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class RefAttributePattern {
    'ref'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
    'PART.ref'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class ColonPrefixedBindAttributePattern {
    ':PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export declare class AtPrefixedTriggerAttributePattern {
    '@PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax;
}
export {};
//# sourceMappingURL=attribute-pattern.d.ts.map