export declare class AttrSyntax {
    readonly rawName: string;
    readonly rawValue: string;
    readonly target: string;
    readonly command: string | null;
    constructor(rawName: string, rawValue: string, target: string, command: string | null);
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
//# sourceMappingURL=ast.d.ts.map