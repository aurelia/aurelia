import { IPlatform } from '../platform.js';
import type { IContainer, IResolver } from '@aurelia/kernel';
import type { INode } from '../dom.js';
export interface ISVGAnalyzer extends NoopSVGAnalyzer {
}
export declare const ISVGAnalyzer: import("@aurelia/kernel").InterfaceSymbol<ISVGAnalyzer>;
export declare class NoopSVGAnalyzer {
    isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}
export declare class SVGAnalyzer {
    static register(container: IContainer): IResolver<ISVGAnalyzer>;
    private readonly SVGElement;
    constructor(platform: IPlatform);
    isStandardSvgAttribute(node: INode, attributeName: string): boolean;
}
//# sourceMappingURL=svg-analyzer.d.ts.map