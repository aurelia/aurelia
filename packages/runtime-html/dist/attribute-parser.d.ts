import { IAttributePattern, ISyntaxInterpreter } from './attribute-pattern';
export declare class AttrSyntax {
    rawName: string;
    rawValue: string;
    target: string;
    command: string | null;
    constructor(rawName: string, rawValue: string, target: string, command: string | null);
}
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
//# sourceMappingURL=attribute-parser.d.ts.map