import { AttrSyntax } from './resources/attribute-pattern';
export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {
}
export declare const IAttrSyntaxTransformer: import("@aurelia/kernel").InterfaceSymbol<IAttrSyntaxTransformer>;
export declare class AttrSyntaxTransformer {
    transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
    map(tagName: string, attr: string): string;
}
//# sourceMappingURL=attribute-syntax-transformer.d.ts.map