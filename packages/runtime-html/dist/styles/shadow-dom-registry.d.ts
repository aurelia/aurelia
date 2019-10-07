import { IContainer, IRegistry } from '@aurelia/kernel';
import { IShadowDOMStyles } from './shadow-dom-styles';
export declare type ShadowDOMStylesFactory = (localStyles: (string | CSSStyleSheet)[], sharedStyles: IShadowDOMStyles | null) => IShadowDOMStyles;
export declare class ShadowDOMRegistry implements IRegistry {
    private readonly sharedStyles;
    private readonly createStyles;
    constructor(sharedStyles: IShadowDOMStyles, createStyles: ShadowDOMStylesFactory);
    register(container: IContainer, ...params: (string | CSSStyleSheet)[]): void;
}
//# sourceMappingURL=shadow-dom-registry.d.ts.map