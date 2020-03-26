import { IContainer, IRegistry } from '@aurelia/kernel';
import { IShadowDOMStyles } from './shadow-dom-styles';
export declare function shadowCSS(...css: (string | CSSStyleSheet)[]): ShadowDOMRegistry;
export interface IShadowDOMStyleFactory {
    createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}
export declare const IShadowDOMStyleFactory: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyleFactory>;
export declare class ShadowDOMRegistry implements IRegistry {
    private readonly css;
    constructor(css: (string | CSSStyleSheet)[]);
    register(container: IContainer): void;
    static createStyleFactory(container: IContainer): IShadowDOMStyleFactory;
}
//# sourceMappingURL=shadow-dom-registry.d.ts.map