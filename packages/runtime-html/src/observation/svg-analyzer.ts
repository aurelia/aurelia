import { DI } from '@aurelia/kernel';
import { INode } from '../dom';

export interface ISVGAnalyzer {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}

export const ISVGAnalyzer = DI.createInterface<ISVGAnalyzer>('ISVGAnalyzer').withDefault(x => x.singleton(class {
  public isStandardSvgAttribute(node: INode, attributeName: string): boolean {
    return false;
  }
}));
