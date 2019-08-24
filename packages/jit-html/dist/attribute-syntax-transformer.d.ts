import { AttrSyntax } from '@aurelia/jit';
export interface IAttrSyntaxTransformer {
    transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
    map(tagName: string, attr: string): string;
}
export declare const IAttrSyntaxTransformer: import("@aurelia/kernel").InterfaceSymbol<IAttrSyntaxTransformer>;
//# sourceMappingURL=attribute-syntax-transformer.d.ts.map