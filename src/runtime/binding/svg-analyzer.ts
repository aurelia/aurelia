import { DI } from "../di";

export const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer');

export interface ISVGAnalyzer {
  isStandardSvgAttribute(nodeName: string, attributeName: string): boolean;
}

export const SVGAnalyzer: ISVGAnalyzer = {
  isStandardSvgAttribute(nodeName: string, attributeName: string): boolean {
    return false;
  }
};
