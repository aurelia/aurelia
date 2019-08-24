import { AttrSyntax } from '@aurelia/jit';
import { DI } from '@aurelia/kernel';

export interface IAttrSyntaxTransformer {
  transform(node: HTMLElement, attrSyntax: AttrSyntax): void;
  map(tagName: string, attr: string): string;
}

export const IAttrSyntaxTransformer =
  DI
    .createInterface<IAttrSyntaxTransformer>('IAttrSyntaxTransformer')
    .noDefault();
