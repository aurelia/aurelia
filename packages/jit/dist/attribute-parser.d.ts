import { InterfaceSymbol } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
export interface IAttributeParser {
    parse(name: string, value: string): AttrSyntax;
}
export declare const IAttributeParser: InterfaceSymbol<IAttributeParser>;
//# sourceMappingURL=attribute-parser.d.ts.map