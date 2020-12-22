import { IContainer, IRegistry } from '@aurelia/kernel';
import { IPlatform } from '../platform.js';
export declare function cssModules(...modules: (Record<string, string>)[]): CSSModulesProcessorRegistry;
export declare class CSSModulesProcessorRegistry implements IRegistry {
    private readonly modules;
    constructor(modules: Record<string, string>[]);
    register(container: IContainer): void;
}
export declare function shadowCSS(...css: (string | CSSStyleSheet)[]): ShadowDOMRegistry;
export interface IShadowDOMStyleFactory {
    createStyles(localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null): IShadowDOMStyles;
}
export declare const IShadowDOMStyleFactory: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyleFactory>;
export declare class ShadowDOMRegistry implements IRegistry {
    private readonly css;
    constructor(css: (string | CSSStyleSheet)[]);
    register(container: IContainer): void;
}
declare type HasAdoptedStyleSheets = ShadowRoot & {
    adoptedStyleSheets: CSSStyleSheet[];
};
export interface IShadowDOMStyles {
    applyTo(shadowRoot: ShadowRoot): void;
}
export declare const IShadowDOMStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export declare const IShadowDOMGlobalStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export declare class AdoptedStyleSheetsStyles implements IShadowDOMStyles {
    private readonly sharedStyles;
    private readonly styleSheets;
    constructor(p: IPlatform, localStyles: (string | CSSStyleSheet)[], styleSheetCache: Map<string, CSSStyleSheet>, sharedStyles?: IShadowDOMStyles | null);
    static supported(p: IPlatform): boolean;
    applyTo(shadowRoot: HasAdoptedStyleSheets): void;
}
export declare class StyleElementStyles implements IShadowDOMStyles {
    private readonly p;
    private readonly localStyles;
    private readonly sharedStyles;
    constructor(p: IPlatform, localStyles: string[], sharedStyles?: IShadowDOMStyles | null);
    applyTo(shadowRoot: ShadowRoot): void;
}
export interface IShadowDOMConfiguration {
    sharedStyles?: (string | CSSStyleSheet)[];
}
export declare const StyleConfiguration: {
    shadowDOM(config: IShadowDOMConfiguration): IRegistry;
};
export {};
//# sourceMappingURL=styles.d.ts.map