import { DI } from "../di";
import { INode } from "../dom";

export interface ISVGAnalyzer {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}

export const ISVGAnalyzer = DI.createInterface<ISVGAnalyzer>();

export const SVGAnalyzer: ISVGAnalyzer = {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean {
    return false;
  }
};
