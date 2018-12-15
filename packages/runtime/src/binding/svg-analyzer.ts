import { DI } from '../../kernel';
import { INode } from '../dom';

export interface ISVGAnalyzer {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}

export const ISVGAnalyzer = DI.createInterface<ISVGAnalyzer>()
  .withDefault(x => x.singleton(class {
    public isStandardSvgAttribute(node: INode, attributeName: string): boolean {
      return false;
    }
  })
);
