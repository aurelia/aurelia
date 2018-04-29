import { DI } from "../di";
import { INode } from "../dom";

export const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer');

export interface ISVGAnalyzer {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}

export const SVGAnalyzer: ISVGAnalyzer = {
  isStandardSvgAttribute(node: INode, attributeName: string): boolean {
    return false;
  }
};
