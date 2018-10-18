import { INode } from '@aurelia/runtime';
import { AttrSyntax } from './attribute-parser';
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
export declare class ElementSyntax {
    readonly node: Node;
    readonly name: string;
    readonly $content: ElementSyntax | null;
    readonly $children: ReadonlyArray<ElementSyntax>;
    readonly $attributes: ReadonlyArray<AttrSyntax>;
    constructor(node: Node, name: string, $content: ElementSyntax | null, $children: ReadonlyArray<ElementSyntax>, $attributes: ReadonlyArray<AttrSyntax>);
    static createMarker(): ElementSyntax;
}
export interface IElementParser {
    parse(markupOrNode: string | INode): ElementSyntax;
}
export declare const IElementParser: import("@aurelia/kernel/dist/di").InterfaceSymbol<IElementParser>;
//# sourceMappingURL=element-parser.d.ts.map