import { IContainer, IResolver } from '@aurelia/kernel';
import { AttrSyntax } from './attribute-parser';
export interface IAttrSyntaxTransformer extends AttrSyntaxTransformer {
}
export declare const IAttrSyntaxTransformer: import("@aurelia/kernel").InterfaceSymbol<IAttrSyntaxTransformer>;
export declare class AttrSyntaxTransformer implements IAttrSyntaxTransformer {
    static register(container: IContainer): IResolver<IAttrSyntaxTransformer>;
    transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
    map(tagName: string, attr: string): string;
}
//# sourceMappingURL=attribute-syntax-transformer.d.ts.map