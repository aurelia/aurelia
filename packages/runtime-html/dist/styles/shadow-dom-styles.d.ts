import { noop } from '@aurelia/kernel';
import { IPlatform } from '../platform';
declare type HasAdoptedStyleSheets = ShadowRoot & {
    adoptedStyleSheets: CSSStyleSheet[];
};
export declare const noopShadowDOMStyles: Readonly<{
    applyTo: typeof noop;
}>;
export declare const IShadowDOMStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export declare const IShadowDOMGlobalStyles: import("@aurelia/kernel").InterfaceSymbol<IShadowDOMStyles>;
export interface IShadowDOMStyles {
    applyTo(shadowRoot: ShadowRoot): void;
}
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
export {};
//# sourceMappingURL=shadow-dom-styles.d.ts.map