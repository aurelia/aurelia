import { INode } from '@aurelia/runtime';
import { ElementSyntax } from './ast';
export declare const enum NodeType {
    Element = 1,
    Attr = 2,
    Text = 3,
    CDATASection = 4,
    EntityReference = 5,
    Entity = 6,
    ProcessingInstruction = 7,
    Comment = 8,
    Document = 9,
    DocumentType = 10,
    DocumentFragment = 11,
    Notation = 12
}
export interface IElementParser {
    parse(markupOrNode: string | INode): ElementSyntax;
}
export declare const IElementParser: import("@aurelia/kernel/dist/di").InterfaceSymbol<IElementParser>;
//# sourceMappingURL=element-parser.d.ts.map