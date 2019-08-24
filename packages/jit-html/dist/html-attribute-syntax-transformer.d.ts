import { AttrSyntax } from '@aurelia/jit';
import { IContainer, IResolver } from '@aurelia/kernel';
import { IAttrSyntaxTransformer } from './attribute-syntax-transformer';
export declare class HtmlAttrSyntaxTransformer implements IAttrSyntaxTransformer {
    static register(container: IContainer): IResolver<IAttrSyntaxTransformer>;
    transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
    map(tagName: string, attr: string): string;
}
//# sourceMappingURL=html-attribute-syntax-transformer.d.ts.map