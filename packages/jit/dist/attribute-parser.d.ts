export declare class AttrSyntax {
    readonly rawName: string;
    readonly rawValue: string;
    readonly target: string;
    readonly command: string | null;
    constructor(rawName: string, rawValue: string, target: string, command: string | null);
}
export interface IAttributeParser {
    parse(name: string, value: string): AttrSyntax;
}
export declare const IAttributeParser: import("@aurelia/kernel/dist/di").InterfaceSymbol<IAttributeParser>;
//# sourceMappingURL=attribute-parser.d.ts.map