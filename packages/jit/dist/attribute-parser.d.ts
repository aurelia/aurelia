import { AttrSyntax } from './ast';
export interface IAttributeParser {
    parse(name: string, value: string): AttrSyntax;
}
export declare const IAttributeParser: import("@aurelia/kernel/dist/interfaces").InterfaceSymbol<IAttributeParser>;
//# sourceMappingURL=attribute-parser.d.ts.map